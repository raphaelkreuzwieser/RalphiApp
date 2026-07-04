import Link from "next/link";
import { Shield, ChevronLeft } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { requireAdmin } from "@/lib/admin";
import { AdminNav } from "./AdminNav";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin(); // serverseitige Rollenprüfung (role='admin'), sonst redirect

  return (
    <PhoneFrame>
      <header className="flex items-center justify-between border-b border-line bg-panel px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-gold" />
          <div className="font-black text-creme">
            ADMIN <span className="text-gold">DASHBOARD</span>
          </div>
        </div>
        <Link
          href="/race"
          className="inline-flex items-center gap-1 rounded-xl border border-line px-3 py-2 text-xs font-bold text-creme"
        >
          <ChevronLeft size={14} /> Zur App
        </Link>
      </header>
      <AdminNav />
      <main className="flex-1 overflow-y-auto p-3.5 pb-8">{children}</main>
    </PhoneFrame>
  );
}
