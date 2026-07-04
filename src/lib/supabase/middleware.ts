import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Session-Refresh in der Middleware: hält die Supabase-Auth-Cookies frisch,
 * damit Server Components eine gültige Session sehen. Blockt hier noch nicht –
 * seitenspezifischer Schutz (z. B. /admin) passiert serverseitig in den Seiten.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Solange Supabase (noch) nicht konfiguriert ist, die App trotzdem ausliefern.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return supabaseResponse;

  const supabase = createServerClient(
    url,
    anon,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // WICHTIG: refresht die Session. Nicht zwischen createServerClient und
  // getUser() eigenen Code einfügen (sonst schwer debugbare Logout-Bugs).
  await supabase.auth.getUser();

  return supabaseResponse;
}
