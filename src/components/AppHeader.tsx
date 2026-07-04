import Link from "next/link";
import { Bell } from "lucide-react";
import { LOGOS } from "@/lib/assets";

/** Kopfzeile der eingeloggten App: Logo-Chip + Benachrichtigungen. */
export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b border-line px-4 py-3">
      <Link href="/race" className="white-chip inline-block px-2.5 py-[5px]" aria-label="Gschpusi Shotrace">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGOS.main} alt="Gschpusi" className="block h-[26px] w-auto" />
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/benachrichtigungen" aria-label="Benachrichtigungen" className="relative text-muted">
          <Bell size={19} />
        </Link>
      </div>
    </header>
  );
}
