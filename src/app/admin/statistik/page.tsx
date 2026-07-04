import { Download } from "lucide-react";
import { Card, Btn, SectionTitle } from "@/components/ui";
import { formatSeconds } from "@/lib/format";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface Stats {
  uploads: number;
  pending: number;
  avg: number | null;
  checkins: number;
  events: number;
  byLand: { id: string; name: string; flag: string; n: number }[];
}

async function loadStats(): Promise<Stats> {
  const empty: Stats = { uploads: 0, pending: 0, avg: null, checkins: 0, events: 0, byLand: [] };
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return empty;
  try {
    const admin = createAdminClient();
    const [{ data: subs }, { count: checkins }, { count: events }, { data: countries }] =
      await Promise.all([
        admin.from("submissions").select("status, time_seconds, country_id"),
        admin.from("checkins").select("id", { count: "exact", head: true }),
        admin.from("events").select("id", { count: "exact", head: true }),
        admin.from("countries").select("id, name, flag").order("sort", { ascending: true }),
      ]);

    const all = subs ?? [];
    const approved = all.filter((s: any) => s.status === "approved");
    const avg =
      approved.length > 0
        ? approved.reduce((a: number, s: any) => a + Number(s.time_seconds), 0) / approved.length
        : null;

    const counts = new Map<string, number>();
    all.forEach((s: any) => counts.set(s.country_id, (counts.get(s.country_id) ?? 0) + 1));
    const byLand = (countries ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      flag: c.flag,
      n: counts.get(c.id) ?? 0,
    }));

    return {
      uploads: all.length,
      pending: all.filter((s: any) => s.status === "pending").length,
      avg,
      checkins: checkins ?? 0,
      events: events ?? 0,
      byLand,
    };
  } catch {
    return empty;
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <div className="text-[11px] font-bold text-muted">{label}</div>
      <div className="led mt-0.5 text-3xl">{value}</div>
    </Card>
  );
}

export default async function StatistikPage() {
  await requireAdmin();
  const s = await loadStats();
  const maxN = Math.max(...s.byLand.map((b) => b.n), 1);

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        <Stat label="UPLOADS GESAMT" value={String(s.uploads)} />
        <Stat label="PENDING" value={String(s.pending)} />
        <Stat label="Ø ZEIT" value={s.avg !== null ? formatSeconds(s.avg) : "–"} />
        <Stat label="CHECK-INS" value={String(s.checkins)} />
        <Stat label="EVENTS" value={String(s.events)} />
      </div>

      <SectionTitle>Aktivste Länder</SectionTitle>
      <Card>
        {s.byLand.length === 0 && <div className="text-center text-muted">Noch keine Daten.</div>}
        {s.byLand.map((b) => (
          <div key={b.id} className="mb-2.5 last:mb-0">
            <div className="mb-1 flex justify-between text-[13px] text-creme">
              <span>
                {b.flag} {b.name}
              </span>
              <span className="text-muted">{b.n}</span>
            </div>
            <div className="h-2 rounded bg-panel2">
              <div
                className="h-full rounded"
                style={{
                  width: `${(b.n / maxN) * 100}%`,
                  background: "linear-gradient(90deg, #E8283C, #FFB347)",
                }}
              />
            </div>
          </div>
        ))}
      </Card>

      <a href="/api/export" className="mt-3.5 block">
        <Btn kind="ghost" className="w-full">
          <Download size={16} /> Ranking als CSV exportieren
        </Btn>
      </a>
    </>
  );
}
