import { createClient } from "@/lib/supabase/server";
import { LaenderManager, type CountryRow } from "./LaenderManager";

export const dynamic = "force-dynamic";

async function load(): Promise<CountryRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data: countries } = await supabase
      .from("countries")
      .select("*")
      .order("sort", { ascending: true });
    if (!countries) return [];

    const { data: subs } = await supabase
      .from("submissions")
      .select("country_id")
      .eq("status", "approved");
    const counts = new Map<string, number>();
    (subs ?? []).forEach((s: any) => counts.set(s.country_id, (counts.get(s.country_id) ?? 0) + 1));

    return countries.map((c: any) => ({
      id: c.id,
      name: c.name,
      flag: c.flag,
      active: c.active,
      count: counts.get(c.id) ?? 0,
    }));
  } catch {
    return [];
  }
}

export default async function LaenderPage() {
  const countries = await load();
  return <LaenderManager countries={countries} />;
}
