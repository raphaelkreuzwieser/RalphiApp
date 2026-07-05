import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase-Client für den Browser (Client Components).
 * Verwendet ausschließlich die öffentlichen Keys (URL + Anon).
 * Der Service-Role-Key darf hier NIEMALS landen (Abschnitt 7.1).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
