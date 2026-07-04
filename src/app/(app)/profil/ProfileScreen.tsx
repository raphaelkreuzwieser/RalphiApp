"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, ShoppingBag, ExternalLink, LogOut } from "lucide-react";
import { Avatar, Card, Btn, SectionTitle } from "@/components/ui";
import { LedTime } from "@/components/LedTime";
import { Toggle } from "@/components/Toggle";
import { EXTERNAL_LINKS, AGE_NOTICE } from "@/lib/assets";

export function ProfileScreen() {
  // Platzhalter bis Auth/Profil (M2) angebunden ist.
  const username = "Gast";
  const bestzeit: number | null = null;
  const [shareLoc, setShareLoc] = useState(true);
  const [push, setPush] = useState(false);

  return (
    <>
      <Card className="px-5 py-6 text-center">
        <div className="flex justify-center">
          <Avatar name={username} size={66} />
        </div>
        <div className="mt-2.5 text-lg font-black text-creme">@{username}</div>
        <div className="text-[13px] text-muted">🇦🇹 Österreich · dabei seit Juli 2026</div>
        <LedTime seconds={bestzeit} size="lg" className="mt-2.5 block" />
        <div className="text-[11px] tracking-[0.12em] text-muted">
          DEINE BESTZEIT · FÜR FREUNDE IMMER SICHTBAR
        </div>
      </Card>

      <SectionTitle>Gschpusi</SectionTitle>
      <a href={EXTERNAL_LINKS.website} target="_blank" rel="noreferrer" className="no-underline">
        <Card className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-creme">
            <Globe size={17} className="text-bussi" /> gschpusi.com
          </div>
          <ExternalLink size={15} className="text-muted" />
        </Card>
      </a>
      <a href={EXTERNAL_LINKS.shop} target="_blank" rel="noreferrer" className="no-underline">
        <Card className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-creme">
            <ShoppingBag size={17} className="text-bussi" /> Online-Shop
          </div>
          <ExternalLink size={15} className="text-muted" />
        </Card>
      </a>

      <SectionTitle>Einstellungen</SectionTitle>
      <Card className="mb-2 flex items-center justify-between">
        <div className="text-sm text-creme">📍 Standort bei Check-ins teilen</div>
        <Toggle on={shareLoc} onClick={() => setShareLoc((v) => !v)} label="Standort teilen" />
      </Card>
      <Card className="mb-2 flex items-center justify-between">
        <div className="text-sm text-creme">🔔 Push-Benachrichtigungen</div>
        <Toggle on={push} onClick={() => setPush((v) => !v)} label="Push" />
      </Card>

      <Btn kind="ghost" className="mt-2.5 w-full" disabled>
        <LogOut size={15} /> Abmelden
      </Btn>

      <div className="mt-[18px] text-center text-[11px] text-muted">
        {AGE_NOTICE}
        <br />
        Party-Shot GmbH, Thalheim bei Wels
        <br />
        <Link href="/datenschutz" className="text-muted underline">
          Datenschutz
        </Link>{" "}
        ·{" "}
        <Link href="/impressum" className="text-muted underline">
          Impressum
        </Link>{" "}
        ·{" "}
        <Link href="/agb" className="text-muted underline">
          AGB
        </Link>
      </div>
    </>
  );
}
