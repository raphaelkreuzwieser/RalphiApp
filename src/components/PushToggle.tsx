"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { Toggle } from "@/components/Toggle";

/**
 * Web-Push-Berechtigung – wird BEWUSST erst hier (nach Login, in den
 * Einstellungen) auf User-Aktion angefragt, nicht beim ersten Seitenaufruf
 * (Abschnitt 6.10 / 7). Registriert bei Zustimmung ein Push-Abo, wenn ein
 * VAPID-Public-Key konfiguriert ist.
 */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function PushToggle() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  async function enable() {
    setNote(null);
    if (permission === "unsupported") return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result !== "granted") {
      setNote("Push wurde nicht erlaubt – du kannst das in den Browser-Einstellungen ändern.");
      return;
    }

    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) {
      setNote("Push ist aktiviert. Server-Versand wird eingerichtet, sobald die Keys hinterlegt sind.");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid) as BufferSource,
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setNote("Push aktiviert – wir sagen dir Bescheid, wenn was los ist. 🔔");
    } catch {
      setNote("Push-Abo konnte nicht eingerichtet werden.");
    }
  }

  const on = permission === "granted";

  return (
    <>
      <Card className="mb-2 flex items-center justify-between">
        <div className="text-sm text-creme">🔔 Push-Benachrichtigungen</div>
        <Toggle
          on={on}
          onClick={() => {
            if (!on) enable();
          }}
          label="Push aktivieren"
        />
      </Card>
      {note && <p className="mb-2 px-1 text-[11px] text-muted">{note}</p>}
      {permission === "unsupported" && (
        <p className="mb-2 px-1 text-[11px] text-muted">
          Dein Browser unterstützt keine Web-Push-Benachrichtigungen.
        </p>
      )}
    </>
  );
}
