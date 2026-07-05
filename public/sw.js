/* Gschpusi Shotrace – Service Worker (PWA, Phase 1)
   Ziel M1: Installierbarkeit + Push-Gerüst. Bewusst schlank gehalten,
   damit keine veralteten Inhalte ausgeliefert werden (network-first). */

const CACHE = "shotrace-shell-v1";
const OFFLINE_URLS = ["/", "/race"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_URLS)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

// Network-first für Navigationen, Fallback auf gecachte Shell (offline).
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.mode !== "navigate") return;
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((r) => r || caches.match("/"))),
  );
});

// Web Push (Phase 1) – Notification aus Payload rendern.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Gschpusi Shotrace", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Gschpusi Shotrace";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/icons/icon.svg",
      badge: "/icons/icon.svg",
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
