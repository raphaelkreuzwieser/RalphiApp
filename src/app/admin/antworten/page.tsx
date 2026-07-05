import { createClient } from "@/lib/supabase/server";
import { AntwortenManager, type ReactionRow } from "./AntwortenManager";

export const dynamic = "force-dynamic";

async function load(): Promise<ReactionRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("reaction_templates")
      .select("id, text, active")
      .order("sort", { ascending: true });
    return (data as ReactionRow[]) ?? [];
  } catch {
    return [];
  }
}

export default async function AntwortenPage() {
  return <AntwortenManager reactions={await load()} />;
}
