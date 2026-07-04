import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database.types";

/** Ist der aktuelle User Gschpusi-Admin? (für den Admin-Zugang im Header) */
export async function getIsAdmin(): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return false;
  }
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    return data?.role === "admin";
  } catch {
    return false;
  }
}

export interface CurrentProfile {
  profile: Profile;
  countryLabel: string; // "🇦🇹 Österreich"
  bestTime: number | null;
}

/**
 * Profil des aktuell eingeloggten Users (oder null). Liest über den
 * Server-Client mit RLS – der User darf nur sein eigenes Profil sehen.
 */
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile) return null;

    const { data: country } = await supabase
      .from("countries")
      .select("name, flag")
      .eq("id", (profile as Profile).country_id)
      .maybeSingle();

    const { data: best } = await supabase.rpc("best_time", { uid: user.id });

    return {
      profile: profile as Profile,
      countryLabel: country ? `${country.flag} ${country.name}` : (profile as Profile).country_id,
      bestTime: typeof best === "number" ? best : null,
    };
  } catch {
    return null;
  }
}
