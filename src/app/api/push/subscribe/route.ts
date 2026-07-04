import { NextResponse, type NextRequest } from "next/server";

/**
 * Nimmt ein Web-Push-Abo entgegen. Für den tatsächlichen Server-Versand fehlt
 * im FIXEN Schema (noch) eine push_subscriptions-Tabelle + VAPID-Keys + ein
 * Sender (z. B. Supabase Edge Function auf notifications-Insert). Solange das
 * nicht eingerichtet ist, wird das Abo hier nur bestätigt (In-App-Notifications
 * funktionieren unabhängig davon).
 */
export async function POST(request: NextRequest) {
  try {
    await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiges Abo" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
