import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Nur für Eingeloggte erreichbar.
const PROTECTED_PREFIXES = [
  "/race",
  "/ranking",
  "/checkin",
  "/freunde",
  "/profil",
  "/events",
  "/benachrichtigungen",
  "/admin",
];
// Für Eingeloggte gesperrt (dann direkt in die App).
const AUTH_ONLY = ["/login", "/registrieren", "/passwort-vergessen"];

function isProtected(path: string) {
  return PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

/**
 * Session-Refresh + Auth-Gating in der Middleware. Hält die Supabase-Auth-Cookies
 * frisch und leitet nicht eingeloggte User von geschützten Routen auf /login.
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (!user && isProtected(path)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  if (user && AUTH_ONLY.some((p) => path === p)) {
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = "/race";
    appUrl.search = "";
    return NextResponse.redirect(appUrl);
  }

  return supabaseResponse;
}
