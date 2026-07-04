import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Supabase-Client für Server Components, Route Handlers und Server Actions.
 * Nutzt den Anon-Key + Session-Cookies des eingeloggten Users (RLS greift).
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // In Server Components kann set() fehlschlagen – wird von der
            // Middleware aufgefangen (Session-Refresh dort).
          }
        },
      },
    },
  );
}

/**
 * Admin-Client mit Service-Role-Key – umgeht RLS.
 * NUR in Server-Code aufrufen (Route Handlers / Server Actions),
 * für serverseitig geprüfte, privilegierte Aktionen (Signed URLs für Admin,
 * CSV-Export, Moderation). Niemals an den Client geben (Abschnitt 7.1).
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY fehlt – nur serverseitig verfügbar.");
  }
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
