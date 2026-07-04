import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LOGOS, AGE_NOTICE } from "@/lib/assets";

/**
 * Gemeinsamer Rahmen für die Auth-Platzhalterseiten (M1).
 * Der echte Auth-Flow (Registrierung mit 18+-Check, E-Mail/Username-Login,
 * Passwort-Reset) wird in M2 gebaut.
 */
export function AuthStub({ title, hint }: { title: string; hint: string }) {
  return (
    <>
      <div className="text-center">
        <div className="mb-4 inline-block rounded-2xl bg-white px-4 py-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGOS.main} alt="Gschpusi" className="block w-[190px]" />
        </div>
        <h1 className="text-2xl font-black text-creme">{title}</h1>
        <p className="mt-2 text-sm text-muted">{hint}</p>
      </div>

      <div className="mt-8 rounded-xl border border-line bg-panel2 p-4 text-center text-[13px] text-gold">
        🚧 Dieser Bereich wird in Meilenstein M2 (Auth) mit Supabase angebunden.
      </div>

      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center gap-1 text-[13px] font-bold text-muted"
      >
        <ChevronLeft size={16} /> Zur Startseite
      </Link>

      <div className="mt-8 text-center text-[11px] text-muted">{AGE_NOTICE}</div>
    </>
  );
}
