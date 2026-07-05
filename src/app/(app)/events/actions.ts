"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notify";

export type EventState = { error?: string; ok?: boolean; eventId?: string };

/* ---------------- Event erstellen (Ersteller wird Event-Admin) ---------------- */
export async function createEvent(name: string): Promise<EventState> {
  const trimmed = name.trim();
  if (trimmed.length < 3 || trimmed.length > 80)
    return { error: "Der Name muss 3–80 Zeichen haben." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const { data, error } = await supabase
    .from("events")
    .insert({ name: trimmed, admin_id: user.id, created_by: user.id })
    .select("id")
    .maybeSingle();
  if (error || !data) return { error: "Konnte Event nicht anlegen." };

  revalidatePath("/ranking");
  return { ok: true, eventId: data.id };
}

/* ---------------- Zeit in ein Event eintragen ---------------- */
export async function createEventSubmission(input: {
  eventId: string;
  timeSeconds: number;
  hasVideo: boolean;
  videoPath: string | null;
}): Promise<EventState> {
  const { eventId, timeSeconds, hasVideo, videoPath } = input;
  if (!(timeSeconds > 0) || timeSeconds >= 600)
    return { error: "Bitte eine gültige Zeit eintragen." };
  if (hasVideo && !videoPath)
    return { error: "Mit Videobeweis brauchst du ein hochgeladenes Video." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const { error } = await supabase.from("event_submissions").insert({
    event_id: eventId,
    user_id: user.id,
    time_seconds: timeSeconds,
    has_video: hasVideo,
    video_path: hasVideo ? videoPath : null,
  });
  if (error) return { error: "Konnte Zeit nicht eintragen." };

  revalidatePath(`/events/${eventId}`);
  return { ok: true };
}

/* ---------------- Event-Admin: bestätigen / ablehnen ----------------
   Setzt NUR den Status. Die Pipeline ins offizielle Ranking (bei Videobeweis)
   macht der DB-Trigger handle_event_confirmation automatisch. */
export async function moderateEventSubmission(
  id: string,
  eventId: string,
  decision: "confirmed" | "rejected",
): Promise<EventState> {
  const supabase = createClient();
  const { data: updated, error } = await supabase
    .from("event_submissions")
    .update({ status: decision })
    .eq("id", id)
    .select("user_id, time_seconds")
    .maybeSingle();
  if (error || !updated) return { error: "Konnte nicht bestätigen (nur der Event-Admin darf das)." };

  // Notification (+ Push) an den Eincheckenden.
  await createNotification(
    updated.user_id,
    decision === "confirmed" ? "event_confirmed" : "event_rejected",
    { event_id: eventId, time_seconds: updated.time_seconds },
    decision === "confirmed"
      ? { title: "Event-Zeit bestätigt 🎉", body: "Deine Zeit zählt jetzt im Event-Ranking.", url: `/events/${eventId}` }
      : { title: "Event-Zeit abgelehnt", body: "Deine Event-Zeit wurde nicht bestätigt.", url: `/events/${eventId}` },
  );

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/admin/moderation");
  return { ok: true };
}

/* ---------------- Event-Admin an anderen User übertragen ---------------- */
export async function transferEventAdmin(
  eventId: string,
  newAdminId: string,
): Promise<EventState> {
  const supabase = createClient();

  // Ziel muss existieren und darf nicht gesperrt sein.
  const { data: target } = await supabase
    .from("profiles")
    .select("id, locked")
    .eq("id", newAdminId)
    .maybeSingle();
  if (!target) return { error: "User nicht gefunden." };
  if (target.locked) return { error: "Gesperrte User können nicht Event-Admin werden." };

  const { error } = await supabase
    .from("events")
    .update({ admin_id: newAdminId })
    .eq("id", eventId);
  if (error) return { error: "Übertragung fehlgeschlagen (nur der Event-Admin darf das)." };

  revalidatePath(`/events/${eventId}`);
  return { ok: true };
}

/* ---------------- Username-Suche (RPC search_usernames) ---------------- */
export async function searchUsernames(
  q: string,
): Promise<{ id: string; username: string; country_id: string }[]> {
  const query = q.trim();
  if (query.length < 2) return [];
  const supabase = createClient();
  const { data } = await supabase.rpc("search_usernames", { q: query });
  return (data as { id: string; username: string; country_id: string }[]) ?? [];
}
