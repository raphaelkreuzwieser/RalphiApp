# Shotrace live schalten – Schritt für Schritt

Für: Raphael · Dauer realistisch: 1–2 Stunden · Kosten am Start: 0 €

## Schritt 1: Supabase-Projekt anlegen (ca. 10 min)

1. Auf supabase.com registrieren (mit office@gschpusi.com, kostenlos).
2. "New Project" → Name: `gschpusi-shotrace` → **Region: Central EU (Frankfurt)** ← wichtig für DSGVO! → starkes Datenbank-Passwort vergeben (in euren Passwort-Manager).
3. Links im Menü **SQL Editor** öffnen → kompletten Inhalt von `schema.sql` einfügen → "Run". Es sollte "Success" erscheinen.
4. Links **Storage** → "New bucket" → Name: `videos` → **Public bucket: AUS** (privat!) → File size limit: 100 MB → Allowed MIME types: `video/mp4, video/quicktime`.
5. Links **Authentication → Providers**: E-Mail aktiviert lassen, "Confirm email" einschalten. Unter **Auth → Email Templates** kannst du später die Mails auf Gschpusi-Wording anpassen ("Nach jedem Gschpusi gibt's ein Bussi 😘").
6. **Project Settings → API**: die drei Werte kopieren und sicher ablegen:
   - Project URL
   - anon public key
   - service_role key (GEHEIM – nie ins Frontend!)

## Schritt 2: Code-Projekt (der eigentliche App-Bau)

Das Frontend (Next.js, Struktur siehe ARCHITEKTUR.md) bauen wir am besten in Claude Code direkt auf deinem Laptop – dort entsteht das Projekt Datei für Datei, lokal testbar mit `npm run dev`. Der Design-Stand und alle Flows sind durch den Prototyp fixiert, es wird 1:1 nachgebaut. Als Startpunkt in Claude Code einfach diesen Ordner (schema.sql + ARCHITEKTUR.md + die Prototyp-JSX-Datei) ins Projektverzeichnis legen und sagen: "Bau die Shotrace-App laut ARCHITEKTUR.md, Design wie im Prototyp."

## Schritt 3: Vercel-Deployment (ca. 15 min)

1. Code-Projekt auf GitHub pushen (privates Repo `party-shot/shotrace`).
2. Auf vercel.com registrieren → "Import Project" → das Repo wählen.
3. Environment Variables setzen:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key
4. Deploy klicken → App läuft unter `shotrace.vercel.app`.
5. Eigene Domain: in Vercel `shotrace.gschpusi.com` hinzufügen → den angezeigten CNAME-Eintrag bei eurem Domain-Hoster setzen. Fertig.

## Schritt 4: Erster Admin & Testlauf

1. In der App normal registrieren (dein Account).
2. Im Supabase SQL Editor ausführen:
   `update public.profiles set role = 'admin' where username = 'DEIN_USERNAME';`
3. Testflow: Lauf mit Video einreichen → im Admin freigeben → Ranking prüfen → Event anlegen → Zeit als Event-Admin bestätigen.

## Kosten (Stand Juli 2026, grob)

- **Start (Free Tier):** 0 €/Monat – 1 GB Storage (~10–30 Videos), reicht für interne Tests.
- **Launch:** Supabase Pro 25 $/Monat (100 GB Storage inkl., ~1.000+ Videos) + Vercel Free/Pro. 
- **Haupt-Kostentreiber langfristig:** Videospeicher & Traffic. Gegenmittel: Client-Kompression (ist eingeplant) und abgelehnte/alte Videos nach X Monaten automatisch löschen (Löschkonzept – ohnehin DSGVO-Pflicht).

## Vor dem öffentlichen Launch (nicht überspringen!)

- Datenschutzerklärung + Einwilligungstexte (Standort!) vom Anwalt.
- AV-Vertrag mit Supabase abschließen (Standard-DPA, im Dashboard verfügbar).
- Impressum & AGB verlinken.
- "Enjoy responsibly"-Hinweise sind in der App bereits verankert.
