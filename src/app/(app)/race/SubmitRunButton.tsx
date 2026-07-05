"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Video, Check, X, Loader2 } from "lucide-react";
import { Btn, Card } from "@/components/ui";
import { LedTime } from "@/components/LedTime";
import { BottomSheet } from "@/components/BottomSheet";
import { validateVideoFile, buildVideoPath } from "@/lib/videoValidation";
import { startResumableUpload, type ResumableUploadHandle } from "@/lib/upload";
import { parseTimeInput } from "@/lib/format";
import { createSubmission } from "./submit-actions";

export function SubmitRunButton({
  userId,
  className = "",
}: {
  userId: string | null;
  className?: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<ResumableUploadHandle | null>(null);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function reset() {
    uploadRef.current?.abort();
    uploadRef.current = null;
    setStep(1);
    setFileName("");
    setFileError(null);
    setProgress(0);
    setUploaded(false);
    setUploadError(null);
    setVideoPath(null);
    setTime("");
    setSubmitting(false);
    setSubmitError(null);
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // erneutes Wählen derselben Datei erlauben
    if (!file) return;

    setFileError(null);
    setUploadError(null);
    const err = await validateVideoFile(file);
    if (err) {
      setFileError(err);
      return;
    }
    if (!userId) {
      setFileError("Nicht angemeldet – bitte neu einloggen.");
      return;
    }

    setFileName(file.name);
    setUploaded(false);
    setProgress(0);
    setStep(2);

    const path = buildVideoPath(userId, file);
    uploadRef.current = await startResumableUpload({
      file,
      objectName: path,
      onProgress: setProgress,
      onSuccess: () => {
        setUploaded(true);
        setVideoPath(path);
      },
      onError: (msg) => setUploadError(msg),
    });
  }

  async function submit() {
    if (!videoPath) return;
    const seconds = parseTimeInput(time);
    if (seconds === null) {
      setSubmitError("Bitte eine gültige Zeit eintragen (z. B. 3,42).");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const res = await createSubmission({ timeSeconds: seconds, videoPath });
    setSubmitting(false);
    if (res.error) {
      setSubmitError(res.error);
      return;
    }
    close();
    router.refresh();
  }

  const parsedTime = parseTimeInput(time);

  return (
    <>
      <Btn onClick={() => setOpen(true)} className={className}>
        <Upload size={17} /> Lauf einreichen
      </Btn>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,.mov,.mp4"
        className="hidden"
        onChange={onFileChosen}
      />

      <BottomSheet open={open} onClose={close} title={`Lauf einreichen · Schritt ${step}/3`}>
        {/* Schritt 1 – Video wählen */}
        {step === 1 && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-line px-4 py-8 text-center"
            >
              <Video size={30} className="mx-auto mb-2 text-bussi" />
              <div className="font-bold text-creme">Video auswählen</div>
              <div className="mt-1 text-xs text-muted">MP4/MOV · max. 60 s · max. 100 MB</div>
            </button>
            {fileError && (
              <div className="mt-3 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-3 text-[13px] text-creme">
                {fileError}
              </div>
            )}
          </>
        )}

        {/* Schritt 2 – Upload-Fortschritt + Zeit eintragen */}
        {step === 2 && (
          <>
            <div className="mb-3.5 flex items-center gap-2.5 rounded-xl bg-panel2 p-3">
              <Video size={18} className="text-bussi" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold text-creme">{fileName}</div>
                <div className="mt-1.5 h-[5px] rounded bg-line">
                  <div
                    className="h-full rounded bg-gold transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              {uploaded ? (
                <Check size={16} className="text-[#7BE0A3]" />
              ) : (
                <span className="text-[11px] font-bold text-muted">{progress}%</span>
              )}
            </div>

            {uploadError && (
              <div className="mb-3 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-3 text-[13px] text-creme">
                {uploadError}
              </div>
            )}

            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
              Deine Zeit (wie am Display)
            </div>
            <input
              className="led mb-3.5 w-full rounded-[10px] border border-line bg-panel2 p-3 text-center text-2xl"
              placeholder="0,00"
              inputMode="decimal"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <Btn className="w-full" disabled={!uploaded || parsedTime === null} onClick={() => setStep(3)}>
              {uploaded ? "Weiter" : "Warte auf Upload…"}
            </Btn>
            <p className="mt-2.5 text-center text-[11px] text-muted">
              Upload läuft im Hintergrund – Abbrechen schließt einfach das Fenster.
            </p>
          </>
        )}

        {/* Schritt 3 – Zusammenfassung + verbindlich einreichen */}
        {step === 3 && (
          <>
            <Card className="mb-3.5 text-center">
              <LedTime seconds={parsedTime} size="lg" className="block" />
              <div className="mt-1 text-xs text-muted">
                Das Gschpusi-Team gleicht deine Zeit mit dem Display im Video ab.
              </div>
            </Card>
            {submitError && (
              <div className="mb-3 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-3 text-[13px] text-creme">
                {submitError}
              </div>
            )}
            <div className="flex gap-2">
              <Btn kind="ghost" onClick={() => setStep(2)}>
                <X size={15} /> Zurück
              </Btn>
              <Btn className="flex-1" disabled={submitting} onClick={submit}>
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                Verbindlich einreichen
              </Btn>
            </div>
          </>
        )}
      </BottomSheet>
    </>
  );
}
