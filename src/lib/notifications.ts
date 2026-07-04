import { createClient, createAdminClient } from "@/lib/supabase/server";
import { formatSeconds } from "@/lib/format";

function hasEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
function adminOrNull() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

export interface NotificationItem {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  emoji: string;
  text: string;
}

/** Anzahl ungelesener Benachrichtigungen (für den Punkt an der Glocke). */
export async function getUnreadCount(): Promise<number> {
  if (!hasEnv()) return 0;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("read", false);
    return count ?? 0;
  } catch {
    return 0;
  }
}

function render(
  type: string,
  payload: Record<string, any>,
  nameOf: (id: string) => string,
): { emoji: string; text: string } {
  const time = payload.time_seconds != null ? ` (${formatSeconds(payload.time_seconds)})` : "";
  switch (type) {
    case "submission_approved":
      return { emoji: "✅", text: `Dein Lauf${time} wurde freigegeben – ab ins Ranking! 🏁` };
    case "submission_rejected":
      return { emoji: "❌", text: `Dein Lauf${time} wurde leider abgelehnt.` };
    case "reaction":
      return {
        emoji: "❤️",
        text: `@${nameOf(payload.from)} hat auf deinen Check-in reagiert: „${payload.text ?? ""}"`,
      };
    case "friend_request":
      return { emoji: "🤝", text: `@${nameOf(payload.requester)} möchte dein Freund sein.` };
    case "friend_accepted":
      return { emoji: "🎉", text: `@${nameOf(payload.by)} hat deine Anfrage angenommen!` };
    case "event_confirmed":
      return { emoji: "🎉", text: `Deine Event-Zeit${time} wurde bestätigt!` };
    case "event_rejected":
      return { emoji: "❌", text: `Deine Event-Zeit${time} wurde abgelehnt.` };
    default:
      return { emoji: "🔔", text: "Neue Benachrichtigung." };
  }
}

/** Benachrichtigungen des aktuellen Users, neueste zuerst, fertig formatiert. */
export async function getNotifications(): Promise<NotificationItem[]> {
  if (!hasEnv()) return [];
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from("notifications")
      .select("id, type, payload, read, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!data) return [];

    // Akteur-Usernamen auflösen (from/requester/by).
    const actorIds = Array.from(
      new Set(
        data
          .map((n: any) => n.payload?.from ?? n.payload?.requester ?? n.payload?.by)
          .filter(Boolean),
      ),
    ) as string[];
    const nameMap = new Map<string, string>();
    const admin = adminOrNull();
    if (admin && actorIds.length) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, username")
        .in("id", actorIds);
      (profiles ?? []).forEach((p: any) => nameMap.set(p.id, p.username));
    }
    const nameOf = (id: string) => nameMap.get(id) ?? "jemand";

    return data.map((n: any) => {
      const { emoji, text } = render(n.type, n.payload ?? {}, nameOf);
      return { id: n.id, type: n.type, read: n.read, createdAt: n.created_at, emoji, text };
    });
  } catch {
    return [];
  }
}
