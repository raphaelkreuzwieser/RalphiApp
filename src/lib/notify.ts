import { createAdminClient } from "@/lib/supabase/server";
import { sendPushToUser, type PushPayload } from "@/lib/push";

/**
 * Legt eine Benachrichtigung an (Insert braucht Service-Role, da die
 * notifications-Tabelle keine Insert-Policy hat) und schickt – falls
 * konfiguriert – zusätzlich einen Web Push. In-App-Notification funktioniert
 * auch ohne Push. Fehler werden geschluckt (Benachrichtigung ist Nice-to-have).
 */
export async function createNotification(
  userId: string,
  type: string,
  payload: Record<string, unknown>,
  push?: PushPayload,
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("notifications").insert({ user_id: userId, type, payload });
  } catch {
    return;
  }
  if (push) {
    try {
      await sendPushToUser(userId, push);
    } catch {
      /* Push ist optional */
    }
  }
}
