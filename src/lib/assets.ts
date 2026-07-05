/**
 * Feste Asset-URLs (Shopify-CDN) aus dem Übergabeprotokoll (Abschnitt 5).
 */
export const LOGOS = {
  // Hauptlogo (Gschpusi – Home of Partydrinks) – auf weißem Chip einsetzen
  main: "https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Gschpusi_Home-of-Partydrinks_Basic_Claim_Logo_2026.png?v=1781449017",
  // Racer-Logo (Shopify) – Fallback / Video-Platzhalter
  racer:
    "https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Gschpusi-Racer_RGB.png?v=1781606602",
  // Offizielle Shot-Race-Wortmarke (transparent) – Race-Hero & Landing
  shotrace: "/brand/shotrace-logo.png",
  // Shot-Race-Champion-Maskottchen (transparent) – Sieger / Platz 1
  champion: "/brand/shotrace-champion.png",
  // Gschpusi BAR (transparent, weiß) – Getränkeauswahl / Check-in
  bar: "/brand/gschpusi-bar.png",
} as const;

export const EXTERNAL_LINKS = {
  website: "https://gschpusi.com",
  shop: "https://shop.gschpusi.com",
} as const;

const DRINK_CDN_BASE = "https://cdn.shopify.com/s/files/1/0857/9786/3752/files/";

/**
 * Die 13 Seed-Getränke (Einzelgetränke, KEINE Kartons).
 * "Shot Marille" bewusst NICHT dabei – kommt später über die Admin-Verwaltung.
 * Reihenfolge = sort_order für den Seed.
 */
export const SEED_DRINKS = [
  { name: "Shot Kirsch", image: "Gschpusi_Kirsch.png?v=1730822124" },
  { name: "Shot Ice", image: "Gschpusi_Ice.png?v=1730822064" },
  { name: "Shot Feige", image: "Gschpusi_Feige.png?v=1730820854" },
  { name: "Shot Kräuter", image: "Gschpusi_Kraeuter_0.png?v=1730822213" },
  { name: "Shot Sauer", image: "Gschpusi_Sauer.png?v=1731409662" },
  { name: "Shot Sahne", image: "Gschpusi-Sahne_Flasche.png?v=1781450147" },
  { name: "Shot Willi", image: "WilliFlasche.png?v=1730824361" },
  { name: "Espresso Martini", image: "Gschpusi_Espresso.png?v=1781450148" },
  { name: "Skiwasser mit Schuss", image: "Dose_SKIWASSER.png?v=1781449601" },
  { name: "Holunder mit Schuss", image: "Dose_HOLUNDER.png?v=1781449601" },
  {
    name: "Lemon Ice mit Schuss",
    image: "Dose_LEMON_afce43ad-63fc-4f4f-9006-c6f5ce84253c.png?v=1781449602",
  },
  { name: "Gspritzter", image: "Dose_GSPRITZER_kl.png?v=1781449601" },
  { name: "Somma Sprizza", image: "Dose_SOMMA-SPRIZZA_kl.png?v=1781449601" },
].map((d, i) => ({ ...d, imageUrl: DRINK_CDN_BASE + d.image, sortOrder: i }));

/** Pflicht-Hinweis (Login/Registrierung + Footer). */
export const AGE_NOTICE =
  "🔞 18+ · Enjoy responsibly · Verantwortungsvoller Umgang mit Alkohol liegt uns am Herzen";
