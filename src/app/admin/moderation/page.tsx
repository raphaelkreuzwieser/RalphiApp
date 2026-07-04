import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ModerationList, type ModRow } from "./ModerationList";

export const dynamic = "force-dynamic";

const FILTERS = ["pending", "approved", "rejected", "alle"] as const;
type Filter = (typeof FILTERS)[number];

async function loadRows(filter: Filter): Promise<ModRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    let query = supabase
      .from("submissions")
      // profiles!...user_id_fkey disambiguiert: submissions hat zwei FKs auf
      // profiles (user_id + reviewed_by).
      .select(
        "id, status, time_seconds, country_id, created_at, video_public, via_event, profiles!submissions_user_id_fkey(username), countries(flag)",
      )
      .order("created_at", { ascending: false });
    if (filter !== "alle") query = query.eq("status", filter);
    const { data } = await query;
    if (!data) return [];

    // Event-Namen für via_event auflösen (kein FK -> separat laden).
    const eventIds = Array.from(
      new Set(data.map((r: any) => r.via_event).filter(Boolean)),
    ) as string[];
    const eventNames = new Map<string, string>();
    if (eventIds.length) {
      const { data: evs } = await supabase.from("events").select("id, name").in("id", eventIds);
      (evs ?? []).forEach((e: any) => eventNames.set(e.id, e.name));
    }

    return data.map((r: any) => ({
      id: r.id,
      status: r.status,
      timeSeconds: r.time_seconds,
      countryId: r.country_id,
      flag: r.countries?.flag ?? "🌍",
      username: r.profiles?.username ?? "—",
      createdAt: r.created_at,
      videoPublic: r.video_public,
      viaEventName: r.via_event ? eventNames.get(r.via_event) ?? "Event" : null,
    }));
  } catch {
    return [];
  }
}

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const filter = (FILTERS as readonly string[]).includes(searchParams.status ?? "")
    ? (searchParams.status as Filter)
    : "pending";
  const rows = await loadRows(filter);

  return (
    <>
      <div className="mb-3 flex gap-1.5">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/moderation?status=${f}`}
            className={`rounded-full border px-2.5 py-1.5 text-xs font-bold capitalize ${
              filter === f ? "border-rot text-rot" : "border-line text-muted"
            }`}
          >
            {f}
          </Link>
        ))}
      </div>
      <ModerationList rows={rows} />
    </>
  );
}
