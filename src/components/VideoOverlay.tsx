"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Btn } from "@/components/ui";
import { LedTime } from "@/components/LedTime";

/**
 * Inline-Video-Player im Overlay (kein externes Popup/Tab, Abschnitt 6.3).
 * Holt die Signed URL vom Route Handler /api/video-url – der prüft die Rechte.
 */
export function VideoOverlay({
  submissionId,
  username,
  timeSeconds,
  onClose,
}: {
  submissionId: string;
  username: string;
  timeSeconds: number;
  onClose: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/video-url?id=${encodeURIComponent(submissionId)}`);
        const body = await res.json();
        if (!active) return;
        if (!res.ok) {
          setError(body.error || "Video konnte nicht geladen werden.");
          return;
        }
        setUrl(body.url);
      } catch {
        if (active) setError("Video konnte nicht geladen werden.");
      }
    })();
    return () => {
      active = false;
    };
  }, [submissionId]);

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-[rgba(10,4,6,0.88)] p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[340px]" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex aspect-[9/14] flex-col items-center justify-center gap-3.5 overflow-hidden rounded-2xl border border-line bg-black">
          {url ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={url} controls autoPlay playsInline className="h-full w-full object-contain" />
          ) : error ? (
            <div className="px-6 text-center text-sm text-muted">{error}</div>
          ) : (
            <>
              <Loader2 size={26} className="animate-spin text-rot" />
              <LedTime seconds={timeSeconds} size="md" />
              <div className="text-[13px] text-muted">@{username} · Shotrace-Lauf</div>
            </>
          )}
        </div>
        <Btn kind="ghost" onClick={onClose} className="mt-3 w-full">
          <X size={16} /> Schließen
        </Btn>
      </div>
    </div>
  );
}
