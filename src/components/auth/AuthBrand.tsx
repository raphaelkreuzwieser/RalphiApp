import { LOGOS } from "@/lib/assets";

/** Marken-Kopf für Login/Registrierung (Logo-Chip + Claim). */
export function AuthBrand({ subtitle }: { subtitle?: string }) {
  return (
    <div className="mb-6 text-center">
      <div className="mb-3.5 inline-block rounded-2xl bg-white px-4 py-3.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGOS.main} alt="Gschpusi – Home of Partydrinks" className="block w-[180px]" />
      </div>
      <div className="text-[26px] font-black leading-none tracking-tight text-creme">
        SHOT<span className="text-rot">RACE</span>
      </div>
      {subtitle && <div className="mt-1.5 text-sm text-muted">{subtitle}</div>}
    </div>
  );
}
