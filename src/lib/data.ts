import { createClient } from "@/lib/supabase/server";
import type { RankingRow, Submission } from "@/lib/database.types";

function hasEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Alle freigegebenen Zeiten aus der öffentlichen `ranking`-View, aufsteigend. */
export async function getRanking(): Promise<RankingRow[]> {
  if (!hasEnv()) return [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("ranking")
      .select("*")
      .order("time_seconds", { ascending: true });
    if (error || !data) return [];
    return data as RankingRow[];
  } catch {
    return [];
  }
}

/** Schnellste freigegebene Zeit gesamt (Europarekord) oder null. */
export async function getEuropeRecord(): Promise<number | null> {
  const rows = await getRanking();
  return rows.length ? rows[0].time_seconds : null;
}

/** Läufe des aktuell eingeloggten Users (RLS: nur eigene), neueste zuerst. */
export async function getMyRuns(): Promise<Submission[]> {
  if (!hasEnv()) return [];
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as Submission[];
  } catch {
    return [];
  }
}

/** Bestzeit (schnellste approved) des aktuellen Users via best_time RPC. */
export async function getMyBestTime(): Promise<number | null> {
  if (!hasEnv()) return null;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.rpc("best_time", { uid: user.id });
    return typeof data === "number" ? data : null;
  } catch {
    return null;
  }
}

/** Username des aktuellen Users (für Hervorhebung im Ranking). */
export async function getMyUsername(): Promise<string | null> {
  if (!hasEnv()) return null;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    return data?.username ?? null;
  } catch {
    return null;
  }
}
