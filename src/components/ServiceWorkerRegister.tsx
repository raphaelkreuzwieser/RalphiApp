"use client";

import { useEffect } from "react";

/**
 * Registriert den Service Worker (PWA). Push-BERECHTIGUNG wird hier NICHT
 * angefragt – das passiert bewusst erst nach Login (Abschnitt 6.10 / 7).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // im Dev nicht registrieren
    const onLoad = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
