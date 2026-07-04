"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Check, X } from "lucide-react";
import { Card, Btn, SectionTitle } from "@/components/ui";
import { createCountry, updateCountry, toggleCountryActive, type AdminState } from "../actions";

export interface CountryRow {
  id: string;
  name: string;
  flag: string;
  active: boolean;
  count: number;
}

const input =
  "w-full rounded-[10px] border border-line bg-panel2 p-2.5 text-[14px] text-creme placeholder:text-muted focus:border-rot focus:outline-none";

export function LaenderManager({ countries }: { countries: CountryRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFlag, setEditFlag] = useState("");
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newFlag, setNewFlag] = useState("");

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
      <SectionTitle>Länder &amp; Rankings verwalten</SectionTitle>
      {error && (
        <div className="mb-3 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-3 text-[13px] text-creme">
          {error}
        </div>
      )}

      {countries.map((c) => (
        <Card key={c.id} className="mb-2">
          {editId === c.id ? (
            <div className="flex items-center gap-2">
              <input
                className={`${input} w-16`}
                value={editFlag}
                onChange={(e) => setEditFlag(e.target.value)}
                aria-label="Flagge"
              />
              <input
                className={input}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                aria-label="Name"
              />
              <Btn
                kind="gold"
                className="px-3 py-2"
                disabled={pending}
                onClick={() => run(() => updateCountry(c.id, editName, editFlag), () => setEditId(null))}
              >
                <Check size={14} />
              </Btn>
              <Btn kind="ghost" className="px-3 py-2" onClick={() => setEditId(null)}>
                <X size={14} />
              </Btn>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="font-bold text-creme">
                {c.flag} {c.name}{" "}
                <span className="text-xs font-normal text-muted">({c.count} Einträge)</span>
              </div>
              <div className="flex gap-1.5">
                <Btn
                  kind="ghost"
                  className="px-2.5 py-1.5 text-xs"
                  onClick={() => {
                    setEditId(c.id);
                    setEditName(c.name);
                    setEditFlag(c.flag);
                  }}
                >
                  <Pencil size={13} />
                </Btn>
                <Btn
                  kind={c.active ? "ghost" : "danger"}
                  className="px-2.5 py-1.5 text-xs"
                  disabled={pending}
                  onClick={() => run(() => toggleCountryActive(c.id, !c.active))}
                >
                  {c.active ? "Aktiv" : "Deaktiviert"}
                </Btn>
              </div>
            </div>
          )}
        </Card>
      ))}

      <SectionTitle>Neues Land</SectionTitle>
      <Card>
        <div className="flex gap-2">
          <input
            className={`${input} w-16`}
            placeholder="🇨🇭"
            value={newFlag}
            onChange={(e) => setNewFlag(e.target.value)}
            aria-label="Flagge"
          />
          <input
            className={`${input} w-20`}
            placeholder="CH"
            value={newId}
            onChange={(e) => setNewId(e.target.value.toUpperCase())}
            maxLength={3}
            aria-label="Länder-ID"
          />
          <input
            className={input}
            placeholder="Schweiz"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            aria-label="Name"
          />
          <Btn
            className="px-3 py-2"
            disabled={pending || !newId.trim() || !newName.trim()}
            onClick={() =>
              run(
                () => createCountry(newId, newName, newFlag),
                () => {
                  setNewId("");
                  setNewName("");
                  setNewFlag("");
                },
              )
            }
          >
            <Plus size={16} />
          </Btn>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          ID = Ländercode (z. B. CH). Neues Land erscheint sofort als Ranking-Tab.
        </p>
      </Card>
    </>
  );
}
