"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Leichte Revalidierung: aktualisiert die Server-Daten in Intervallen und beim
 * Zurückkehren auf den Tab. So erscheinen Freigaben im Ranking/„Meine Läufe"
 * ohne manuelles Neuladen (Abschnitt 6.2/6.3 – „Realtime ODER Revalidierung").
 */
export function AutoRefresh({ intervalMs = 20000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, intervalMs]);
  return null;
}
