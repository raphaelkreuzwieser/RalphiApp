"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Heart, MessageCircle } from "lucide-react";
import { Card, Btn, DrinkImg, SectionTitle } from "@/components/ui";
import { LedTime } from "@/components/LedTime";
import { relativeTime } from "@/lib/format";
import { sendReaction } from "./actions";
import type { FeedEntry } from "@/lib/social";

export function CheckinFeed({
  feed,
  reactionTemplates,
}: {
  feed: FeedEntry[];
  reactionTemplates: string[];
}) {
  const router = useRouter();
  const [target, setTarget] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [busy, startBusy] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function react(checkinId: string, text: string) {
    if (!text.trim()) return;
    setError(null);
    startBusy(async () => {
      const res = await sendReaction(checkinId, text);
      if (res.error) setError(res.error);
      else {
        setTarget(null);
        setFreeText("");
        router.refresh();
      }
    });
  }

  return (
    <>
      <SectionTitle>Deine Freunde – live 🍻</SectionTitle>
      {error && (
        <div className="mb-3 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-3 text-[13px] text-creme">
          {error}
        </div>
      )}

      {feed.length === 0 ? (
        <Card>
          <div className="text-center text-sm text-muted">
            Noch nichts los – sobald deine Freunde einchecken, siehst du&apos;s hier. 😘
          </div>
        </Card>
      ) : (
        feed.map((c) => (
          <Card key={c.id} className="mb-2.5">
            <div className="flex items-center gap-2.5">
              <DrinkImg src={c.drinkImage} size={48} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-creme">
                  @{c.username}
                  <LedTime seconds={c.bestTime} size="sm" withUnit className="text-xs" />
                  <span className="text-xs font-normal text-muted">· {relativeTime(c.createdAt)}</span>
                </div>
                <div className="text-sm text-bussi">
                  trinkt <b>{c.drinkName}</b>
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <MapPin size={12} /> {c.locationText ?? "Standort nicht geteilt"}
                </div>
              </div>
            </div>

            {c.reactions.length > 0 && (
              <div className="mt-2.5 border-t border-line pt-2">
                {c.reactions.map((r, i) => (
                  <div key={i} className="mb-1 text-[13px] text-creme">
                    <span className="text-muted">@{r.username}:</span> {r.text}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2.5">
              {target === c.id ? (
                <>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {reactionTemplates.map((r, i) => (
                      <button
                        key={i}
                        disabled={busy}
                        onClick={() => react(c.id, r)}
                        className="rounded-full border border-line bg-panel2 px-2.5 py-1.5 text-xs text-creme"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      className="flex-1 rounded-[10px] border border-line bg-panel2 px-2.5 py-2 text-[14px] text-creme"
                      placeholder="Eigene Nachricht…"
                      value={freeText}
                      onChange={(e) => setFreeText(e.target.value)}
                    />
                    <Btn className="px-3 py-2" disabled={busy} onClick={() => react(c.id, freeText)}>
                      <MessageCircle size={15} />
                    </Btn>
                  </div>
                </>
              ) : (
                <Btn kind="ghost" className="px-3 py-1.5 text-xs" onClick={() => setTarget(c.id)}>
                  <Heart size={13} /> Reagieren
                </Btn>
              )}
            </div>
          </Card>
        ))
      )}
    </>
  );
}
