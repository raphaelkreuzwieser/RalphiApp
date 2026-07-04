import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import { LOGOS, EXTERNAL_LINKS, AGE_NOTICE } from "@/lib/assets";
import { Card, Btn, SectionTitle } from "@/components/ui";
import { LedTime } from "@/components/LedTime";

const STEPS = [
  { emoji: "📦", title: "Pack besorgen", text: "Hol dir das Shotrace Pack mit elektronischer Zeitmessung." },
  { emoji: "🎬", title: "Kamera an", text: "Film deinen Lauf – die Zeit läuft am LED-Display mit." },
  { emoji: "🏁", title: "Trinken & Zeit stoppen", text: "So schnell wie möglich – das Display zeigt deine Zeit." },
  { emoji: "⬆️", title: "Hochladen", text: "Video + Zeit einreichen. Das Gschpusi-Team prüft alles." },
  { emoji: "🏆", title: "Ab ins Ranking", text: "Freigegeben? Dann stehst du im offiziellen Ranking." },
];

export default function LandingPage() {
  const europaRekord: number | null = null; // Live aus `ranking`-View – folgt in M3.

  return (
    <div className="px-5 pb-10 pt-8">
      {/* Hero */}
      <div className="text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGOS.shotrace} alt="Gschpusi Shot Race" className="mx-auto w-[260px]" />
        <p className="mt-3 text-[15px] text-bussi">Wie schnell bist du? Beweis es. 🏁</p>

        <div className="mt-6">
          <div className="text-[11px] font-bold tracking-[0.2em] text-muted">
            AKTUELLER EUROPAREKORD
          </div>
          <LedTime seconds={europaRekord} size="xl" className="mt-1 block" />
        </div>

        <div className="mt-7 flex flex-col gap-2.5">
          <Link href="/registrieren">
            <Btn className="w-full">
              Registrieren <ArrowRight size={16} />
            </Btn>
          </Link>
          <Link href="/race">
            <Btn kind="ghost" className="w-full">
              App öffnen
            </Btn>
          </Link>
        </div>
      </div>

      {/* So funktioniert's */}
      <SectionTitle>So funktioniert&apos;s</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {STEPS.map((s, i) => (
          <Card key={i} className="flex items-start gap-3">
            <div className="text-2xl">{s.emoji}</div>
            <div>
              <div className="font-bold text-creme">
                {i + 1}. {s.title}
              </div>
              <div className="text-[13px] text-muted">{s.text}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Öffentliches Ranking (read-only) */}
      <SectionTitle>Öffentliches Ranking</SectionTitle>
      <Card className="flex items-center gap-3">
        <Trophy size={20} className="text-gold" />
        <div className="text-sm text-muted">
          Noch keine freigegebenen Zeiten – wird live, sobald die ersten Läufe durch sind.
        </div>
      </Card>

      {/* App-Store-Badges (Platzhalter) */}
      <SectionTitle>Bald als App</SectionTitle>
      <div className="flex gap-2.5">
        {["App Store", "Google Play"].map((store) => (
          <div
            key={store}
            className="flex flex-1 flex-col items-center rounded-xl border border-line bg-panel2 px-3 py-3 text-center"
          >
            <div className="text-sm font-bold text-creme">{store}</div>
            <div className="text-[11px] text-muted">Bald verfügbar</div>
          </div>
        ))}
      </div>

      {/* Links */}
      <div className="mt-6 flex gap-2.5">
        <a
          href={EXTERNAL_LINKS.website}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-xl border border-line bg-panel px-3 py-2.5 text-center text-sm font-bold text-creme no-underline"
        >
          gschpusi.com
        </a>
        <a
          href={EXTERNAL_LINKS.shop}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-xl border border-line bg-panel px-3 py-2.5 text-center text-sm font-bold text-creme no-underline"
        >
          Shop
        </a>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-[11px] text-muted">
        {AGE_NOTICE}
        <br />
        Party-Shot GmbH, Thalheim bei Wels ·{" "}
        <Link href="/datenschutz" className="underline">
          Datenschutz
        </Link>{" "}
        ·{" "}
        <Link href="/impressum" className="underline">
          Impressum
        </Link>{" "}
        ·{" "}
        <Link href="/agb" className="underline">
          AGB
        </Link>
      </div>
    </div>
  );
}
