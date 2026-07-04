"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Timer, Upload, Video, Check, X, Loader2 } from "lucide-react";
import { Card, Btn } from "@/components/ui";
import { Toggle } from "@/components/Toggle";
import { validateVideoFile, buildVideoPath } from "@/lib/videoValidation";
import { startResumableUpload, type ResumableUploadHandle } from "@/lib/upload";
import { parseTimeInput } from "@/lib/format";
import { createEventSubmission } from "../actions";

export function EventSubmit({ eventId, userId }: { eventId: string; userId: string | null }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<ResumableUploadHandle | null>(null);

  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("");
  const [videoOn, setVideoOn] = useState(false);
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    uploadRef.current?.abort();
    uploadRef.current = null;
    setOpen(false);
    setTime("");
    setVideoOn(false);
    setFileName("");
    setProgress(0);
    setUploaded(false);
    setVideoPath(null);
    setError(null);
    setSubmitting(false);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    const err = await validateVideoFile(file);
    if (err) return setError(err);
    if (!userId) return setError("Nicht angemeldet.");
    setFileName(file.name);
    setUploaded(false);
    setProgress(0);
    const path = buildVideoPath(userId, file);
    uploadRef.current = await startResumableUpload({
      file,
      objectName: path,
      onProgress: setProgress,
      onSuccess: () => {
        setUploaded(true);
        setVideoPath(path);
      },
      onError: (m) => setError(m),
    });
  }

  async function submit() {
    const seconds = parseTimeInput(time);
    if (seconds === null) return setError("Bitte eine gültige Zeit eintragen.");
    if (videoOn && !uploaded) return setError("Bitte warte, bis das Video fertig hochgeladen ist.");
    setSubmitting(true);
    setError(null);
    const res = await createEventSubmission({
      eventId,
      timeSeconds: seconds,
      hasVideo: videoOn,
      videoPath: videoOn ? videoPath : null,
    });
    setSubmitting(false);
    if (res.error) return setError(res.error);
    reset();
    router.refresh();
  }

  if (!open) {
    return (
      <Btn kind="gold" className="mt-3" onClick={() => setOpen(true)}>
        <Timer size={15} /> Meine Zeit eintragen
      </Btn>
    );
  }

  return (
    <Card className="mb-3 text-left">
      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/quicktime,.mov,.mp4"
        className="hidden"
        onChange={onFile}
      />
      {error && (
        <div className="mb-2.5 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-2.5 text-[13px] text-creme">
          {error}
        </div>
      )}
      <input
        className="led mb-2.5 w-full rounded-[10px] border border-line bg-panel2 p-3 text-center text-2xl"
        placeholder="0,00"
        inputMode="decimal"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[13px] text-creme">
          🎬 Mit Videobeweis{" "}
          <span className="text-[11px] text-muted">(zählt fürs offizielle Ranking)</span>
        </div>
        <Toggle on={videoOn} onClick={() => setVideoOn((v) => !v)} label="Mit Videobeweis" />
      </div>

      {videoOn && (
        <button
          onClick={() => fileRef.current?.click()}
          className="mb-3 flex w-full items-center gap-2.5 rounded-xl bg-panel2 p-3 text-left"
        >
          <Video size={18} className="text-bussi" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold text-creme">
              {fileName || "Video auswählen (MP4/MOV, max. 60 s / 100 MB)"}
            </div>
            {fileName && (
              <div className="mt-1.5 h-[5px] rounded bg-line">
                <div className="h-full rounded bg-gold" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
          {uploaded && <Check size={16} className="text-[#7BE0A3]" />}
        </button>
      )}

      <div className="flex gap-2">
        <Btn className="flex-1" disabled={submitting} onClick={submit}>
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}{" "}
          Eintragen
        </Btn>
        <Btn kind="ghost" onClick={reset}>
          <X size={15} />
        </Btn>
      </div>
    </Card>
  );
}
