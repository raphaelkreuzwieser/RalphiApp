"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Card, Btn, Tag, SectionTitle } from "@/components/ui";
import { LedTime } from "@/components/LedTime";
import { moderateEventSubmission } from "../actions";

export interface PendingRow {
  id: string;
  username: string;
  timeSeconds: number;
  hasVideo: boolean;
}

export function EventAdminPanel({
  eventId,
  pending,
}: {
  eventId: string;
  pending: PendingRow[];
}) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function decide(id: string, decision: "confirmed" | "rejected") {
    setError(null);
    startTransition(async () => {
      const res = await moderateEventSubmission(id, eventId, decision);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  if (pending.length === 0) return null;

  return (
    <>
      <SectionTitle>Zu bestätigen ({pending.length})</SectionTitle>
      {error && (
        <div className="mb-3 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-3 text-[13px] text-creme">
          {error}
        </div>
      )}
      {pending.map((p) => (
        <Card key={p.id} className="mb-2 !border-gold">
          <div className="flex items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-creme">
                @{p.username}
                {p.hasVideo && (
                  <Tag color="text-bussi" border="border-rot-dark">
                    🎬 VIDEO
                  </Tag>
                )}
              </div>
              <LedTime seconds={p.timeSeconds} size="sm" className="block text-xl" />
            </div>
            <div className="flex gap-1.5">
              <Btn kind="gold" className="px-3 py-2" disabled={busy} onClick={() => decide(p.id, "confirmed")}>
                <Check size={14} />
              </Btn>
              <Btn kind="danger" className="px-3 py-2" disabled={busy} onClick={() => decide(p.id, "rejected")}>
                <X size={14} />
              </Btn>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}
