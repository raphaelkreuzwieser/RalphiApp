"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { validateUsername, isAdult, validatePassword, isEmail } from "@/lib/validation";

export type AuthState = { error?: string; ok?: boolean; message?: string };

function appOrigin(): string {
  const h = headers();
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    h.get("origin") ||
    `https://${h.get("host") ?? "localhost:3000"}`
  );
}

/* ---------------- Registrierung ---------------- */
export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const full_name = String(formData.get("full_name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const bundesland = String(formData.get("bundesland") ?? "").trim();
  const country_id = String(formData.get("country_id") ?? "").trim();
  const birthdate = String(formData.get("birthdate") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const consent = formData.get("consent_privacy") === "on";

  if (!full_name) return { error: "Bitte gib deinen Namen ein." };
  const uErr = validateUsername(username);
  if (uErr) return { error: uErr };
  if (!country_id) return { error: "Bitte wähle dein Land." };
  if (!birthdate) return { error: "Bitte gib dein Geburtsdatum ein." };
  if (!isAdult(birthdate))
    return { error: "Du musst mindestens 18 Jahre alt sein. 🔞" };
  if (!isEmail(email)) return { error: "Bitte gib eine gültige E-Mail ein." };
  const pErr = validatePassword(password);
  if (pErr) return { error: pErr };
  if (!consent) return { error: "Bitte akzeptiere die Datenschutzerklärung." };

  const supabase = createClient();

  // Username-Kollision früh abfangen (bessere Meldung als der DB-Unique-Fehler).
  try {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .ilike("username", username)
      .maybeSingle();
    if (existing) return { error: "Dieser Username ist schon vergeben. Nimm einen anderen. 😉" };
  } catch {
    // Kein Service-Role-Key konfiguriert – DB-Unique-Constraint fängt es später ab.
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Diese Keys liest der DB-Trigger handle_new_user() aus raw_user_meta_data.
      data: { username, full_name, bundesland, country_id, birthdate, phone },
      emailRedirectTo: `${appOrigin()}/auth/confirm`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered"))
      return { error: "Für diese E-Mail gibt es schon ein Konto. Melde dich an. 😉" };
    return { error: `Registrierung fehlgeschlagen: ${error.message}` };
  }

  return {
    ok: true,
    message:
      "Fast geschafft! Wir haben dir eine E-Mail geschickt – bestätige deine Adresse, dann geht's los. 😘",
  };
}

/* ---------------- Login (E-Mail ODER Username) ---------------- */
export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!identifier || !password) return { error: "Bitte E-Mail/Username und Passwort eingeben." };

  let email = identifier;

  // Username → E-Mail: serverseitig über den Service-Role-Key (nie im Client).
  if (!isEmail(identifier)) {
    try {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("id")
        .ilike("username", identifier)
        .maybeSingle();
      if (!profile) return { error: "Kein Konto mit diesem Username gefunden." };
      const { data: userRes, error: uErr } = await admin.auth.admin.getUserById(profile.id);
      if (uErr || !userRes?.user?.email)
        return { error: "Login gerade nicht möglich. Versuch's mit deiner E-Mail." };
      email = userRes.user.email;
    } catch {
      return { error: "Username-Login ist noch nicht konfiguriert. Nimm bitte deine E-Mail." };
    }
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed"))
      return {
        error: "Bitte bestätige zuerst deine E-Mail – schau in dein Postfach (auch Spam). 📬",
      };
    return { error: "E-Mail/Username oder Passwort stimmt nicht." };
  }

  redirect("/race");
}

/* ---------------- Passwort vergessen ---------------- */
export async function requestPasswordResetAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!isEmail(email)) return { error: "Bitte gib eine gültige E-Mail ein." };

  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appOrigin()}/auth/confirm?next=/passwort-neu`,
  });

  // Immer dieselbe Meldung (keine Auskunft, ob die E-Mail existiert).
  return {
    ok: true,
    message: "Falls es ein Konto gibt, ist der Link zum Zurücksetzen unterwegs. 📬",
  };
}

/* ---------------- Neues Passwort setzen ---------------- */
export async function updatePasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const pErr = validatePassword(password);
  if (pErr) return { error: pErr };

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Passwort konnte nicht geändert werden. Ist der Link noch gültig?" };

  redirect("/race");
}

/* ---------------- Abmelden ---------------- */
export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
