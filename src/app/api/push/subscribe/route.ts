import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Speichert ein Web-Push-Abo für den eingeloggten User (RLS: nur eigene).
 * Der eigentliche Versand passiert serverseitig über lib/push.ts, sobald
 * VAPID-Keys gesetzt sind. In-App-Benachrichtigungen funktionieren unabhängig.
 */
export async function POST(request: NextRequest) {
  let sub: any;
  try {
    sub = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiges Abo" }, { status: 400 });
  }
  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Abo unvollständig" }, { status: 400 });
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert({ user_id: user.id, endpoint, p256dh, auth }, { onConflict: "endpoint" });
    if (error) return NextResponse.json({ error: "Konnte Abo nicht speichern" }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // ohne Backend trotzdem freundlich
  }
}
