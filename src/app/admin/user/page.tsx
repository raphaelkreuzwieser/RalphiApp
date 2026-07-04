import { createClient } from "@/lib/supabase/server";
import { UserManager, type UserRow } from "./UserManager";

export const dynamic = "force-dynamic";

async function load(): Promise<UserRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, full_name, country_id, locked, created_at")
      .order("created_at", { ascending: false });
    if (!profiles) return [];

    const { data: subs } = await supabase
      .from("submissions")
      .select("user_id, time_seconds")
      .eq("status", "approved");
    const best = new Map<string, number>();
    (subs ?? []).forEach((s: any) => {
      const cur = best.get(s.user_id);
      if (cur === undefined || s.time_seconds < cur) best.set(s.user_id, s.time_seconds);
    });

    return profiles.map((p: any) => ({
      id: p.id,
      username: p.username,
      fullName: p.full_name,
      countryId: p.country_id,
      locked: p.locked,
      bestTime: best.get(p.id) ?? null,
    }));
  } catch {
    return [];
  }
}

export default async function UserPage() {
  return <UserManager users={await load()} />;
}
