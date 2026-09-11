-- 0007: Routes and Route Segments
-- Routes are curated paths used for logistics planning.
-- Route segments link to individual road records and carry per-segment risk.

create table public.routes (
  id                      uuid                       primary key default extensions.uuid_generate_v4(),
  route_number            text,                                -- 'NH-27' display label
  name                    text,
  source_location_id      uuid                       references public.locations (id),
  destination_location_id uuid                       references public.locations (id),
  geometry                extensions.geography(LineString,4326),
  distance_km             double precision,
  estimated_time_minutes  double precision,
  risk_score              double precision,           -- 0–100 (higher = riskier)
  accessibility_score     double precision,           -- 0–100 (higher = better)
  reliability_score       double precision,           -- 0–100
  route_status            public.route_status_enum   not null default 'open',
  weather_summary         text,
  current_eta             text,
  current_delay           text,
  state                   text,
  district                text,
  updated_at              timestamptz                not null default now(),
  created_at              timestamptz                not null default now()
);

create table public.route_segments (
  id                  uuid                          primary key default extensions.uuid_generate_v4(),
  route_id            uuid                          not null references public.routes (id) on delete cascade,
  road_id             uuid                          references public.roads (id),
  sequence_number     integer                       not null,
  distance_km         double precision,
  travel_time_minutes double precision,
  risk_score          double precision,
  condition_score     double precision,
  status              public.segment_status_enum    not null default 'clear',
  unique (route_id, sequence_number)
);

create table public.transport_modes (
  id           uuid        primary key default extensions.uuid_generate_v4(),
  name         text        not null unique,          -- 'truck', 'train', 'helicopter', 'boat'
  capacity_kg  double precision,
  description  text,
  is_active    boolean     not null default true
);

comment on table public.routes is
  'Named routes (NH-27 etc.) with risk and accessibility scores updated by Edge Functions.';
comment on table public.route_segments is
  'Ordered road segments composing a route. Sequence numbers are 1-based and gapless.';
