import { createClient } from "@/lib/supabase/server";
import type { Country } from "@/lib/database.types";

/** Fallback = die im Schema geseedeten Länder (falls Supabase noch nicht erreichbar). */
const FALLBACK: Country[] = [
  { id: "AT", name: "Österreich", flag: "🇦🇹", active: true, sort: 1 },
  { id: "DE", name: "Deutschland", flag: "🇩🇪", active: true, sort: 2 },
  { id: "IT", name: "Italien", flag: "🇮🇹", active: true, sort: 3 },
];

/** Aktive Länder, aufsteigend nach sort. Robuster Fallback ohne Env/Verbindung. */
export async function getActiveCountries(): Promise<Country[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return FALLBACK;
  }
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .eq("active", true)
      .order("sort", { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK;
    return data as Country[];
  } catch {
    return FALLBACK;
  }
}
