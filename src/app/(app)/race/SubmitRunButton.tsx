"use client";

import { useState } from "react";
import { Upload, Video } from "lucide-react";
import { Btn } from "@/components/ui";
import { BottomSheet } from "@/components/BottomSheet";

/**
 * CTA "Lauf einreichen". In M1 nur die Sheet-Hülle mit dem 1. Schritt.
 * Der echte TUS-Upload + Submission-Flow folgt in M3 (Shotrace-Kern).
 */
export function SubmitRunButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Btn onClick={() => setOpen(true)} className={className}>
        <Upload size={17} /> Lauf einreichen
      </Btn>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Lauf einreichen · Schritt 1/3">
        <div className="rounded-2xl border-2 border-dashed border-line px-4 py-8 text-center">
          <Video size={30} className="mx-auto mb-2 text-bussi" />
          <div className="font-bold text-creme">Video auswählen</div>
          <div className="mt-1 text-xs text-muted">
            MP4/MOV · max. 60 s · max. 100 MB
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          Der Video-Upload wird im nächsten Schritt (M3) angebunden – dann geht&apos;s
          direkt vom Handy los. 🏁
        </p>
      </BottomSheet>
    </>
  );
}
