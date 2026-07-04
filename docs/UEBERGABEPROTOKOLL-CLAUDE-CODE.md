# ÜBERGABEPROTOKOLL – Gschpusi Shotrace Web-App

**An:** Claude Code
**Von:** Raphael Kreuzwieser, Geschäftsführer Party-Shot GmbH (Gschpusi – Home of Partydrinks, Thalheim bei Wels)
**Datum:** 03.07.2026 · **Version:** 1.0
**Arbeitssprache:** Deutsch (Kommunikation mit Raphael), Code/Kommentare auf Englisch erlaubt.

---

## 1. Projektziel

Baue die **Gschpusi Shotrace Web-App**: eine mobile-first Community-Web-App rund um das physische "Shotrace Pack" (Shot-Wetttrinken mit elektronischer Zeitmessung, Zeit am LED-Display des Packs ablesbar). Die App wird als PWA ausgeliefert und später 1:1 als native App (React Native) nachgezogen – daher: saubere Trennung von UI und Datenlogik.

**Die App hat drei Säulen:**
1. **Shotrace Challenge** – User laden Videos ihrer Läufe hoch, tragen die Zeit manuell ein, das Gschpusi-Team prüft (Zeit am Display im Video ablesen) und gibt frei. Erst dann erscheint die Zeit im öffentlichen Ranking.
2. **Event-Challenges** – Veranstaltungen (Festivals, Zeltfeste, Bars) erstellen eigene interne Rankings (z. B. "Beachparty XXL – Wels"). Ein registrierter User fungiert als Event-Admin und bestätigt Zeiten. Ins offizielle Ranking kommen Event-Läufe NUR mit Videobeweis.
3. **Drink Check-in** – Social Feature: User checken ein, welches Getränk sie wo trinken. Nur bestätigte Freunde sehen das (inkl. genauer Adresse, Opt-in) und können reagieren.

---

## 2. Mitgelieferte Dateien (Quelle der Wahrheit)

| Datei | Zweck | Verbindlichkeit |
|---|---|---|
| `schema.sql` | Komplettes Supabase/Postgres-Schema inkl. RLS, Views, Trigger | **FIX. Nicht ändern ohne Rücksprache mit Raphael.** Das Schema ist bereits in Supabase eingespielt bzw. wird 1:1 eingespielt. |
| `ARCHITEKTUR.md` | Stack-Entscheidungen, Projektstruktur, Upload-Flow, Push-Konzept | Verbindlich. Bei Konflikten mit diesem Protokoll gilt dieses Protokoll. |
| `prototyp-referenz.jsx` | Klickbarer React-Prototyp (User-App + Admin) | **Design- und UX-Referenz.** Look & Feel, Wording, Flows 1:1 übernehmen. Die Datenhaltung darin (window.storage, Seed-Daten) NICHT übernehmen – echte Supabase-Anbindung bauen. |
| `DEPLOY-ANLEITUNG.md` | Supabase/Vercel-Setup für Raphael | Referenz für Env-Variablen und Deployment-Ziel. |

---

## 3. Tech-Stack (fix, nicht diskutieren)

- **Next.js 14+ (App Router, TypeScript)**, Deployment auf Vercel (Region fra1)
- **Supabase** (Projekt-Region eu-central-1 Frankfurt): Auth, Postgres mit RLS, Storage (Bucket `videos`, privat), Realtime
- **PWA**: manifest.json, Service Worker, Web Push (Phase 1)
- Styling: Tailwind CSS ODER CSS-in-JS – frei wählbar, aber das Design-System aus Abschnitt 5 exakt umsetzen
- Video-Upload: **TUS resumable upload** (Supabase-Storage-Standard) mit Fortschrittsanzeige
- Keine weiteren Backend-Dienste, keine eigene Server-Infrastruktur

---

## 4. Rollen & Begriffe

- **User**: registrierte Person. Öffentlich erscheint IMMER nur der Username, niemals der echte Name.
- **Gschpusi-Admin** (`profiles.role = 'admin'`): moderiert offizielle Einreichungen, verwaltet Stammdaten, User, Analytics.
- **Event-Admin** (`events.admin_id`): normaler registrierter User, der die Zeiten SEINES Events bestätigt. Rolle ist übertragbar (nur an registrierte, nicht gesperrte User).
- **Submission**: offizielle Einreichung (Video + manuell eingetragene Zeit), Status pending → approved/rejected.
- **Event-Submission**: Zeit innerhalb eines Events, Status pending → confirmed/rejected durch den Event-Admin.
- **Bestzeit**: schnellste APPROVED-Zeit eines Users. Für Freunde IMMER sichtbar (Freunde-Liste, Check-in-Feed, Profil).

---

## 5. Design-System (aus dem Prototyp, exakt übernehmen)

### Farben
```
Hintergrund:      #160A0E   (Nachtclub-Dunkel mit Rotstich)
Panel:            #241218
Panel 2 / Input:  #2E171F
Linien/Border:    #42222C
Gschpusi-Rot:     #E8283C   (Primär-Buttons, aktive Zustände)
Rot dunkel:       #B01528
Bussi-Rosa:       #FF8FA3   (Akzente, Social-Elemente)
Gold:             #FFB347   (Zeitmessung, Admin, Auszeichnungen)
Creme:            #FFF3EE   (Text)
Gedämpft:         #B98E97   (Sekundärtext)
```

### Signature-Element: LED-Zeitanzeige
Alle Zeiten werden im "LED-Display-Stil" dargestellt wie am echten Shotrace Pack: Monospace, fett, Gold (#FFB347), leichter Glow (`text-shadow: 0 0 12px rgba(255,179,71,0.55)`), tabular-nums. Format: Komma als Dezimaltrennzeichen, z. B. `3,42 s`.

### Logos (Shopify-CDN, direkt verwendbar)
```
Hauptlogo (auf weißem Chip einsetzen, da dunkler Hintergrund):
https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Gschpusi_Home-of-Partydrinks_Basic_Claim_Logo_2026.png?v=1781449017

Racer-Logo (Race-Screen-Hero, Video-Platzhalter):
https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Gschpusi-Racer_RGB.png?v=1781606602
```

### Produktbilder für den Check-in (Einzelgetränke, KEINE Kartons/Packages!)
Basis-URL: `https://cdn.shopify.com/s/files/1/0857/9786/3752/files/`
```
Shot Kirsch:            Gschpusi_Kirsch.png?v=1730822124
Shot Ice:               Gschpusi_Ice.png?v=1730822064
Shot Feige:             Gschpusi_Feige.png?v=1730820854
Shot Kräuter:           Gschpusi_Kraeuter_0.png?v=1730822213
Shot Sauer:             Gschpusi_Sauer.png?v=1731409662
Shot Sahne:             Gschpusi-Sahne_Flasche.png?v=1781450147
Shot Willi:             WilliFlasche.png?v=1730824361
Espresso Martini:       Gschpusi_Espresso.png?v=1781450148
Skiwasser mit Schuss:   Dose_SKIWASSER.png?v=1781449601
Holunder mit Schuss:    Dose_HOLUNDER.png?v=1781449601
Lemon Ice mit Schuss:   Dose_LEMON_afce43ad-63fc-4f4f-9006-c6f5ce84253c.png?v=1781449602
Gspritzter:             Dose_GSPRITZER_kl.png?v=1781449601
Somma Sprizza:          Dose_SOMMA-SPRIZZA_kl.png?v=1781449601
```
Diese 13 Getränke als Seed-Daten in `drinks` einspielen (Migration/Seed-Script schreiben). Produktbilder auf weißen, abgerundeten Chips darstellen (dunkler Hintergrund!). "Shot Marille" existiert als Produkt, hat aber noch keinen Freisteller – NICHT seeden, kommt später über die Admin-Getränkeverwaltung.

### Ton & Wording
Frech, herzlich, österreichisch, Du-Form. Emojis gezielt (😘 🏁 🍻 ❤️). Beispiele aus dem Prototyp übernehmen ("Wie schnell bist du? Beweis es. 🏁", "Trinkst du schon wieder ohne mich? 😤"). Pflicht-Hinweise auf Login/Registrierung und im Footer: "🔞 18+ · Enjoy responsibly · Verantwortungsvoller Umgang mit Alkohol liegt uns am Herzen".

### Mobile-first
Ziel-Viewport 360–430 px, max-width 430 px zentriert auf Desktop. Bottom-Navigation mit 5 Tabs: Race · Ranking · Check-in · Freunde · Mehr. Safe-Area-Insets beachten. Bottom-Sheets für "Lauf einreichen" und "Check-in".

---

## 6. Feature-Spezifikation mit Akzeptanzkriterien

### 6.1 Registrierung & Login
- Registrierung NUR per E-Mail (kein Social Login). Felder: Name (privat), Username (öffentlich, 3–24 Zeichen, a–z 0–9 _ .), Bundesland, Land (Dropdown aus `countries`), Geburtsdatum, E-Mail, Telefonnummer, Passwort.
- **18+-Check:** Geburtsdatum < heute − 18 Jahre, sonst Registrierung mit klarer Meldung abbrechen. (DB-Constraint existiert zusätzlich.)
- Einwilligungs-Checkboxen: Datenschutzerklärung (Pflicht), Standort-Sharing-Erklärung (Info).
- E-Mail-Verifizierung über Supabase Auth. Login mit **E-Mail ODER Username** + Passwort (Username → E-Mail-Lookup über eine security-definer RPC-Funktion, NICHT über offenes Profile-Select). Passwort-vergessen-Flow.
- ✅ *Akzeptanz:* Unter-18-Registrierung unmöglich; Username-Login funktioniert; unbestätigte E-Mail kann sich nicht einloggen.

### 6.2 Race-Tab & Lauf einreichen
- Hero: Racer-Logo, Europarekord (LED, live aus `ranking`-View), CTA "Lauf einreichen".
- Karte "Deine Bestzeit" mit Badge "Für Freunde sichtbar".
- 3-Schritt-Bottom-Sheet: (1) Video wählen – **echter Upload**: MP4/MOV, max. 60 s (Client-Prüfung via Video-Metadaten), max. 100 MB, TUS-Upload in `videos/{user_id}/{uuid}.mp4` mit Fortschrittsbalken, Abbruch/Wiederaufnahme möglich; (2) Zeit eintragen (Dezimal-Eingabe, Komma ODER Punkt akzeptieren); (3) Zusammenfassung → Submission anlegen (status pending, country aus Profil).
- Liste "Meine Läufe" mit Status-Badges (PENDING gold / FREIGEGEBEN grün / ABGELEHNT rot), neueste zuerst.
- ✅ *Akzeptanz:* 110-MB-Datei wird abgelehnt; 65-s-Video wird abgelehnt; Upload-Abbruch lässt keine verwaiste Submission zurück; nach Einreichung Status sofort sichtbar.

### 6.3 Offizielles Ranking
- Segment-Umschalter oben: **🏆 Offiziell | 🎉 Events**.
- Offiziell: Länder-Pills (🇪🇺 Europa = alle + alle aktiven `countries`, dynamisch – neue Länder aus dem Admin erscheinen ohne Deploy). Sortierung aufsteigend nach Zeit. Anzeige: Platz (🥇🥈🥉, dann Zahl), Username, Landesflagge, LED-Zeit. Eigener Eintrag rosa hervorgehoben.
- **Video-Button** nur bei `video_public = true`: Abspielen **eingebettet** (Inline-Player im Overlay, kein externes Popup/Tab). Videoquelle: Signed URL vom Route Handler `/api/video-url` – dieser prüft serverseitig `video_public`, sonst 403.
- Ranking aktualisiert sich nach Freigaben automatisch (Supabase Realtime auf `submissions` oder Revalidierung).
- ✅ *Akzeptanz:* Nicht freigegebene Videos sind auch per direktem API-Aufruf nicht abrufbar; neues Land im Admin → sofort eigener Ranking-Tab.

### 6.4 Event-Challenges
- Events-Ansicht: Liste aller aktiven Events (Name, Event-Admin, Anzahl bestätigter Zeiten; für den Event-Admin zusätzlich "X zu prüfen!"-Hinweis) + "Eigene Challenge starten" (Name eingeben → Ersteller wird Event-Admin).
- Event-Detail: internes Ranking (bestätigte Zeiten, 🎬-Marker bei Videobeweis), "Meine Zeit eintragen" mit **Toggle "Mit Videobeweis"** – wenn an, ist der Video-Upload verpflichtend (gleicher Upload-Flow wie 6.2, `event_submissions.video_path`).
- Event-Admin sieht Pending-Liste seines Events und bestätigt/lehnt ab. **Die Pipeline ins offizielle Ranking macht der DB-Trigger `handle_event_confirmation` automatisch** – das Frontend setzt NUR den Status auf confirmed. Nichts doppelt implementieren!
- Event-Admin kann die Rolle an einen anderen registrierten, nicht gesperrten User übertragen (Suche via `search_usernames` RPC).
- Im Gschpusi-Admin erscheinen Event-stämmige Submissions mit Badge "🎉 via {Eventname}" (`via_event` → Event-Name auflösen).
- ✅ *Akzeptanz:* Bestätigung ohne Videobeweis erzeugt KEINE offizielle Submission; mit Videobeweis erscheint sie automatisch im Admin-Pending; Nicht-Event-Admin kann keine fremden Event-Zeiten bestätigen (RLS greift, UI blendet aus).

### 6.5 Drink Check-in
- CTA "Was trinkst du gerade?" → Bottom-Sheet: 3-spaltiges Grid der aktiven `drinks` mit Produktbild + "+ Eigenes Getränk" (Freitext). Standort-Toggle (Default: Profil-Einstellung): bei AN Geolocation API → Reverse Geocoding zur Adresse (Nominatim o. ä.) → `location_text` + lat/lng; bei AUS "Standort nicht geteilt".
- **Ein aktiver Check-in pro User**: neuer Check-in ersetzt den alten im Feed (alte bleiben in der DB, Feed zeigt nur den jeweils letzten pro Freund).
- Feed: nur Check-ins bestätigter Freunde (RLS erzwingt das zusätzlich). Pro Eintrag: Produktbild, @Username **+ dessen Bestzeit (LED, klein)**, Getränk, Adresse, Zeitstempel relativ ("vor 12 min").
- Reaktionen: vordefinierte Chips aus `reaction_templates` + Freitextfeld. Reaktion → Insert in `checkin_reactions` + Notification an den Eincheckenden (Push Phase 1: Web Push; mindestens In-App-Notification-Insert).
- ✅ *Akzeptanz:* Fremde (Nicht-Freunde) sehen weder Check-in noch Adresse – auch nicht per direkter API; neuer Check-in verdrängt den alten im Feed; Reaktion erzeugt Notification.

### 6.6 Freunde
- User-Suche (RPC `search_usernames`, liefert nur Username + Land) → Anfrage senden.
- Anfragen annehmen/ablehnen; Freunde entfernen; blockieren (Status `blocked`: keine neuen Anfragen des Blockierten möglich, keine gegenseitige Sichtbarkeit).
- Freunde-Liste zeigt pro Freund die **Bestzeit** (🏁 LED-Format, `best_time()` RPC).
- ✅ *Akzeptanz:* Blockierter User kann keine neue Anfrage stellen; entfernter Freund sieht Check-ins nicht mehr.

### 6.7 Mehr/Profil
- Profilkarte: Avatar (Initiale, Rot-Rosa-Gradient), @Username, Land/Bundesland, "dabei seit", Bestzeit (LED) mit Hinweis "Für Freunde immer sichtbar".
- Prominente Buttons: **gschpusi.com** und **shop.gschpusi.com** (neuer Tab).
- Einstellungen: Standort-Default-Toggle (`profiles.share_location`), Push-Berechtigung anfordern/verwalten, Abmelden. Footer: 18+/Responsibly, Links Datenschutz/Impressum/AGB (Platzhalter-Seiten anlegen).

### 6.8 Gschpusi-Admin (`/admin`, nur role='admin', serverseitig geprüft)
Sechs Module wie im Prototyp:
1. **Moderation**: Filter pending/approved/rejected/alle; pro Eintrag: Username, Land, Datum, eingetragene LED-Zeit, ggf. "via Event"-Badge, **Inline-Video-Player** (Signed URL – Admin darf jedes Video sehen), Freigeben/Ablehnen. Bei approved: Toggle "Video öffentlich JA/NEIN". Status-Änderung → Notification an den User.
2. **Länder**: anlegen (ID, Name, Flag-Emoji), umbenennen, aktiv/deaktiv. Ohne Deploy wirksam.
3. **Antworten**: `reaction_templates` CRUD.
4. **Getränke**: `drinks` CRUD inkl. Bild-URL-Feld (Shopify-CDN) und Sortierung.
5. **User**: Liste mit Username, echtem Namen (NUR hier sichtbar!), Land, Bestzeit; sperren/entsperren, löschen (Kaskade läuft über DB).
6. **Analytics**: Uploads gesamt, Pending-Anzahl, Ø-Zeit, Check-ins, Events-Anzahl, Balken "aktivste Länder". **CSV-Export** des offiziellen Rankings (Semikolon-getrennt, `/api/export`, nur Admin).

### 6.9 Öffentliche Landing Page (`/`)
Ohne Login erreichbar: Shotrace-Vorstellung (Racer-Logo, "So funktioniert's" in 5 Schritten wie im Prototyp), Live-Europarekord (LED), öffentliches Ranking einsehbar (read-only, aus `ranking`-View), CTAs: App öffnen/Registrieren, Platzhalter-Badges App Store/Play Store ("Bald verfügbar"), Links Website + Shop. SEO-Basics (Meta, OG-Image).

### 6.10 Benachrichtigungen (Phase 1)
Notification-Inserts bei: Freigabe/Ablehnung eigener Submission, Reaktion auf eigenen Check-in, Freundschaftsanfrage, Event-Zeit bestätigt/abgelehnt. In-App: Glocken-Icon mit Ungelesen-Punkt + Liste. Web Push über Service Worker, Berechtigung erst nach Login aktiv anfragen (nicht beim ersten Seitenaufruf!).

---

## 7. Sicherheits- & Datenschutzregeln (nicht verhandelbar)

1. `SUPABASE_SERVICE_ROLE_KEY` ausschließlich in Server-Code (Route Handlers/Server Actions). Niemals im Client-Bundle.
2. Echter Name, Geburtsdatum, Telefonnummer verlassen NIE eine öffentliche Response. Öffentliche Daten nur über die Views `ranking`/`event_ranking` und die RPCs.
3. Video-Zugriff ausschließlich über Signed URLs mit serverseitiger Berechtigungsprüfung (Besitzer / Admin / `video_public`). Kurze Gültigkeit (z. B. 1 h).
4. RLS ist die letzte Verteidigungslinie, nicht die einzige: UI blendet Unerlaubtes zusätzlich aus.
5. Standortdaten nur bei aktivem Opt-in erheben. Kein Tracking, keine Analytics-Dienste von Drittanbietern in v1.
6. Alters-Gate: 18+-Hinweis auf allen öffentlichen Seiten.

---

## 8. Meilensteine (in dieser Reihenfolge bauen & jeweils lauffähig committen)

1. **M1 – Fundament:** Next.js-Setup, Supabase-Clients (Browser/Server), Design-System/Tokens, App-Shell mit Bottom-Nav, PWA-Manifest.
2. **M2 – Auth:** Registrierung (18+, Einwilligungen), E-Mail-Verifizierung, Login (E-Mail/Username), Passwort-Reset, Profil-Anlage via Trigger verifizieren.
3. **M3 – Shotrace-Kern:** Video-Upload (TUS), Submission-Flow, Meine Läufe, offizielles Ranking mit Länder-Pills + Realtime.
4. **M4 – Gschpusi-Admin:** Moderation mit Video-Player, video_public, Länder/Getränke/Antworten/User, CSV-Export, Analytics.
5. **M5 – Events:** Liste/Erstellen/Detail, Zeiten eintragen (± Videobeweis), Event-Admin-Moderation, Admin-Übertragung, via-Badge im Gschpusi-Admin.
6. **M6 – Social:** Freunde-System komplett, Check-in mit Produkt-Grid + Standort, Feed, Reaktionen, Bestzeiten überall.
7. **M7 – Politur:** Notifications + Web Push, Landing Page, Rechtsseiten-Platzhalter, Loading/Empty/Error-States, Lighthouse-Check mobil (Ziel ≥ 90 Performance).

Nach jedem Meilenstein: kurzer Statusbericht an Raphael (was fertig, was offen, was zu testen).

---

## 9. Definition of Done – End-to-End-Testszenarien

1. Neuer User registriert sich (18+) → verifiziert E-Mail → loggt sich mit Username ein.
2. User lädt 30-s-MP4 hoch, trägt 3,15 ein → Admin sieht Video, gibt frei → User bekommt Notification, steht auf Platz 1 im AT- und EU-Ranking → Admin schaltet Video öffentlich → Video-Button erscheint und spielt inline ab.
3. User erstellt Event "Beachparty XXL – Wels" → zweiter User trägt Zeit MIT Videobeweis ein → Event-Admin bestätigt → Eintrag erscheint im Event-Ranking UND als pending mit "via"-Badge im Gschpusi-Admin. Dritter User trägt Zeit OHNE Video ein → nach Bestätigung NUR im Event-Ranking.
4. Zwei User werden Freunde → A checkt "Espresso Martini" mit Standort ein → B sieht Check-in inkl. Adresse und A's Bestzeit, reagiert mit "Ich komm vorbei! 🏃" → A erhält Push/Notification. Ein dritter, nicht befreundeter User sieht nichts davon.
5. Admin legt Land "Schweiz" an → erscheint sofort als Ranking-Tab. Admin exportiert CSV.
6. Gesperrter User: Login blockiert bzw. read-only, taucht in keinem Ranking mehr auf.

---

## 10. Environment & Befehle

```
NEXT_PUBLIC_SUPABASE_URL=      # aus Supabase Project Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # nur serverseitig!
NEXT_PUBLIC_APP_URL=https://shotrace.gschpusi.com
```
`npm run dev` lokal · Deployment: GitHub-Repo → Vercel (siehe DEPLOY-ANLEITUNG.md). Seed-Script für `drinks` (Abschnitt 5) als SQL oder ts-Script mitliefern.

---

## 11. Explizit NICHT in v1 (nicht bauen, auch wenn's naheliegt)

- Social Login (bewusst nicht gewünscht)
- Automatische Zeiterkennung aus dem Video (Prüfung bleibt manuell)
- Öffentlicher Check-in-Feed oder Check-in-Landkarte
- Mehrere Pack-Kategorien (Datenmodell-Erweiterung später)
- Native Apps, In-App-Käufe, Shop-Integration über Links hinaus
- Serverseitige Video-Transkodierung (später; v1 = Formatprüfung am Client)

---

## 12. Arbeitsregeln

- Bei Widersprüchen: Dieses Protokoll > ARCHITEKTUR.md > Prototyp. Bei echten Unklarheiten: **fragen statt raten** – Raphael antwortet auf Deutsch, kurz und direkt.
- `schema.sql` nicht eigenmächtig ändern. Wenn eine Schema-Änderung nötig erscheint: vorschlagen, begründen, auf Freigabe warten, dann als Migrationsdatei.
- Keine zusätzlichen npm-Abhängigkeiten ohne kurzen Hinweis (Ausnahme: @supabase/*, tus-js-client, übliche Dev-Tooling).
- Commits klein und thematisch, Meilenstein-Tags (m1-fundament, m2-auth, ...).
- Alles UI-Wording auf Deutsch (Du-Form, Gschpusi-Ton), Fehlermeldungen hilfreich formulieren ("Was ist passiert + was tun").

Viel Erfolg – und nach jedem Gschpusi gibt's ein Bussi! 😘
