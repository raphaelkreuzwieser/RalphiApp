import { AutoRefresh } from "@/components/AutoRefresh";
import { createClient } from "@/lib/supabase/server";
import { getCheckinFeed } from "@/lib/social";
import { getCurrentProfile } from "@/lib/user";
import { CheckinButton, type DrinkOption } from "./CheckinButton";
import { CheckinFeed } from "./CheckinFeed";

export const metadata = { title: "Check-in" };
export const dynamic = "force-dynamic";

async function loadDrinks(): Promise<DrinkOption[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("drinks")
      .select("id, name, image_url")
      .eq("active", true)
      .order("sort", { ascending: true });
    return (data ?? []).map((d: any) => ({ id: d.id, name: d.name, imageUrl: d.image_url }));
  } catch {
    return [];
  }
}

async function loadReactionTemplates(): Promise<string[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("reaction_templates")
      .select("text")
      .eq("active", true)
      .order("sort", { ascending: true });
    return (data ?? []).map((r: any) => r.text);
  } catch {
    return [];
  }
}

export default async function CheckinPage() {
  const [drinks, feed, templates, profile] = await Promise.all([
    loadDrinks(),
    getCheckinFeed(),
    loadReactionTemplates(),
    getCurrentProfile(),
  ]);

  return (
    <>
      <AutoRefresh />
      <CheckinButton drinks={drinks} defaultShareLocation={profile?.profile.share_location ?? true} />
      <CheckinFeed feed={feed} reactionTemplates={templates} />
    </>
  );
}
