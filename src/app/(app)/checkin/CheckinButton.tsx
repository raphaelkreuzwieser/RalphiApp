"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassWater, MapPin, Plus, Loader2 } from "lucide-react";
import { Btn, Card, DrinkImg } from "@/components/ui";
import { Toggle } from "@/components/Toggle";
import { BottomSheet } from "@/components/BottomSheet";
import { LOGOS } from "@/lib/assets";
import { getCurrentLocation } from "@/lib/geo";
import { doCheckin } from "./actions";

export interface DrinkOption {
  id: string;
  name: string;
  imageUrl: string | null;
}

export function CheckinButton({
  drinks,
  defaultShareLocation = true,
}: {
  drinks: DrinkOption[];
  defaultShareLocation?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<DrinkOption | "__custom" | null>(null);
  const [custom, setCustom] = useState("");
  const [shareLoc, setShareLoc] = useState(defaultShareLocation);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setOpen(false);
    setSelected(null);
    setCustom("");
    setBusy(false);
    setError(null);
  }

  async function submit() {
    setError(null);
    const drinkName = selected === "__custom" ? custom.trim() : selected?.name ?? "";
    const drinkId = selected && selected !== "__custom" ? selected.id : null;
    if (!drinkName) return setError("Bitte wähle ein Getränk.");

    setBusy(true);
    let locationText: string | null = null;
    let lat: number | null = null;
    let lng: number | null = null;

    if (shareLoc) {
      try {
        const geo = await getCurrentLocation();
        locationText = geo.locationText;
        lat = geo.lat;
        lng = geo.lng;
      } catch {
        locationText = null; // Standort nicht verfügbar -> ohne Standort einchecken
      }
    }

    const res = await doCheckin({ drinkId, drinkName, locationText, lat, lng });
    setBusy(false);
    if (res.error) return setError(res.error);
    reset();
    router.refresh();
  }

  return (
    <>
      <Btn onClick={() => setOpen(true)} className="w-full">
        <GlassWater size={17} /> Was trinkst du gerade?
      </Btn>

      <BottomSheet open={open} onClose={reset} title="Drink Check-in 🍻">
        <div className="mb-3 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGOS.bar} alt="Gschpusi Bar" className="h-12 w-auto" />
        </div>

        {error && (
          <div className="mb-3 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-3 text-[13px] text-creme">
            {error}
          </div>
        )}

        <div className="mb-3 grid grid-cols-3 gap-2">
          {drinks.map((d) => {
            const active = selected !== "__custom" && selected?.id === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelected(d)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border px-1.5 py-2.5 ${
                  active ? "border-rot bg-[rgba(232,40,60,0.16)]" : "border-line bg-panel2"
                }`}
              >
                <DrinkImg src={d.imageUrl} size={52} />
                <span className={`text-center text-[11px] font-bold leading-tight ${active ? "text-bussi" : "text-creme"}`}>
                  {d.name}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setSelected("__custom")}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed px-1.5 py-2.5 text-[11px] font-bold text-muted ${
              selected === "__custom" ? "border-rot" : "border-line"
            }`}
          >
            <Plus size={22} /> Eigenes Getränk
          </button>
        </div>

        {selected === "__custom" && (
          <input
            className="mb-3 w-full rounded-[10px] border border-line bg-panel2 p-3 text-[15px] text-creme"
            placeholder="Was trinkst du?"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
        )}

        <Card className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] text-creme">
            <MapPin size={15} className="text-bussi" /> Standort teilen (nur Freunde)
          </div>
          <Toggle on={shareLoc} onClick={() => setShareLoc((v) => !v)} label="Standort teilen" />
        </Card>

        <Btn className="w-full" disabled={busy} onClick={submit}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <GlassWater size={16} />}{" "}
          Einchecken
        </Btn>
        <p className="mt-2.5 text-center text-[11px] text-muted">
          Sichtbar nur für bestätigte Freunde · bleibt bis zum nächsten Check-in.
        </p>
      </BottomSheet>
    </>
  );
}
