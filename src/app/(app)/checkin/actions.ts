"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export type CheckinState = { error?: string; ok?: boolean };

function adminOrNull() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

/* ---------------- Einchecken ----------------
   Ein neuer Check-in "ersetzt" den alten im Feed automatisch (Feed zeigt nur
   den neuesten pro User) – alte bleiben in der DB. */
export async function doCheckin(input: {
  drinkId: string | null;
  drinkName: string;
  locationText: string | null;
  lat: number | null;
  lng: number | null;
}): Promise<CheckinState> {
  const drinkName = input.drinkName.trim();
  if (!drinkName) return { error: "Bitte wähle ein Getränk." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const { error } = await supabase.from("checkins").insert({
    user_id: user.id,
    drink_id: input.drinkId,
    drink_name: drinkName,
    location_text: input.locationText,
    lat: input.lat,
    lng: input.lng,
  });
  if (error) return { error: "Check-in fehlgeschlagen." };

  revalidatePath("/checkin");
  return { ok: true };
}

/* ---------------- Reaktion auf einen Check-in ---------------- */
export async function sendReaction(checkinId: string, text: string): Promise<CheckinState> {
  const trimmed = text.trim();
  if (!trimmed) return { error: "Bitte gib eine Reaktion ein." };
  if (trimmed.length > 280) return { error: "Reaktion ist zu lang (max. 280 Zeichen)." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  // RLS creact_insert erzwingt, dass man mit dem Eincheckenden befreundet ist.
  const { error } = await supabase
    .from("checkin_reactions")
    .insert({ checkin_id: checkinId, user_id: user.id, text: trimmed });
  if (error) return { error: "Reaktion konnte nicht gesendet werden." };

  // Notification an den Eincheckenden.
  const { data: c } = await supabase
    .from("checkins")
    .select("user_id")
    .eq("id", checkinId)
    .maybeSingle();
  if (c) {
    const admin = adminOrNull();
    if (admin) {
      await admin.from("notifications").insert({
        user_id: c.user_id,
        type: "reaction",
        payload: { checkin_id: checkinId, from: user.id, text: trimmed },
      });
    }
  }

  revalidatePath("/checkin");
  return { ok: true };
}
