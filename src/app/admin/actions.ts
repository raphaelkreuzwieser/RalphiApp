"use server";

import { revalidatePath } from "next/cache";
import { assertAdminAction } from "@/lib/admin";

export type AdminState = { error?: string; ok?: boolean };

/* ---------------- Moderation ---------------- */
export async function moderateSubmission(
  id: string,
  decision: "approved" | "rejected",
): Promise<AdminState> {
  const g = await assertAdminAction();
  if (!g.ok) return { error: g.error };

  const { data: sub, error } = await g.adminClient
    .from("submissions")
    .update({
      status: decision,
      reviewed_by: g.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("user_id, time_seconds")
    .maybeSingle();

  if (error || !sub) return { error: "Konnte Status nicht ändern." };

  // Notification an den User (Insert braucht Service-Role – keine Insert-Policy).
  await g.adminClient.from("notifications").insert({
    user_id: sub.user_id,
    type: decision === "approved" ? "submission_approved" : "submission_rejected",
    payload: { submission_id: id, time_seconds: sub.time_seconds },
  });

  revalidatePath("/admin/moderation");
  revalidatePath("/ranking");
  revalidatePath("/race");
  return { ok: true };
}

export async function toggleVideoPublic(id: string, next: boolean): Promise<AdminState> {
  const g = await assertAdminAction();
  if (!g.ok) return { error: g.error };

  const { error } = await g.adminClient
    .from("submissions")
    .update({ video_public: next })
    .eq("id", id);
  if (error) return { error: "Konnte Video-Sichtbarkeit nicht ändern." };

  revalidatePath("/admin/moderation");
  revalidatePath("/ranking");
  return { ok: true };
}

/* ---------------- Länder ---------------- */
export async function createCountry(
  id: string,
  name: string,
  flag: string,
): Promise<AdminState> {
  const g = await assertAdminAction();
  if (!g.ok) return { error: g.error };
  const code = id.trim().toUpperCase();
  if (!code || !name.trim()) return { error: "ID und Name sind Pflicht." };

  const { error } = await g.adminClient
    .from("countries")
    .insert({ id: code, name: name.trim(), flag: flag.trim() || "🌍", active: true });
  if (error) return { error: `Konnte Land nicht anlegen: ${error.message}` };

  revalidatePath("/admin/laender");
  revalidatePath("/ranking");
  return { ok: true };
}

export async function updateCountry(
  id: string,
  name: string,
  flag: string,
): Promise<AdminState> {
  const g = await assertAdminAction();
  if (!g.ok) return { error: g.error };
  const { error } = await g.adminClient
    .from("countries")
    .update({ name: name.trim(), flag: flag.trim() || "🌍" })
    .eq("id", id);
  if (error) return { error: "Konnte Land nicht umbenennen." };
  revalidatePath("/admin/laender");
  revalidatePath("/ranking");
  return { ok: true };
}

export async function toggleCountryActive(id: string, next: boolean): Promise<AdminState> {
  const g = await assertAdminAction();
  if (!g.ok) return { error: g.error };
  const { error } = await g.adminClient.from("countries").update({ active: next }).eq("id", id);
  if (error) return { error: "Konnte Land nicht umschalten." };
  revalidatePath("/admin/laender");
  revalidatePath("/ranking");
  return { ok: true };
}

/* ---------------- Antworten (reaction_templates) ---------------- */
export async function createReaction(text: string): Promise<AdminState> {
  const g = await assertAdminAction();
  if (!g.ok) return { error: g.error };
  if (!text.trim()) return { error: "Bitte Text eingeben." };
  const { error } = await g.adminClient.from("reaction_templates").insert({ text: text.trim() });
  if (error) return { error: "Konnte Antwort nicht anlegen." };
  revalidatePath("/admin/antworten");
  return { ok: true };
}

export async function deleteReaction(id: string): Promise<AdminState> {
  const g = await assertAdminAction();
  if (!g.ok) return { error: g.error };
  const { error } = await g.adminClient.from("reaction_templates").delete().eq("id", id);
  if (error) return { error: "Konnte Antwort nicht löschen." };
  revalidatePath("/admin/antworten");
  return { ok: true };
}

/* ---------------- Getränke ---------------- */
export async function createDrink(
  name: string,
  imageUrl: string,
  sort: number,
): Promise<AdminState> {
  const g = await assertAdminAction();
  if (!g.ok) return { error: g.error };
  if (!name.trim()) return { error: "Bitte Namen eingeben." };
  const { error } = await g.adminClient.from("drinks").insert({
    name: name.trim(),
    image_url: imageUrl.trim() || null,
    sort: Number.isFinite(sort) ? sort : 100,
  });
  if (error) return { error: "Konnte Getränk nicht anlegen." };
  revalidatePath("/admin/getraenke");
  revalidatePath("/checkin");
  return { ok: true };
}

export async function updateDrink(
  id: string,
  name: string,
  imageUrl: string,
  sort: number,
  active: boolean,
): Promise<AdminState> {
  const g = await assertAdminAction();
  if (!g.ok) return { error: g.error };
  const { error } = await g.adminClient
    .from("drinks")
    .update({
      name: name.trim(),
      image_url: imageUrl.trim() || null,
      sort: Number.isFinite(sort) ? sort : 100,
      active,
    })
    .eq("id", id);
  if (error) return { error: "Konnte Getränk nicht ändern." };
  revalidatePath("/admin/getraenke");
  revalidatePath("/checkin");
  return { ok: true };
}

export async function deleteDrink(id: string): Promise<AdminState> {
  const g = await assertAdminAction();
  if (!g.ok) return { error: g.error };
  const { error } = await g.adminClient.from("drinks").delete().eq("id", id);
  if (error) return { error: "Konnte Getränk nicht löschen." };
  revalidatePath("/admin/getraenke");
  revalidatePath("/checkin");
  return { ok: true };
}

/* ---------------- User ---------------- */
export async function toggleUserLock(id: string, next: boolean): Promise<AdminState> {
  const g = await assertAdminAction();
  if (!g.ok) return { error: g.error };
  const { error } = await g.adminClient.from("profiles").update({ locked: next }).eq("id", id);
  if (error) return { error: "Konnte User nicht (ent)sperren." };
  revalidatePath("/admin/user");
  revalidatePath("/ranking");
  return { ok: true };
}

export async function deleteUser(id: string): Promise<AdminState> {
  const g = await assertAdminAction();
  if (!g.ok) return { error: g.error };
  // Löscht auth.users -> Kaskade auf profiles und alle abhängigen Daten (Schema).
  const { error } = await g.adminClient.auth.admin.deleteUser(id);
  if (error) return { error: "Konnte User nicht löschen." };
  revalidatePath("/admin/user");
  revalidatePath("/ranking");
  return { ok: true };
}
