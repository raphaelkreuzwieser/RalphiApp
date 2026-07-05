"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SubmitState = { error?: string; ok?: boolean };

/**
 * Legt die offizielle Submission an (Status pending). Wird erst aufgerufen,
 * NACHDEM das Video erfolgreich hochgeladen wurde (video_path gesetzt).
 * country_id kommt aus dem Profil. RLS erlaubt Insert nur mit user_id = auth.uid().
 */
export async function createSubmission(input: {
  timeSeconds: number;
  videoPath: string;
}): Promise<SubmitState> {
  const { timeSeconds, videoPath } = input;

  if (!(timeSeconds > 0) || timeSeconds >= 600) {
    return { error: "Bitte eine gültige Zeit eintragen." };
  }
  if (!videoPath) {
    return { error: "Video fehlt – bitte lade zuerst dein Video hoch." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet – bitte neu einloggen." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("country_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return { error: "Profil nicht gefunden." };

  const { error } = await supabase.from("submissions").insert({
    user_id: user.id,
    country_id: profile.country_id,
    time_seconds: timeSeconds,
    video_path: videoPath,
    status: "pending",
  });

  if (error) return { error: `Konnte nicht einreichen: ${error.message}` };

  revalidatePath("/race");
  revalidatePath("/ranking");
  return { ok: true };
}
