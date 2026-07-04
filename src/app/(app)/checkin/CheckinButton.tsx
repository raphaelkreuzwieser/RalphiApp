"use client";

import { useState } from "react";
import { GlassWater, MapPin, Plus } from "lucide-react";
import { Btn, Card, DrinkImg } from "@/components/ui";
import { Toggle } from "@/components/Toggle";
import { BottomSheet } from "@/components/BottomSheet";
import { SEED_DRINKS, LOGOS } from "@/lib/assets";

/**
 * CTA "Was trinkst du gerade?" mit Check-in-Sheet.
 * In M1 die volle UI (Getränke-Grid, Standort-Toggle); der echte Insert
 * + Geolocation/Reverse-Geocoding folgt in M6 (Social).
 */
export function CheckinButton() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [shareLoc, setShareLoc] = useState(true);

  return (
    <>
      <Btn onClick={() => setOpen(true)} className="w-full">
        <GlassWater size={17} /> Was trinkst du gerade?
      </Btn>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Drink Check-in 🍻">
        <div className="mb-3 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGOS.bar} alt="Gschpusi Bar" className="h-12 w-auto" />
        </div>
        <div className="mb-3 grid grid-cols-3 gap-2">
          {SEED_DRINKS.map((d) => (
            <button
              key={d.name}
              onClick={() => setSelected(d.name)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border px-1.5 py-2.5 ${
                selected === d.name
                  ? "border-rot bg-[rgba(232,40,60,0.16)]"
                  : "border-line bg-panel2"
              }`}
            >
              <DrinkImg src={d.imageUrl} size={52} />
              <span
                className={`text-center text-[11px] font-bold leading-tight ${
                  selected === d.name ? "text-bussi" : "text-creme"
                }`}
              >
                {d.name}
              </span>
            </button>
          ))}
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

        <Btn className="w-full" disabled>
          <GlassWater size={16} /> Einchecken
        </Btn>
        <p className="mt-2.5 text-center text-[11px] text-muted">
          Sichtbar nur für bestätigte Freunde · bleibt bis zum nächsten Check-in.
          <br />
          (Einchecken wird in M6 aktiv.)
        </p>
      </BottomSheet>
    </>
  );
}
