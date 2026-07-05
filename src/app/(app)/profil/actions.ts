"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Standort-Default (profiles.share_location) speichern. */
export async function updateShareLocation(next: boolean): Promise<{ ok: boolean }> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false };
    await supabase.from("profiles").update({ share_location: next }).eq("id", user.id);
    revalidatePath("/profil");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
