-- 0006: Roads
-- Road segments with spatial geometry and condition scores.

create table public.roads (
  id                     uuid                       primary key default extensions.uuid_generate_v4(),
  road_name              text,
  road_number            text,                                -- e.g. 'NH-27', 'NH-2'
  road_type              public.road_type_enum,
  source_location_id     uuid                       references public.locations (id),
  destination_location_id uuid                      references public.locations (id),
  geometry               extensions.geography(LineString,4326),
  length_km              double precision,
  width_m                double precision,
  surface_type           text,
  max_speed_kmph         double precision,
  condition_score        double precision,           -- 0–100
  accessibility_score    double precision,           -- 0–100
  state                  text,
  is_active              boolean                    not null default true,
  created_at             timestamptz                not null default now(),
  updated_at             timestamptz                not null default now()
);

comment on table public.roads is
  'Road segments. road_number is the operational identifier (NH-27 etc.).';
comment on column public.roads.condition_score is
  '0 = impassable, 100 = perfect. Updated by field reports and ML inference.';
