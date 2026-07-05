-- ============================================================
-- GSCHPUSI SHOTRACE – Datenbankschema (Supabase / PostgreSQL)
-- Version 1.0 · Party-Shot GmbH
-- Ausführen im Supabase SQL-Editor (Projekt-Region: eu-central-1)
-- ============================================================

-- ---------- ENUMS ----------
create type submission_status as enum ('pending', 'approved', 'rejected');
create type event_sub_status as enum ('pending', 'confirmed', 'rejected');
create type friendship_status as enum ('pending', 'accepted', 'blocked');
create type user_role as enum ('user', 'admin');

-- ---------- PROFILE ----------
-- Erweitert auth.users. Echter Name ist NIE öffentlich sichtbar.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 24
    and username ~ '^[A-Za-z0-9_.]+$'),
  full_name text not null,                    -- privat, nur Admin
  bundesland text,
  country_id text not null default 'AT',
  birthdate date not null check (birthdate <= (current_date - interval '18 years')), -- 18+
  phone text,                                 -- privat, nur Admin
  role user_role not null default 'user',
  locked boolean not null default false,
  share_location boolean not null default true,
  created_at timestamptz not null default now()
);

-- Profil automatisch bei Registrierung anlegen (Metadaten aus Signup-Formular)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, bundesland, country_id, birthdate, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'bundesland',
    coalesce(new.raw_user_meta_data->>'country_id', 'AT'),
    (new.raw_user_meta_data->>'birthdate')::date,
    new.raw_user_meta_data->>'phone'
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- HILFSFUNKTIONEN ----------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Hinweis: are_friends() wird weiter unten NACH der friendships-Tabelle
-- definiert (es referenziert sie, und language-sql-Funktionskörper werden
-- bereits bei der Erstellung geprüft).

-- ---------- STAMMDATEN ----------
create table public.countries (
  id text primary key,            -- 'AT', 'DE', 'IT', ...
  name text not null,
  flag text not null default '🌍',
  active boolean not null default true,
  sort int not null default 100
);

insert into public.countries (id, name, flag, sort) values
  ('AT', 'Österreich', '🇦🇹', 1),
  ('DE', 'Deutschland', '🇩🇪', 2),
  ('IT', 'Italien', '🇮🇹', 3);

create table public.drinks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,                 -- Shopify-CDN-Freisteller
  active boolean not null default true,
  sort int not null default 100
);

create table public.reaction_templates (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  active boolean not null default true,
  sort int not null default 100
);

insert into public.reaction_templates (text, sort) values
  ('Ich komm vorbei! 🏃', 1),
  ('Trinkst du schon wieder ohne mich? 😤', 2),
  ('Prost! 🥂', 3),
  ('Bussi! 😘', 4),
  ('Ohne mich fang ned an!', 5);

-- ---------- SHOTRACE: OFFIZIELLE EINREICHUNGEN ----------
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  country_id text not null references public.countries(id),
  time_seconds numeric(6,2) not null check (time_seconds > 0 and time_seconds < 600),
  video_path text,                -- Pfad im Storage-Bucket 'videos' (Pflicht fürs offizielle Ranking, App-seitig erzwungen)
  status submission_status not null default 'pending',
  video_public boolean not null default false,   -- Ja/Nein-Schalter im Admin
  via_event uuid,                 -- gesetzt, wenn Lauf aus einer Event-Challenge stammt
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_submissions_ranking on public.submissions (status, country_id, time_seconds);
create index idx_submissions_user on public.submissions (user_id);

-- Öffentliche Ranking-Sicht: nur Username, nie echter Name
create or replace view public.ranking as
  select s.id, p.username, s.country_id, s.time_seconds, s.video_public, s.created_at
  from public.submissions s
  join public.profiles p on p.id = s.user_id
  where s.status = 'approved' and p.locked = false;

-- Bestzeit eines Users (für Freunde immer sichtbar)
create or replace function public.best_time(uid uuid)
returns numeric language sql stable security definer set search_path = public as $$
  select min(time_seconds) from submissions where user_id = uid and status = 'approved';
$$;

-- ---------- EVENT-CHALLENGES ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 80),
  admin_id uuid not null references public.profiles(id),      -- Event-Admin (registrierter User)
  created_by uuid not null references public.profiles(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.event_submissions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  time_seconds numeric(6,2) not null check (time_seconds > 0 and time_seconds < 600),
  has_video boolean not null default false,
  video_path text,
  status event_sub_status not null default 'pending',
  official_submission_id uuid references public.submissions(id), -- Verknüpfung zur offiziellen Prüfung
  created_at timestamptz not null default now()
);
create index idx_event_subs on public.event_submissions (event_id, status, time_seconds);

-- Regel: Bestätigt der Event-Admin einen Lauf MIT Videobeweis,
-- wird automatisch eine offizielle Einreichung (pending) erzeugt.
create or replace function public.handle_event_confirmation()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_sub_id uuid;
  ev_name text;
begin
  if new.status = 'confirmed' and old.status = 'pending'
     and new.has_video and new.video_path is not null
     and new.official_submission_id is null then
    insert into submissions (user_id, country_id, time_seconds, video_path, status, via_event)
    select new.user_id, p.country_id, new.time_seconds, new.video_path, 'pending', new.event_id
    from profiles p where p.id = new.user_id
    returning id into new_sub_id;
    new.official_submission_id := new_sub_id;
  end if;
  return new;
end $$;

create trigger on_event_sub_confirmed
  before update on public.event_submissions
  for each row execute function public.handle_event_confirmation();

-- ---------- FREUNDE ----------
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null references public.profiles(id) on delete cascade,
  addressee uuid not null references public.profiles(id) on delete cascade,
  status friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (requester, addressee),
  check (requester <> addressee)
);

-- Bestätigte Freundschaft? (hier definiert, weil es friendships braucht)
create or replace function public.are_friends(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from friendships
    where status = 'accepted'
      and ((requester = a and addressee = b) or (requester = b and addressee = a))
  );
$$;

-- ---------- DRINK CHECK-IN ----------
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  drink_id uuid references public.drinks(id),
  drink_name text not null,       -- Snapshot bzw. Freitext ("eigenes Getränk")
  location_text text,             -- genaue Adresse (nur mit Einwilligung)
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);
create index idx_checkins_user_latest on public.checkins (user_id, created_at desc);

create table public.checkin_reactions (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid not null references public.checkins(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null check (char_length(text) <= 280),
  created_at timestamptz not null default now()
);

-- ---------- BENACHRICHTIGUNGEN ----------
-- Basis für Push (FCM/OneSignal-Anbindung erfolgt app-seitig)
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,             -- 'submission_approved' | 'submission_rejected' | 'reaction' | 'friend_request' | ...
  payload jsonb not null default '{}',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on public.notifications (user_id, read, created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.countries enable row level security;
alter table public.drinks enable row level security;
alter table public.reaction_templates enable row level security;
alter table public.submissions enable row level security;
alter table public.events enable row level security;
alter table public.event_submissions enable row level security;
alter table public.friendships enable row level security;
alter table public.checkins enable row level security;
alter table public.checkin_reactions enable row level security;
alter table public.notifications enable row level security;

-- Profile: eigenes Profil voll, Admin alles. (Usernames öffentlich nur über Views/Funktionen)
create policy "profiles_own_read" on public.profiles for select using (id = auth.uid() or is_admin());
create policy "profiles_own_update" on public.profiles for update using (id = auth.uid() and locked = false);
create policy "profiles_admin_update" on public.profiles for update using (is_admin());

-- Öffentliche Profilsuche (nur Username + Land) für Freundschaftsanfragen
create or replace function public.search_usernames(q text)
returns table (id uuid, username text, country_id text) language sql stable
security definer set search_path = public as $$
  select id, username, country_id from profiles
  where locked = false and username ilike '%' || q || '%'
  limit 20;
$$;

-- Stammdaten: alle lesen, nur Admin schreiben
create policy "countries_read" on public.countries for select using (true);
create policy "countries_admin" on public.countries for all using (is_admin());
create policy "drinks_read" on public.drinks for select using (active or is_admin());
create policy "drinks_admin" on public.drinks for all using (is_admin());
create policy "reactions_read" on public.reaction_templates for select using (active or is_admin());
create policy "reactions_admin" on public.reaction_templates for all using (is_admin());

-- Submissions: eigene anlegen/lesen, Admin alles. Öffentlich NUR über die View 'ranking'.
create policy "subs_insert_own" on public.submissions for insert
  with check (user_id = auth.uid());
create policy "subs_read_own_or_admin" on public.submissions for select
  using (user_id = auth.uid() or is_admin());
create policy "subs_admin_update" on public.submissions for update using (is_admin());

-- Events: lesen alle (öffentliche Rankings), anlegen jeder registrierte User,
-- ändern nur Event-Admin oder Gschpusi-Admin
create policy "events_read" on public.events for select using (active or is_admin());
create policy "events_insert" on public.events for insert
  with check (created_by = auth.uid() and admin_id = auth.uid());
create policy "events_update" on public.events for update
  using (admin_id = auth.uid() or is_admin());

-- Event-Einreichungen: eigene anlegen; lesen alle (internes Ranking ist im Event öffentlich);
-- Status ändern nur der Event-Admin
create policy "evsubs_insert_own" on public.event_submissions for insert
  with check (user_id = auth.uid());
create policy "evsubs_read" on public.event_submissions for select using (true);
create policy "evsubs_admin_update" on public.event_submissions for update
  using (exists (select 1 from events e where e.id = event_id and (e.admin_id = auth.uid() or is_admin())));

-- Öffentliche Event-Ranking-Sicht (Username statt UUID)
create or replace view public.event_ranking as
  select es.id, es.event_id, p.username, es.time_seconds, es.has_video, es.status, es.created_at
  from public.event_submissions es
  join public.profiles p on p.id = es.user_id
  where p.locked = false;

-- Freundschaften: nur Beteiligte
create policy "friends_involved" on public.friendships for select
  using (requester = auth.uid() or addressee = auth.uid());
create policy "friends_request" on public.friendships for insert
  with check (requester = auth.uid());
create policy "friends_respond" on public.friendships for update
  using (addressee = auth.uid() or requester = auth.uid());
create policy "friends_remove" on public.friendships for delete
  using (requester = auth.uid() or addressee = auth.uid());

-- Check-ins: sichtbar NUR für bestätigte Freunde und den User selbst
create policy "checkins_insert_own" on public.checkins for insert
  with check (user_id = auth.uid());
create policy "checkins_read_friends" on public.checkins for select
  using (user_id = auth.uid() or are_friends(auth.uid(), user_id));

-- Reaktionen: sichtbar/erlaubt für Freunde des Eincheckenden
create policy "creact_read" on public.checkin_reactions for select
  using (exists (select 1 from checkins c where c.id = checkin_id
         and (c.user_id = auth.uid() or are_friends(auth.uid(), c.user_id))));
create policy "creact_insert" on public.checkin_reactions for insert
  with check (user_id = auth.uid() and exists
    (select 1 from checkins c where c.id = checkin_id and are_friends(auth.uid(), c.user_id)));

-- Benachrichtigungen: nur eigene
create policy "notif_own" on public.notifications for select using (user_id = auth.uid());
create policy "notif_update_own" on public.notifications for update using (user_id = auth.uid());

-- ============================================================
-- STORAGE (im Dashboard Bucket 'videos' als PRIVATE anlegen, dann:)
-- ============================================================
-- Upload nur in den eigenen Ordner {user_id}/..., Lesen: Besitzer + Admin.
-- Öffentliche Wiedergabe freigegebener Videos erfolgt über serverseitige Signed URLs.
create policy "videos_upload_own" on storage.objects for insert
  with check (bucket_id = 'videos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "videos_read_own_or_admin" on storage.objects for select
  using (bucket_id = 'videos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ============================================================
-- ERSTER ADMIN (nach der eigenen Registrierung ausführen):
-- update public.profiles set role = 'admin' where username = 'DEIN_USERNAME';
-- ============================================================
