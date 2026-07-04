import { createClient } from "@/lib/supabase/server";
import { GetraenkeManager, type DrinkRow } from "./GetraenkeManager";

export const dynamic = "force-dynamic";

async function load(): Promise<DrinkRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("drinks")
      .select("id, name, image_url, active, sort")
      .order("sort", { ascending: true });
    return (data as DrinkRow[]) ?? [];
  } catch {
    return [];
  }
}

export default async function GetraenkePage() {
  return <GetraenkeManager drinks={await load()} />;
}
