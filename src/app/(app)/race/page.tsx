import { Zap } from "lucide-react";
import { LOGOS } from "@/lib/assets";
import { Card, Tag, SectionTitle } from "@/components/ui";
import { LedTime } from "@/components/LedTime";
import { SubmitRunButton } from "./SubmitRunButton";

export const metadata = { title: "Race" };

export default function RacePage() {
  // Live-Daten (Europarekord, Bestzeit, Meine Läufe) folgen in M3 aus Supabase.
  const europaRekord: number | null = null;
  const meineBestzeit: number | null = null;

  return (
    <>
      <section className="rounded-[18px] px-2.5 pb-4 pt-[22px] text-center [background:radial-gradient(ellipse_at_top,rgba(232,40,60,0.16),transparent_70%)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGOS.shotrace} alt="Gschpusi Shot Race" className="mx-auto mb-3 w-[220px]" />
        <div className="text-[11px] font-bold tracking-[0.2em] text-muted">EUROPAREKORD</div>
        <LedTime seconds={europaRekord} size="xl" withUnit className="mt-1 block leading-tight" />
        <div className="mt-1 text-[13px] text-bussi">Schaffst du das? Pack raus, Kamera an. 🎬</div>
        <SubmitRunButton className="mt-4 w-4/5" />
      </section>

      <Card className="mt-3.5 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold tracking-[0.1em] text-muted">DEINE BESTZEIT</div>
          <LedTime seconds={meineBestzeit} size="md" className="mt-0.5 block" />
        </div>
        <Tag color="text-bussi" border="border-rot-dark">
          <Zap size={10} className="-mt-0.5 inline" /> Für Freunde sichtbar
        </Tag>
      </Card>

      <SectionTitle>Meine Läufe</SectionTitle>
      <Card>
        <div className="text-center text-sm text-muted">
          Noch kein Lauf – Zeit, das zu ändern! 🏁
        </div>
      </Card>
    </>
  );
}
