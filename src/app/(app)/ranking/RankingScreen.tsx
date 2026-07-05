"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Play, Trophy, Plus } from "lucide-react";
import { Card, Btn, SectionTitle } from "@/components/ui";
import { LedTime } from "@/components/LedTime";
import { VideoOverlay } from "@/components/VideoOverlay";
import type { Country, RankingRow } from "@/lib/database.types";
import type { EventOverview } from "@/lib/events";
import { createEvent } from "../events/actions";

type RankView = "official" | "events";

export function RankingScreen({
  rows,
  countries,
  myUsername,
  events,
}: {
  rows: RankingRow[];
  countries: Country[];
  myUsername: string | null;
  events: EventOverview[];
}) {
  const router = useRouter();
  const [view, setView] = useState<RankView>("official");
  const [land, setLand] = useState("EU");
  const [videoEntry, setVideoEntry] = useState<RankingRow | null>(null);
  const [newEventName, setNewEventName] = useState("");
  const [creating, startCreate] = useTransition();
  const [eventError, setEventError] = useState<string | null>(null);

  function create() {
    setEventError(null);
    startCreate(async () => {
      const res = await createEvent(newEventName);
      if (res.error) setEventError(res.error);
      else if (res.eventId) router.push(`/events/${res.eventId}`);
    });
  }

  const flagOf = useMemo(() => {
    const m = new Map(countries.map((c) => [c.id, c.flag]));
    return (id: string) => m.get(id) ?? "🌍";
  }, [countries]);

  const filtered = useMemo(
    () => (land === "EU" ? rows : rows.filter((r) => r.country_id === land)),
    [rows, land],
  );

  const pills = [{ id: "EU", name: "Europa", flag: "🇪🇺" }, ...countries];

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
            {pills.map((c) => (
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

          {filtered.length === 0 ? (
            <Card>
              <div className="text-center text-muted">Noch keine freigegebenen Zeiten.</div>
            </Card>
          ) : (
            filtered.map((row, i) => {
              const isMe = myUsername != null && row.username === myUsername;
              const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : String(i + 1);
              return (
                <Card
                  key={row.id}
                  className={`mb-2 flex items-center gap-3 ${i === 0 ? "!border-gold" : ""}`}
                >
                  <div
                    className={`min-w-[34px] text-center font-extrabold ${
                      i < 3 ? "text-[22px]" : "text-[15px]"
                    } ${i === 0 ? "text-gold" : "text-creme"}`}
                  >
                    {medal}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${isMe ? "text-bussi" : "text-creme"}`}>
                      @{row.username} <span className="text-xs">{flagOf(row.country_id)}</span>
                    </div>
                    <LedTime seconds={row.time_seconds} size="sm" className="block text-lg" />
                  </div>
                  {row.video_public && (
                    <Btn
                      kind="soft"
                      className="px-3 py-2 text-xs"
                      onClick={() => setVideoEntry(row)}
                    >
                      <Play size={13} /> Video
                    </Btn>
                  )}
                </Card>
              );
            })
          )}
        </>
      ) : (
        <>
          {events.length === 0 ? (
            <Card>
              <div className="text-center text-muted">
                Noch keine aktiven Events – starte die erste Challenge! 🎉
              </div>
            </Card>
          ) : (
            events.map((ev) => (
              <Link key={ev.id} href={`/events/${ev.id}`}>
                <Card className="mb-2.5">
                  <div className="flex items-center justify-between gap-2.5">
                    <div>
                      <div className="text-[15px] font-extrabold text-creme">🎉 {ev.name}</div>
                      <div className="mt-0.5 text-xs text-muted">
                        Event-Admin:{" "}
                        <span className="font-bold text-bussi">@{ev.adminUsername}</span> ·{" "}
                        {ev.confirmedCount} Zeiten
                        {ev.isMine && ev.pendingCount > 0 && (
                          <span className="text-gold"> · {ev.pendingCount} zu prüfen!</span>
                        )}
                      </div>
                    </div>
                    <Trophy size={20} className="text-gold" />
                  </div>
                </Card>
              </Link>
            ))
          )}

          <SectionTitle>Eigene Challenge starten</SectionTitle>
          <Card>
            <div className="mb-2.5 text-[13px] text-muted">
              Erstell ein internes Ranking für dein Fest, deine Bar oder dein Festival. Du wirst
              automatisch Event-Admin und bestätigst die Zeiten deiner Gäste.
            </div>
            {eventError && (
              <div className="mb-2.5 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-2.5 text-[13px] text-creme">
                {eventError}
              </div>
            )}
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-[10px] border border-line bg-panel2 p-3 text-[15px] text-creme placeholder:text-muted focus:border-rot focus:outline-none"
                placeholder='z. B. "Beachparty XXL – Wels"'
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
              />
              <Btn className="px-3 py-2" disabled={creating || newEventName.trim().length < 3} onClick={create}>
                <Plus size={16} />
              </Btn>
            </div>
          </Card>
          <p className="mt-2.5 text-center text-xs text-muted">
            ℹ️ Event-Zeiten zählen nur intern. Ins offizielle Ranking kommen Läufe nur mit
            Videobeweis nach Prüfung durchs Gschpusi-Team.
          </p>
        </>
      )}

      {videoEntry && (
        <VideoOverlay
          submissionId={videoEntry.id}
          username={videoEntry.username}
          timeSeconds={videoEntry.time_seconds}
          onClose={() => setVideoEntry(null)}
        />
      )}
    </>
  );
}
