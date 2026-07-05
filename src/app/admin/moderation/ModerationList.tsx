"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Video, Check, X, Eye, EyeOff, Download } from "lucide-react";
import { Card, Btn, Tag, StatusTag } from "@/components/ui";
import { LedTime } from "@/components/LedTime";
import { VideoOverlay } from "@/components/VideoOverlay";
import type { SubmissionStatus } from "@/lib/database.types";
import { moderateSubmission, toggleVideoPublic } from "../actions";

export interface ModRow {
  id: string;
  status: SubmissionStatus;
  timeSeconds: number;
  countryId: string;
  flag: string;
  username: string;
  createdAt: string;
  videoPublic: boolean;
  viaEventName: string | null;
}

export function ModerationList({ rows }: { rows: ModRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [videoRow, setVideoRow] = useState<ModRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <>
      {error && (
        <div className="mb-3 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-3 text-[13px] text-creme">
          {error}
        </div>
      )}

      {rows.length === 0 ? (
        <Card>
          <div className="text-center text-muted">Keine Einträge mit diesem Status.</div>
        </Card>
      ) : (
        rows.map((r) => (
          <Card key={r.id} className="mb-2.5">
            <div className="flex items-start justify-between gap-2.5">
              <div>
                <div className="font-extrabold text-creme">
                  @{r.username}{" "}
                  <span className="text-xs font-normal text-muted">
                    · {r.flag} {r.countryId} · {new Date(r.createdAt).toLocaleDateString("de-AT")}
                  </span>
                </div>
                {r.viaEventName && (
                  <div className="mt-1">
                    <Tag color="text-gold" border="border-[#6B4E1E]">
                      🎉 via {r.viaEventName}
                    </Tag>
                  </div>
                )}
                <LedTime seconds={r.timeSeconds} size="sm" className="mt-1 block text-2xl" />
                <div className="mt-0.5 text-[11px] text-muted">
                  Eingetragene Zeit – mit Display im Video abgleichen
                </div>
              </div>
              <StatusTag status={r.status} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Btn kind="soft" className="px-3 py-2 text-xs" onClick={() => setVideoRow(r)}>
                <Video size={14} /> Video ansehen
              </Btn>
              {r.status === "pending" && (
                <>
                  <Btn
                    kind="gold"
                    className="px-3 py-2 text-xs"
                    disabled={pending}
                    onClick={() => run(() => moderateSubmission(r.id, "approved"))}
                  >
                    <Check size={14} /> Freigeben
                  </Btn>
                  <Btn
                    kind="danger"
                    className="px-3 py-2 text-xs"
                    disabled={pending}
                    onClick={() => run(() => moderateSubmission(r.id, "rejected"))}
                  >
                    <X size={14} /> Ablehnen
                  </Btn>
                </>
              )}
              {r.status === "approved" && (
                <Btn
                  kind={r.videoPublic ? "primary" : "ghost"}
                  className="px-3 py-2 text-xs"
                  disabled={pending}
                  onClick={() => run(() => toggleVideoPublic(r.id, !r.videoPublic))}
                >
                  {r.videoPublic ? <Eye size={14} /> : <EyeOff size={14} />} Video öffentlich:{" "}
                  {r.videoPublic ? "JA" : "NEIN"}
                </Btn>
              )}
            </div>
          </Card>
        ))
      )}

      <a href="/api/export" className="mt-1.5 block">
        <Btn kind="ghost" className="w-full">
          <Download size={16} /> Ranking als CSV exportieren
        </Btn>
      </a>

      {videoRow && (
        <VideoOverlay
          submissionId={videoRow.id}
          username={videoRow.username}
          timeSeconds={videoRow.timeSeconds}
          onClose={() => setVideoRow(null)}
        />
      )}
    </>
  );
}
