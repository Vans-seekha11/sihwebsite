-- 0005: Locations
-- Named geographic points: districts, towns, depots, checkpoints.
-- The `location` geography column enables PostGIS proximity queries.

create table public.locations (
  id           uuid                     primary key default extensions.uuid_generate_v4(),
  name         text                     not null,
  district     text,
  state        text,
  latitude     double precision,
  longitude    double precision,
  location     extensions.geography(Point,4326),
  elevation    double precision,
  population   integer,
  location_type text,                              -- 'district_hq' | 'depot' | 'checkpoint' | 'town'
  created_at   timestamptz              not null default now(),
  updated_at   timestamptz              not null default now()
);

-- Add FK from user_roles to locations (districts come from location records)
alter table public.user_roles
  add constraint user_roles_district_id_fkey
  foreign key (district_id) references public.locations (id);

comment on table public.locations is
  'Named geographic points used as route endpoints, incident sites, and logistics depots.';
comment on column public.locations.location is
  'PostGIS geography point (SRID 4326) for ST_DWithin / ST_Distance queries.';
