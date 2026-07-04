import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

function hasEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Guard für Admin-SEITEN: erzwingt eine eingeloggte Session mit role='admin'.
 * Leitet sonst weiter (nicht eingeloggt -> /login, kein Admin -> /race).
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  if (!hasEnv()) redirect("/login");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/race");

  return { userId: user.id };
}

/**
 * Guard für Admin-ACTIONS: prüft die Rolle und gibt bei Erfolg den
 * Service-Role-Client zurück (umgeht RLS – nur nach bestätigter Admin-Rolle
 * verwenden). Gibt sonst einen Fehler zurück, statt zu werfen.
 */
export async function assertAdminAction(): Promise<
  | { ok: true; adminClient: ReturnType<typeof createAdminClient>; userId: string }
  | { ok: false; error: string }
> {
  if (!hasEnv()) return { ok: false, error: "Server nicht konfiguriert." };
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Nicht angemeldet." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "admin") return { ok: false, error: "Keine Admin-Berechtigung." };

    return { ok: true, adminClient: createAdminClient(), userId: user.id };
  } catch {
    return { ok: false, error: "Server-Fehler." };
  }
}
