"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markAllNotificationsRead(): Promise<{ ok: boolean }> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false };
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    revalidatePath("/benachrichtigungen");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
