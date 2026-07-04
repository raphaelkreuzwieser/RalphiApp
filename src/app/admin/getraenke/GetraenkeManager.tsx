"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Card, Btn, SectionTitle, DrinkImg } from "@/components/ui";
import { createDrink, updateDrink, deleteDrink, type AdminState } from "../actions";

export interface DrinkRow {
  id: string;
  name: string;
  image_url: string | null;
  active: boolean;
  sort: number;
}

const input =
  "w-full rounded-[10px] border border-line bg-panel2 p-2.5 text-[14px] text-creme placeholder:text-muted focus:border-rot focus:outline-none";

export function GetraenkeManager({ drinks }: { drinks: DrinkRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [eName, setEName] = useState("");
  const [eUrl, setEUrl] = useState("");
  const [eSort, setESort] = useState("100");
  const [nName, setNName] = useState("");
  const [nUrl, setNUrl] = useState("");
  const [nSort, setNSort] = useState("100");

  function run(action: () => Promise<AdminState>, after?: () => void) {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (res.error) setError(res.error);
      else {
        after?.();
        router.refresh();
      }
    });
  }

  return (
    <>
      <SectionTitle>Einzelgetränke für Check-in</SectionTitle>
      {error && (
        <div className="mb-3 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-3 text-[13px] text-creme">
          {error}
        </div>
      )}

      {drinks.map((d) => (
        <Card key={d.id} className="mb-2">
          {editId === d.id ? (
            <div className="flex flex-col gap-2">
              <input className={input} value={eName} onChange={(e) => setEName(e.target.value)}
                placeholder="Name" />
              <input className={input} value={eUrl} onChange={(e) => setEUrl(e.target.value)}
                placeholder="Bild-URL (Shopify-CDN)" />
              <div className="flex gap-2">
                <input className={`${input} w-24`} value={eSort} inputMode="numeric"
                  onChange={(e) => setESort(e.target.value)} placeholder="Sort" />
                <Btn kind="gold" className="px-3 py-2" disabled={pending}
                  onClick={() =>
                    run(
                      () => updateDrink(d.id, eName, eUrl, parseInt(eSort, 10), d.active),
                      () => setEditId(null),
                    )
                  }>
                  <Check size={14} /> Speichern
                </Btn>
                <Btn kind="ghost" className="px-3 py-2" onClick={() => setEditId(null)}>
                  <X size={14} />
                </Btn>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <DrinkImg src={d.image_url} size={40} />
                <div>
                  <div className="text-sm font-semibold text-creme">{d.name}</div>
                  <div className="text-[11px] text-muted">
                    Sort {d.sort} · {d.active ? "aktiv" : "inaktiv"}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Btn kind="ghost" className="px-2.5 py-1.5" onClick={() => {
                  setEditId(d.id);
                  setEName(d.name);
                  setEUrl(d.image_url ?? "");
                  setESort(String(d.sort));
                }}>
                  <Pencil size={13} />
                </Btn>
                <Btn kind={d.active ? "ghost" : "danger"} className="px-2.5 py-1.5 text-xs"
                  disabled={pending}
                  onClick={() =>
                    run(() => updateDrink(d.id, d.name, d.image_url ?? "", d.sort, !d.active))
                  }>
                  {d.active ? "An" : "Aus"}
                </Btn>
                <button aria-label="Löschen" className="px-1 text-muted" disabled={pending}
                  onClick={() => run(() => deleteDrink(d.id))}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        </Card>
      ))}

      <SectionTitle>Neues Getränk</SectionTitle>
      <Card className="flex flex-col gap-2">
        <input className={input} placeholder="Name (z. B. Shot Marille)" value={nName}
          onChange={(e) => setNName(e.target.value)} />
        <input className={input} placeholder="Bild-URL (Shopify-CDN)" value={nUrl}
          onChange={(e) => setNUrl(e.target.value)} />
        <div className="flex gap-2">
          <input className={`${input} w-24`} placeholder="Sort" inputMode="numeric" value={nSort}
            onChange={(e) => setNSort(e.target.value)} />
          <Btn className="flex-1 px-3 py-2" disabled={pending || !nName.trim()}
            onClick={() =>
              run(
                () => createDrink(nName, nUrl, parseInt(nSort, 10)),
                () => {
                  setNName("");
                  setNUrl("");
                  setNSort("100");
                },
              )
            }>
            <Plus size={16} /> Anlegen
          </Btn>
        </div>
      </Card>
    </>
  );
}
