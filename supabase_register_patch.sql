-- =========================================================
-- BüroKlarNie – Register / Auth Patch
-- Ergänzt das bestehende Schema um korrekte Übernahme
-- aller Registrierungsfelder in public.profiles
-- =========================================================
--
-- HINWEIS: Supabase verwaltet E-Mail + Passwort in auth.users.
-- Du brauchst KEINE separate "register"-Tabelle mit Passwort!
-- Passwörter werden als bcrypt-Hash in auth.users gespeichert.
--
-- Dieses Skript ergänzt:
--   1. Erweiterten Trigger: full_name + company_name aus user_metadata
--   2. Audit-Log-Tabelle für Registrierungen / Login-Events
--   3. RLS-Policies für die Audit-Tabelle
--   4. Passwortstärke-Validierung (serverseitig)
-- =========================================================

begin;

-- =========================================================
-- 1. ERWEITERTER TRIGGER: handle_new_user()
--    Übernimmt jetzt full_name UND company_name aus den
--    user_metadata, die beim signUp() mitgegeben werden
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    company_name
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'company_name', '')
  )
  on conflict (id) do update
    set email        = excluded.email,
        full_name    = coalesce(excluded.full_name, profiles.full_name),
        company_name = coalesce(excluded.company_name, profiles.company_name),
        updated_at   = now();
  return new;
end;
$$;

-- Trigger neu erstellen (idempotent)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- =========================================================
-- 2. AUDIT-LOG: auth_events
--    Protokolliert Registrierungen, Logins, Logouts etc.
--    Nützlich für Sicherheitsüberprüfungen und Debugging
-- =========================================================

create table if not exists public.auth_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  ip_address inet,
  user_agent text,
  metadata   jsonb default '{}',
  created_at timestamptz not null default now(),

  constraint auth_events_type_check check (
    event_type in (
      'register',
      'login',
      'logout',
      'password_reset_request',
      'password_reset_complete',
      'email_confirmed',
      'profile_updated'
    )
  )
);

-- Index für schnelle User-Abfragen
create index if not exists idx_auth_events_user_id
  on public.auth_events (user_id);

-- Index für chronologische Abfragen
create index if not exists idx_auth_events_created_at
  on public.auth_events (created_at desc);

-- Index für Event-Typ-Filterung
create index if not exists idx_auth_events_event_type
  on public.auth_events (event_type);

-- =========================================================
-- 3. RLS für auth_events
--    User können nur ihre eigenen Events sehen,
--    niemals fremde oder Events einfügen/ändern/löschen
-- =========================================================

alter table public.auth_events enable row level security;

-- User darf nur eigene Events sehen
drop policy if exists "auth_events_select_own" on public.auth_events;
create policy "auth_events_select_own"
on public.auth_events
for select
to authenticated
using (auth.uid() = user_id);

-- Kein INSERT/UPDATE/DELETE für normale User!
-- Events werden nur serverseitig (via security definer Funktionen
-- oder Supabase Edge Functions) erstellt.

-- =========================================================
-- 4. TRIGGER: Automatisch auth_event bei Registrierung loggen
-- =========================================================

create or replace function public.log_auth_register()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.auth_events (user_id, event_type, metadata)
  values (
    new.id,
    'register',
    jsonb_build_object(
      'email', new.email,
      'full_name', coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      'provider', coalesce(new.raw_app_meta_data ->> 'provider', 'email')
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_registered_log on auth.users;
create trigger on_auth_user_registered_log
after insert on auth.users
for each row
execute function public.log_auth_register();

-- =========================================================
-- 5. HILFSFUNKTION: Passwort-Policy-Check
--    Wird vom Frontend aufgerufen bevor signUp() ausgeführt wird.
--    Gibt ein JSON-Objekt mit Validierungsergebnis zurück.
--    (Optional – Supabase hat eingebaute Min-Length,
--     aber das hier ist feingranularer)
-- =========================================================

create or replace function public.validate_password(pwd text)
returns jsonb
language plpgsql
security invoker
as $$
declare
  result jsonb := '{"valid": true, "errors": []}'::jsonb;
  errors text[] := '{}';
begin
  -- Mindestlänge 8 Zeichen (strenger als die 6 im Frontend)
  if char_length(pwd) < 8 then
    errors := array_append(errors, 'Passwort muss mindestens 8 Zeichen lang sein.');
  end if;

  -- Mindestens ein Großbuchstabe
  if pwd !~ '[A-ZÄÖÜ]' then
    errors := array_append(errors, 'Passwort muss mindestens einen Großbuchstaben enthalten.');
  end if;

  -- Mindestens ein Kleinbuchstabe
  if pwd !~ '[a-zäöüß]' then
    errors := array_append(errors, 'Passwort muss mindestens einen Kleinbuchstaben enthalten.');
  end if;

  -- Mindestens eine Zahl
  if pwd !~ '[0-9]' then
    errors := array_append(errors, 'Passwort muss mindestens eine Zahl enthalten.');
  end if;

  -- Ergebnis zusammenbauen
  if array_length(errors, 1) > 0 then
    result := jsonb_build_object(
      'valid', false,
      'errors', to_jsonb(errors)
    );
  end if;

  return result;
end;
$$;

-- Anon + Authenticated dürfen die Funktion aufrufen
-- (wird VOR der Registrierung vom Frontend genutzt)
grant execute on function public.validate_password(text) to anon;
grant execute on function public.validate_password(text) to authenticated;

-- =========================================================
-- 6. PROFILES erweitern: Telefonnummer + AGB-Zustimmung
--    (Felder die bei einer Registrierung oft benötigt werden)
-- =========================================================

-- Telefonnummer (optional, für Kontakt)
alter table public.profiles
  add column if not exists phone text;

-- AGB / Datenschutz-Zustimmung (Zeitstempel wann zugestimmt)
alter table public.profiles
  add column if not exists terms_accepted_at timestamptz;

-- E-Mail-Verifizierung bestätigt? (aus auth.users gespiegelt)
alter table public.profiles
  add column if not exists email_confirmed boolean not null default false;

-- =========================================================
-- 7. TRIGGER: email_confirmed aus auth.users nach profiles spiegeln
-- =========================================================

create or replace function public.sync_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Wenn email_confirmed_at gesetzt wird (User bestätigt E-Mail)
  if new.email_confirmed_at is not null
     and (old.email_confirmed_at is null or old.email_confirmed_at != new.email_confirmed_at)
  then
    update public.profiles
    set email_confirmed = true,
        updated_at = now()
    where id = new.id;

    -- Audit-Event loggen
    insert into public.auth_events (user_id, event_type, metadata)
    values (
      new.id,
      'email_confirmed',
      jsonb_build_object('confirmed_at', new.email_confirmed_at)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed
after update on auth.users
for each row
execute function public.sync_email_confirmed();

-- =========================================================
-- 8. VIEW: Profil-Übersicht (nützlich für Dashboard)
--    Kombiniert profiles mit auth.users Infos
-- =========================================================

create or replace view public.profile_summary as
select
  p.id,
  p.email,
  p.full_name,
  p.company_name,
  p.freelancer_type,
  p.phone,
  p.email_confirmed,
  p.terms_accepted_at,
  p.created_at,
  p.updated_at,
  (select count(*) from public.service_requests sr where sr.user_id = p.id) as total_requests,
  (select count(*) from public.service_requests sr where sr.user_id = p.id and sr.status = 'Abgeschlossen') as completed_requests
from public.profiles p;

-- RLS gilt auf die darunterliegenden Tabellen,
-- aber zusätzlich: nur eigene Daten via security_invoker
alter view public.profile_summary set (security_invoker = on);

commit;
