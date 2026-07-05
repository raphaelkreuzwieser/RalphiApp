import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Liefert eine kurzlebige Signed URL für ein Submission-Video – aber NUR wenn:
 *  - das Video öffentlich ist (video_public = true), ODER
 *  - der Anfragende der Besitzer ist, ODER
 *  - der Anfragende Gschpusi-Admin ist.
 * Sonst 403. Videos liegen im privaten Bucket 'videos' (Abschnitt 6.3 / 7.3).
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Server nicht konfiguriert" }, { status: 500 });
  }

  const { data: sub } = await admin
    .from("submissions")
    .select("video_path, video_public, user_id")
    .eq("id", id)
    .maybeSingle();

  if (!sub || !sub.video_path) {
    return NextResponse.json({ error: "Video nicht gefunden" }, { status: 404 });
  }

  let allowed = sub.video_public === true;

  if (!allowed) {
    // Besitzer oder Admin? Über die Session prüfen.
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        if (user.id === sub.user_id) {
          allowed = true;
        } else {
          const { data: profile } = await admin
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
          if (profile?.role === "admin") allowed = true;
        }
      }
    } catch {
      // keine Session -> bleibt nicht erlaubt
    }
  }

  if (!allowed) {
    return NextResponse.json({ error: "Kein Zugriff auf dieses Video" }, { status: 403 });
  }

  const { data: signed, error } = await admin.storage
    .from("videos")
    .createSignedUrl(sub.video_path, 3600); // 1 h gültig

  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: "Konnte URL nicht erzeugen" }, { status: 500 });
  }

  return NextResponse.json({ url: signed.signedUrl });
}
