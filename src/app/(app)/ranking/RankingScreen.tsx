"use client";

import { useState } from "react";
import { Card } from "@/components/ui";

type RankView = "official" | "events";

// Platzhalter-Länder für M1 (kommen in M3 dynamisch aus `countries`).
const PLACEHOLDER_COUNTRIES = [
  { id: "EU", name: "Europa", flag: "🇪🇺" },
  { id: "AT", name: "Österreich", flag: "🇦🇹" },
  { id: "DE", name: "Deutschland", flag: "🇩🇪" },
  { id: "IT", name: "Italien", flag: "🇮🇹" },
];

export function RankingScreen() {
  const [view, setView] = useState<RankView>("official");
  const [land, setLand] = useState("EU");

  return (
    <>
      {/* Segment-Umschalter Offiziell | Events */}
      <div className="mb-3.5 flex gap-1 rounded-full bg-panel p-1">
        {(
          [
            ["official", "🏆 Offiziell"],
            ["events", "🎉 Events"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={`flex-1 rounded-full py-[9px] text-[13px] font-bold ${
              view === k ? "bg-rot text-white" : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "official" ? (
        <>
          <div className="mb-3.5 flex gap-1.5 overflow-x-auto">
            {PLACEHOLDER_COUNTRIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setLand(c.id)}
                className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-bold ${
                  land === c.id ? "bg-rot text-white" : "bg-panel2 text-muted"
                }`}
              >
                {c.flag} {c.name}
              </button>
            ))}
          </div>
          <Card>
            <div className="text-center text-muted">Noch keine freigegebenen Zeiten.</div>
          </Card>
          <p className="mt-3 text-center text-xs text-muted">
            Das offizielle Ranking (Länder-Pills dynamisch, Realtime-Updates) wird in M3
            angebunden.
          </p>
        </>
      ) : (
        <>
          <Card>
            <div className="text-center text-muted">Noch keine aktiven Events.</div>
          </Card>
          <p className="mt-3 text-center text-xs text-muted">
            ℹ️ Event-Zeiten zählen nur intern. Ins offizielle Ranking kommen Läufe nur mit
            Videobeweis nach Prüfung durchs Gschpusi-Team. (Events: M5)
          </p>
        </>
      )}
    </>
  );
}
