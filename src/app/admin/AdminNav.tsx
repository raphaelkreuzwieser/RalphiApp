"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  ["/admin/moderation", "Moderation"],
  ["/admin/laender", "Länder"],
  ["/admin/antworten", "Antworten"],
  ["/admin/getraenke", "Getränke"],
  ["/admin/user", "User"],
  ["/admin/statistik", "Analytics"],
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1.5 overflow-x-auto border-b border-line px-3 py-2.5">
      {TABS.map(([href, label]) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-bold ${
              active ? "bg-gold text-[#3A2200]" : "bg-panel2 text-muted"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
