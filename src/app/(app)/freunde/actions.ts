"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export type FriendState = { error?: string; ok?: boolean };

function adminOrNull() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

async function notify(userId: string, type: string, payload: Record<string, unknown>) {
  const admin = adminOrNull();
  if (!admin) return;
  await admin.from("notifications").insert({ user_id: userId, type, payload });
}

/* ---------------- Anfrage senden ---------------- */
export async function sendFriendRequest(addresseeId: string): Promise<FriendState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };
  if (addresseeId === user.id) return { error: "Dich selbst kannst du nicht adden. 😉" };

  const { data: rows } = await supabase
    .from("friendships")
    .select("id, status, requester, addressee");
  const rel = (rows ?? []).find(
    (r: any) =>
      (r.requester === user.id && r.addressee === addresseeId) ||
      (r.requester === addresseeId && r.addressee === user.id),
  );
  if (rel) {
    if (rel.status === "blocked") return { error: "Mit diesem User geht das nicht." };
    if (rel.status === "accepted") return { error: "Ihr seid schon Freunde. 🎉" };
    return { error: "Da läuft schon eine Anfrage." };
  }

  const { error } = await supabase
    .from("friendships")
    .insert({ requester: user.id, addressee: addresseeId, status: "pending" });
  if (error) return { error: "Anfrage konnte nicht gesendet werden." };

  await notify(addresseeId, "friend_request", { requester: user.id });
  revalidatePath("/freunde");
  return { ok: true };
}

/* ---------------- Anfrage annehmen / ablehnen ---------------- */
export async function respondFriendRequest(
  friendshipId: string,
  accept: boolean,
): Promise<FriendState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  if (accept) {
    const { data, error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId)
      .select("requester")
      .maybeSingle();
    if (error || !data) return { error: "Konnte nicht annehmen." };
    await notify(data.requester, "friend_accepted", { by: user.id });
  } else {
    const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
    if (error) return { error: "Konnte nicht ablehnen." };
  }
  revalidatePath("/freunde");
  return { ok: true };
}

/* ---------------- Freund entfernen ---------------- */
export async function removeFriend(friendshipId: string): Promise<FriendState> {
  const supabase = createClient();
  const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
  if (error) return { error: "Konnte nicht entfernen." };
  revalidatePath("/freunde");
  revalidatePath("/checkin");
  return { ok: true };
}

/* ---------------- User blockieren ---------------- */
export async function blockUser(otherUserId: string): Promise<FriendState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  // Bestehende Beziehung(en) entfernen, dann eigenen Block-Eintrag anlegen.
  const { data: rows } = await supabase
    .from("friendships")
    .select("id, requester, addressee");
  const mine = (rows ?? []).filter(
    (r: any) =>
      (r.requester === user.id && r.addressee === otherUserId) ||
      (r.requester === otherUserId && r.addressee === user.id),
  );
  for (const r of mine) {
    await supabase.from("friendships").delete().eq("id", r.id);
  }

  const { error } = await supabase
    .from("friendships")
    .insert({ requester: user.id, addressee: otherUserId, status: "blocked" });
  if (error) return { error: "Konnte nicht blockieren." };

  revalidatePath("/freunde");
  revalidatePath("/checkin");
  return { ok: true };
}
