"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsRead } from "./actions";

/** Markiert beim Öffnen der Seite alle Benachrichtigungen als gelesen. */
export function MarkRead({ hasUnread }: { hasUnread: boolean }) {
  const router = useRouter();
  const done = useRef(false);
  useEffect(() => {
    if (!hasUnread || done.current) return;
    done.current = true;
    (async () => {
      await markAllNotificationsRead();
      router.refresh();
    })();
  }, [hasUnread, router]);
  return null;
}
