import { createClient } from "@/lib/supabase/server";

export interface EventOverview {
  id: string;
  name: string;
  adminUsername: string;
  isMine: boolean;
  confirmedCount: number;
  pendingCount: number;
}

function hasEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Alle aktiven Events mit Zahlen (bestätigte + – für den Event-Admin – offene). */
export async function getEventsOverview(): Promise<EventOverview[]> {
  if (!hasEnv()) return [];
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: events } = await supabase
      .from("events")
      .select("id, name, admin_id")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (!events || events.length === 0) return [];

    const adminIds = Array.from(new Set(events.map((e: any) => e.admin_id)));
    const { data: admins } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", adminIds);
    const nameOf = new Map<string, string>();
    (admins ?? []).forEach((a: any) => nameOf.set(a.id, a.username));

    const { data: subs } = await supabase
      .from("event_submissions")
      .select("event_id, status");
    const confirmed = new Map<string, number>();
    const pending = new Map<string, number>();
    (subs ?? []).forEach((s: any) => {
      if (s.status === "confirmed")
        confirmed.set(s.event_id, (confirmed.get(s.event_id) ?? 0) + 1);
      else if (s.status === "pending")
        pending.set(s.event_id, (pending.get(s.event_id) ?? 0) + 1);
    });

    return events.map((e: any) => ({
      id: e.id,
      name: e.name,
      adminUsername: nameOf.get(e.admin_id) ?? "—",
      isMine: user?.id === e.admin_id,
      confirmedCount: confirmed.get(e.id) ?? 0,
      pendingCount: pending.get(e.id) ?? 0,
    }));
  } catch {
    return [];
  }
}
