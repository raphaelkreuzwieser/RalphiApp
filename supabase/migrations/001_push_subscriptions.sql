-- ============================================================
-- ADDITIVE Migration (ergänzt schema.sql, ändert nichts Bestehendes).
-- Speichert Web-Push-Abos für den Server-Versand (Phase 1).
-- Im Supabase SQL-Editor NACH schema.sql ausführen. Optional – ohne diese
-- Tabelle + VAPID-Keys funktionieren In-App-Benachrichtigungen trotzdem.
-- ============================================================

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_push_user on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Jeder verwaltet nur seine eigenen Abos. Der Server-Versand liest sie mit dem
-- Service-Role-Key (umgeht RLS), da Push an fremde Empfänger geht.
create policy "push_own_all" on public.push_subscriptions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
