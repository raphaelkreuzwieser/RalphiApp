import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui";
import { LedTime } from "@/components/LedTime";
import { AutoRefresh } from "@/components/AutoRefresh";
import { createClient } from "@/lib/supabase/server";
import { EventSubmit } from "./EventSubmit";
import { EventAdminPanel, type PendingRow } from "./EventAdminPanel";
import { TransferAdmin } from "./TransferAdmin";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  username: string;
  timeSeconds: number;
  hasVideo: boolean;
  status: string;
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) notFound();
  const supabase = createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, name, admin_id")
    .eq("id", params.id)
    .maybeSingle();
  if (!event) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: adminProfile }, { data: rankRows }, { data: myProfile }] = await Promise.all([
    supabase.from("profiles").select("username").eq("id", event.admin_id).maybeSingle(),
    supabase
      .from("event_ranking")
      .select("id, username, time_seconds, has_video, status")
      .eq("event_id", params.id),
    user
      ? supabase.from("profiles").select("username").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const rows: Row[] = (rankRows ?? []).map((r: any) => ({
    id: r.id,
    username: r.username,
    timeSeconds: r.time_seconds,
    hasVideo: r.has_video,
    status: r.status,
  }));

  const isAdmin = Boolean(user && user.id === event.admin_id);
  const myUsername = myProfile?.username ?? null;

  const confirmed = rows
    .filter((r) => r.status === "confirmed")
    .sort((a, b) => a.timeSeconds - b.timeSeconds);
  const pending = rows.filter((r) => r.status === "pending");
  const myPendingCount = pending.filter((r) => r.username === myUsername).length;
  const pendingForAdmin: PendingRow[] = pending.map((r) => ({
    id: r.id,
    username: r.username,
    timeSeconds: r.timeSeconds,
    hasVideo: r.hasVideo,
  }));

  return (
    <>
      <AutoRefresh />
      <Link href="/ranking" className="mb-2.5 inline-flex items-center gap-1 text-[13px] font-bold text-muted">
        <ChevronLeft size={16} /> Alle Events
      </Link>

      <div className="mb-3 rounded-[18px] px-2.5 py-4 text-center [background:radial-gradient(ellipse_at_top,rgba(255,179,71,0.14),transparent_70%)]">
        <div className="text-[19px] font-black text-creme">🎉 {event.name}</div>
        <div className="mt-1 text-xs text-muted">
          Internes Event-Ranking · Event-Admin:{" "}
          <span className="font-bold text-bussi">@{adminProfile?.username ?? "—"}</span>
        </div>
        <EventSubmit eventId={event.id} userId={user?.id ?? null} />
      </div>

      {isAdmin && <EventAdminPanel eventId={event.id} pending={pendingForAdmin} />}

      <SectionTitle>Event-Ranking</SectionTitle>
      {confirmed.length === 0 ? (
        <Card>
          <div className="text-center text-muted">
            Noch keine bestätigten Zeiten – sei die/der Erste! 🏁
          </div>
        </Card>
      ) : (
        confirmed.map((r, i) => {
          const isMe = myUsername != null && r.username === myUsername;
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : String(i + 1);
          return (
            <Card key={r.id} className={`mb-2 flex items-center gap-3 ${i === 0 ? "!border-gold" : ""}`}>
              <div
                className={`min-w-[34px] text-center font-extrabold ${
                  i < 3 ? "text-[22px]" : "text-[15px]"
                } ${i === 0 ? "text-gold" : "text-creme"}`}
              >
                {medal}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-bold ${isMe ? "text-bussi" : "text-creme"}`}>
                  @{r.username} {r.hasVideo && <span className="text-[11px]">🎬</span>}
                </div>
                <LedTime seconds={r.timeSeconds} size="sm" className="block text-lg" />
              </div>
            </Card>
          );
        })
      )}

      {myPendingCount > 0 && (
        <div className="mt-2.5 text-center text-xs text-gold">
          ⏳ {myPendingCount} Zeit(en) von dir warten auf Bestätigung durch @
          {adminProfile?.username ?? "den Event-Admin"}
        </div>
      )}

      {isAdmin && <TransferAdmin eventId={event.id} />}
    </>
  );
}
