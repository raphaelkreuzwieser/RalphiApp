# Gschpusi Shotrace 🏁

Mobile-first Community-Web-App (PWA) rund um das **Shotrace Pack** – Shot-Wetttrinken
mit elektronischer Zeitmessung. Home of Partydrinks · Party-Shot GmbH, Thalheim bei Wels.

Drei Säulen: **Shotrace Challenge** (Video-Upload + Ranking), **Event-Challenges**
(interne Rankings für Feste/Bars) und **Drink Check-in** (Social-Feature für Freunde).

## Stack

- **Next.js 14** (App Router, TypeScript) → Vercel (fra1)
- **Supabase** (eu-central-1 Frankfurt): Auth, Postgres + RLS, Storage (`videos`, privat), Realtime
- **Tailwind CSS** mit dem Gschpusi-Design-System (siehe `tailwind.config.ts`)
- **PWA**: Manifest, Service Worker, Web Push (Phase 1)
- Video-Upload: TUS resumable (`tus-js-client`)

## Projektstruktur

```
src/
├─ app/
│  ├─ (public)/        Landing Page + Rechtsseiten (Datenschutz/Impressum/AGB)
│  ├─ (auth)/          Login, Registrieren, Passwort vergessen  (M2)
│  ├─ (app)/           Eingeloggte App mit Bottom-Nav (Race/Ranking/Check-in/Freunde/Mehr)
│  ├─ layout.tsx       Root-Layout, Metadaten, PWA, Service-Worker-Registrierung
│  └─ globals.css      Design-Tokens + LED-Signature-Element
├─ components/         UI-Bausteine (LED-Zeit, Karten, Buttons, Bottom-Nav, ...)
└─ lib/
   ├─ supabase/        Browser-, Server- & Admin-Client + Middleware (Session-Refresh)
   ├─ assets.ts        Logos, externe Links, 13 Seed-Getränke
   ├─ format.ts        Zeit-Formatierung (3,42 s), relative Zeit
   └─ database.types.ts TypeScript-Typen zum Schema

supabase/
├─ schema.sql          FIXES Schema (Tabellen, RLS, Views, Trigger, RPCs) – in Supabase einspielen
└─ seed_drinks.sql     Seed der 13 Einzelgetränke (nach schema.sql ausführen)

docs/                  Übergabeprotokoll, Architektur, Deploy-Anleitung, Prototyp-Referenz
```

## Lokal starten

```bash
npm install
cp .env.example .env.local   # Supabase-Werte eintragen
npm run dev
```

`.env.local` (Werte aus Supabase → Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # nur serverseitig!
NEXT_PUBLIC_APP_URL=https://shotrace.gschpusi.com
```

Deployment & Supabase-Setup: siehe `docs/DEPLOY-ANLEITUNG.md`.

## Meilensteine

- **M1 – Fundament** ✅ Setup, Design-System, App-Shell + Bottom-Nav, PWA, Landing, Rechtsseiten
- **M2 – Auth** · **M3 – Shotrace-Kern** · **M4 – Admin** · **M5 – Events** · **M6 – Social** · **M7 – Politur**

Details: `docs/UEBERGABEPROTOKOLL-CLAUDE-CODE.md`.
