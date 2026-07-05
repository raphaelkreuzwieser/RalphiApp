import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

/** Rahmen für die rechtlichen Platzhalterseiten. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="px-5 pb-12 pt-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-[13px] font-bold text-muted"
      >
        <ChevronLeft size={16} /> Zurück
      </Link>
      <h1 className="mb-4 text-2xl font-black text-creme">{title}</h1>
      <div className="space-y-3 text-[14px] leading-relaxed text-muted">{children}</div>
      <div className="mt-8 rounded-xl border border-line bg-panel2 p-3 text-[12px] text-gold">
        ⚠️ Platzhalter – die finalen Texte werden vor dem Launch anwaltlich geprüft
        (siehe DEPLOY-ANLEITUNG).
      </div>
    </div>
  );
}
