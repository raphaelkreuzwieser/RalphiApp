# Gschpusi Shotrace – Architektur (v1.0)

Party-Shot GmbH · Stand 03.07.2026

## Stack-Entscheidung

Die Web-App wird als Next.js-Anwendung gebaut und mit Supabase als Backend betrieben. Diese Kombination deckt alle Anforderungen aus der Spezifikation ab, ohne dass ein eigener Server betrieben werden muss: Supabase liefert Auth (E-Mail-Registrierung mit Verifizierung und Passwort-vergessen out of the box), eine PostgreSQL-Datenbank mit Row Level Security, Video-Storage mit resumable Uploads (TUS-Protokoll, wichtig bei 100-MB-Dateien am Handy) und Realtime-Updates für den Check-in-Feed. Hosting-Region ist eu-central-1 (Frankfurt), womit die DSGVO-Anforderung "EU-Hosting" erfüllt ist. Das Frontend läuft auf Vercel (Region fra1) und wird als PWA ausgeliefert – damit ist die App am Homescreen installierbar und Web-Push-Benachrichtigungen funktionieren auf Android und iOS (ab 16.4). Die spätere native App (React Native/Expo) kann dieselbe Supabase-Instanz und dieselben Datenstrukturen unverändert weiterverwenden – nichts von dieser Arbeit ist Wegwerfarbeit.

## Datenmodell

Das komplette Schema liegt in `schema.sql` und bildet die Spezifikation plus Event-Challenges ab. Die wichtigsten Design-Entscheidungen:

**Privatsphäre per Datenbank erzwungen, nicht nur per UI.** Der echte Name, Geburtsdatum und Telefonnummer liegen in `profiles` und sind per Row Level Security nur für den User selbst und Admins lesbar. Öffentliche Rankings laufen über die View `ranking`, die ausschließlich Username, Land und Zeit exponiert. Selbst wenn im Frontend ein Fehler passiert, kann die Datenbank keine echten Namen ausliefern.

**Der Moderations-Workflow ist der Kern.** `submissions` trägt den Status pending/approved/rejected; nur approved-Einträge erscheinen in der Ranking-View. Der Ja/Nein-Schalter für die Video-Veröffentlichung ist das Feld `video_public`. Videos liegen in einem privaten Storage-Bucket – abspielbar nur über serverseitig erzeugte Signed URLs, und die gibt es nur für Einträge mit `video_public = true`.

**Event-Challenges mit automatischer Pipeline.** Events haben einen `admin_id` (registrierter User als Event-Admin, übertragbar). Event-Zeiten leben in `event_submissions` und zählen nur intern. Ein Datenbank-Trigger (`handle_event_confirmation`) erzeugt automatisch eine offizielle pending-Submission, sobald der Event-Admin einen Lauf mit Videobeweis bestätigt – das Feld `via_event` macht die Herkunft im Admin-Dashboard sichtbar. Die Regel "ins offizielle Ranking nur mit Videobeweis" ist damit in der Datenbank verankert und nicht umgehbar.

**Check-ins sind konsequent freundesbasiert.** Die RLS-Policy auf `checkins` erlaubt Lesen nur für den User selbst und bestätigte Freunde (`are_friends()`-Funktion). Es gibt keinen öffentlichen Feed. Die 18+-Prüfung ist als CHECK-Constraint auf dem Geburtsdatum hinterlegt – eine Registrierung unter 18 scheitert bereits auf Datenbankebene.

## Projektstruktur (Next.js 14, App Router)

```
shotrace/
├─ app/
│  ├─ (public)/
│  │  ├─ page.tsx                  # Landing Page (Shotrace-Vorstellung, öffentliche Rankings, Store-/Shop-Links)
│  │  └─ ranking/page.tsx          # Öffentliches Ranking (ohne Login einsehbar)
│  ├─ (auth)/
│  │  ├─ login/page.tsx
│  │  ├─ registrieren/page.tsx     # inkl. 18+-Check & Einwilligungen
│  │  └─ passwort-vergessen/page.tsx
│  ├─ (app)/                       # eingeloggt, mit Bottom-Navigation
│  │  ├─ race/page.tsx             # Hero, Lauf einreichen (Video-Upload), meine Läufe
│  │  ├─ ranking/page.tsx          # Offiziell + Events (Umschalter)
│  │  ├─ events/[id]/page.tsx      # Event-Detail: Ranking, Zeit eintragen, Event-Admin-Moderation
│  │  ├─ checkin/page.tsx          # Feed + Check-in-Sheet mit Produktbildern
│  │  ├─ freunde/page.tsx          # Anfragen, Liste mit Bestzeiten, blockieren
│  │  └─ profil/page.tsx           # Bestzeit, Einstellungen (Standort-Opt-in), Links Website/Shop
│  ├─ admin/                       # nur role = 'admin'
│  │  ├─ moderation/page.tsx       # Pending-Liste, Video-Player, Freigeben/Ablehnen, video_public-Schalter
│  │  ├─ laender/page.tsx
│  │  ├─ getraenke/page.tsx
│  │  ├─ antworten/page.tsx
│  │  ├─ user/page.tsx
│  │  └─ statistik/page.tsx        # Uploads, Ø-Zeiten, aktivste Länder, CSV-Export
│  └─ api/
│     ├─ video-url/route.ts        # Signed URL nur wenn video_public = true
│     └─ export/route.ts           # Ranking-CSV für Admins
├─ components/                     # UI-Bausteine (LED-Zeit, Ranking-Card, Drink-Grid, ...)
├─ lib/
│  ├─ supabase/                    # Client (Browser + Server), typisierte Queries
│  └─ upload.ts                    # TUS-Resumable-Upload mit Fortschrittsanzeige & Client-Kompression
├─ public/manifest.json            # PWA (Name, Icons, Theme #E8283C)
└─ .env.local                      # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

## Video-Upload-Flow

Der Upload passiert direkt vom Handy in den Storage-Bucket (nicht über den eigenen Server): Client-seitige Prüfung (MP4/MOV, max. 60 s, max. 100 MB) → resumable Upload via TUS mit Fortschrittsbalken → danach wird die Submission mit `video_path` angelegt. Serverseitige Transkodierung/Vereinheitlichung kann später als Supabase Edge Function oder über einen Dienst wie Mux ergänzt werden; für den Start reicht die Formatprüfung, da Videos primär intern (Moderation) angesehen werden.

## Push-Benachrichtigungen

Phase 1 (Web-App): Web Push über die PWA – Freigabe/Ablehnung, Reaktionen, Freundschaftsanfragen werden beim Statuswechsel in `notifications` geschrieben und per Push ausgeliefert. Phase 2 (native App): Umstieg auf FCM/APNs, die `notifications`-Tabelle bleibt identisch.

## Was bewusst NICHT in Version 1 ist

Social Login (laut Spec nicht gewünscht), automatische Zeiterkennung aus dem Video (bleibt manuelle Prüfung durchs Team), mehrere Pack-Kategorien (Datenmodell ist vorbereitet – `submissions` kann später eine `category_id` bekommen), App-Store-Versionen (folgt als React Native auf derselben Basis).

## Offene rechtliche Punkte vor Launch (aus der Spec, Punkt 8)

Datenschutzerklärung inkl. Standort-Einwilligung, AV-Vertrag mit Supabase (Standard-DPA verfügbar), Löschkonzept (Account-Löschung kaskadiert bereits im Schema), und die Einschätzung zur App-Store-Freigabefähigkeit der Trink-Challenge. Anwaltlich prüfen lassen.
