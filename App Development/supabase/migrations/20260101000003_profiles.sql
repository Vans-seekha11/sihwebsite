-- 0003: Profiles
-- One profile per auth user, created automatically by trigger on auth.users insert.
-- New accounts are active immediately after registration.

create table public.profiles (
  id             uuid        primary key references auth.users (id) on delete cascade,
  full_name      text,
  officer_id     text        unique,                    -- e.g. NER-FO-4471
  phone          text,
  organization   text,
  department     text,
  region         text,
  avatar_url     text,
  is_active      boolean     not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.profiles is
  'One active profile per authenticated user.';
comment on column public.profiles.officer_id is
  'Unique operational ID in NER-FO-XXXX / NER-DO-XXXX / NER-CR-XXXX format.';
comment on column public.profiles.is_active is
  'Newly registered accounts are active immediately.';
