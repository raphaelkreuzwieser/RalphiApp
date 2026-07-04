# CLAUDE.md – Gschpusi Shotrace

Kontext für die Weiterentwicklung mit Claude Code.

## Was das ist
Mobile-first PWA rund um das **Shotrace Pack** (Shot-Wetttrinken mit Zeitmessung).
Drei Säulen: Shotrace Challenge (Video-Upload + Ranking), Event-Challenges,
Drink Check-in (Social). Next.js 14 (App Router, TS) + Supabase, Deployment Vercel.

## Befehle
- `npm run dev` – lokal starten (braucht `.env.local`, siehe `.env.example`)
- `npm run build` – Produktions-Build (typecheck + lint laufen mit)
- `npm run test` – Vitest (reine Logik: `format`, `validation`)
- `npm run gen:vapid` – VAPID-Keys für Web Push erzeugen

## Verbindliche Quellen (NICHT eigenmächtig ändern)
- `supabase/schema.sql` – FIXES DB-Schema (Tabellen, RLS, Views, Trigger, RPCs).
  Änderungen nur als additive Migration unter `supabase/migrations/` + Rücksprache.
- `docs/UEBERGABEPROTOKOLL-CLAUDE-CODE.md` – Spezifikation & Akzeptanzkriterien
- `docs/ARCHITEKTUR.md`, `docs/prototyp-referenz.jsx` – Design/UX-Referenz (1:1)

## Architektur-Regeln
- **Design-System**: Tokens in `tailwind.config.ts` + `globals.css`. LED-Zeit immer
  über `<LedTime>` (Gold, Glow, Komma-Dezimal, z. B. `3,42 s`).
- **Supabase-Clients** (`src/lib/supabase/`): `client` (Browser), `server`
  (RLS-Session), `createAdminClient` (Service-Role – NUR serverseitig!).
- **Sicherheit**: `SUPABASE_SERVICE_ROLE_KEY` nie im Client. Öffentliche Daten nur
  über Views `ranking`/`event_ranking` + RPCs. Videos nur über Signed URLs mit
  serverseitiger Prüfung (`/api/video-url`).
- **RLS-Grenze**: `profiles` ist für Fremde nicht lesbar. Fremd-Usernamen (Freunde,
  Feed, Login-Lookup) werden serverseitig über den Service-Role-Key aufgelöst –
  nur für legitim Berechtigte.
- **Benachrichtigungen**: immer über `createNotification()` (`src/lib/notify.ts`) –
  legt die In-App-Notification an und schickt (falls VAPID gesetzt) einen Web Push.
- **Neue Seiten mit Session/Daten**: `export const dynamic = "force-dynamic"`.

## Projektstruktur
```
src/app/(public)   Landing + Recht  |  (auth) Login/Registrieren/Reset
src/app/(app)      Race/Ranking/Check-in/Freunde/Profil/Events (Bottom-Nav)
src/app/admin      6 Admin-Module (role='admin', requireAdmin)
src/app/api        video-url, export, push/subscribe, auth/confirm
src/lib            supabase, data/social/events/notifications, format, validation
```

## Offen
- Web-Push-Versand: Migration `supabase/migrations/001_push_subscriptions.sql`
  ausführen + VAPID-Keys (`npm run gen:vapid`) setzen. Code ist fertig.
- Lighthouse mobil (≥90) am Live-Deploy prüfen.
