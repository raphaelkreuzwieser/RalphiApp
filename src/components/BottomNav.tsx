"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Timer, Trophy, GlassWater, Users, Menu } from "lucide-react";

const TABS = [
  { href: "/race", icon: Timer, label: "Race" },
  { href: "/ranking", icon: Trophy, label: "Ranking" },
  { href: "/checkin", icon: GlassWater, label: "Check-in" },
  { href: "/freunde", icon: Users, label: "Freunde" },
  { href: "/profil", icon: Menu, label: "Mehr" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="absolute inset-x-0 bottom-0 flex border-t border-line bg-panel px-1 pt-2"
      style={{ paddingBottom: "calc(10px + var(--sab))" }}
    >
      {TABS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-[3px] ${active ? "text-rot" : "text-muted"}`}
          >
            <Icon size={21} />
            <span className="text-[10px] font-bold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
