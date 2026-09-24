-- 0013: Database Functions
-- PostGIS spatial helpers and RPC functions called by the application.

-- ---------------------------------------------------------------------------
-- find_nearby_locations(point geography, radius_meters float)
-- Returns locations within radius of a given point.
-- ---------------------------------------------------------------------------
create or replace function public.find_nearby_locations(
  p_point        extensions.geography,
  p_radius_m     float default 50000
)
returns table (
  id             uuid,
  name           text,
  district       text,
  state          text,
  latitude       double precision,
  longitude      double precision,
  distance_m     double precision
)
language sql stable security definer
set search_path = public, extensions
as $$
  select
    l.id,
    l.name,
    l.district,
    l.state,
    l.latitude,
    l.longitude,
    st_distance(l.location, p_point) as distance_m
  from public.locations l
  where l.location is not null
    and st_dwithin(l.location, p_point, p_radius_m)
  order by distance_m;
$$;

-- ---------------------------------------------------------------------------
-- find_nearby_roads(point geography, radius_meters float)
-- ---------------------------------------------------------------------------
create or replace function public.find_nearby_roads(
  p_point        extensions.geography,
  p_radius_m     float default 10000
)
returns table (
  id             uuid,
  road_number    text,
  road_name      text,
  condition_score double precision,
  accessibility_score double precision,
  is_active      boolean,
  distance_m     double precision
)
language sql stable security definer
set search_path = public, extensions
as $$
  select
    r.id,
    r.road_number,
    r.road_name,
    r.condition_score,
    r.accessibility_score,
    r.is_active,
    st_distance(r.geometry, p_point) as distance_m
  from public.roads r
  where r.geometry is not null
    and st_dwithin(r.geometry, p_point, p_radius_m)
  order by distance_m;
$$;

-- ---------------------------------------------------------------------------
-- get_route_segments(p_route_id uuid)
-- Returns ordered segments for a route with road details joined.
-- ---------------------------------------------------------------------------
create or replace function public.get_route_segments(p_route_id uuid)
returns table (
  segment_id       uuid,
  sequence_number  integer,
  road_id          uuid,
  road_number      text,
  road_name        text,
  distance_km      double precision,
  travel_time_minutes double precision,
  risk_score       double precision,
  condition_score  double precision,
  status           public.segment_status_enum
)
language sql stable security definer
set search_path = public
as $$
  select
    rs.id,
    rs.sequence_number,
    rs.road_id,
    rd.road_number,
    rd.road_name,
    rs.distance_km,
    rs.travel_time_minutes,
    rs.risk_score,
    rs.condition_score,
    rs.status
  from public.route_segments rs
  left join public.roads rd on rd.id = rs.road_id
  where rs.route_id = p_route_id
  order by rs.sequence_number;
$$;

-- ---------------------------------------------------------------------------
-- get_active_disasters(point geography, radius_meters float)
-- Returns open disaster events near a point.
-- ---------------------------------------------------------------------------
create or replace function public.get_active_disasters(
  p_point    extensions.geography,
  p_radius_m float default 100000
)
returns table (
  id          uuid,
  type        public.disaster_type_enum,
  severity    integer,
  title       text,
  district    text,
  state       text,
  started_at  timestamptz,
  probability double precision,
  distance_m  double precision
)
language sql stable security definer
set search_path = public, extensions
as $$
  select
    d.id,
    d.type,
    d.severity,
    d.title,
    d.district,
    d.state,
    d.started_at,
    d.probability,
    st_distance(d.geometry, p_point) as distance_m
  from public.disaster_events d
  where d.ended_at is null
    and d.geometry is not null
    and st_dwithin(d.geometry, p_point, p_radius_m)
  order by d.severity desc, distance_m;
$$;

-- ---------------------------------------------------------------------------
-- calculate_distance(origin geography, destination geography)
-- Returns straight-line distance in km between two points.
-- ---------------------------------------------------------------------------
create or replace function public.calculate_distance(
  p_origin      extensions.geography,
  p_destination extensions.geography
)
returns double precision
language sql immutable security definer
set search_path = public, extensions
as $$
  select round((st_distance(p_origin, p_destination) / 1000.0)::numeric, 2)::double precision;
$$;

-- ---------------------------------------------------------------------------
-- get_route_with_risk(p_route_id uuid)
-- Returns a route with its latest risk assessment in one call.
-- ---------------------------------------------------------------------------
create or replace function public.get_route_with_risk(p_route_id uuid)
returns table (
  route_id            uuid,
  route_number        text,
  name                text,
  distance_km         double precision,
  route_status        public.route_status_enum,
  accessibility_score double precision,
  reliability_score   double precision,
  total_risk_score    double precision,
  flood_risk          double precision,
  landslide_risk      double precision,
  weather_risk        double precision,
  confidence_score    double precision,
  model_version       text,
  assessed_at         timestamptz
)
language sql stable security definer
set search_path = public
as $$
  select
    r.id,
    r.route_number,
    r.name,
    r.distance_km,
    r.route_status,
    r.accessibility_score,
    r.reliability_score,
    rra.total_risk_score,
    rra.flood_risk,
    rra.landslide_risk,
    rra.weather_risk,
    rra.confidence_score,
    rra.model_version,
    rra.calculated_at
  from public.routes r
  left join lateral (
    select * from public.route_risk_assessments
    where route_id = r.id
    order by calculated_at desc
    limit 1
  ) rra on true
  where r.id = p_route_id;
$$;

-- ---------------------------------------------------------------------------
-- generate_incident_ref()
-- Called by trigger to create INC-YYYY-NNN style refs.
-- ---------------------------------------------------------------------------
create or replace function public.generate_incident_ref()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_year text := to_char(now(), 'YYYY');
  v_seq  integer;
begin
  select coalesce(max(
    (regexp_match(incident_ref, 'INC-\d{4}-(\d+)'))[1]::integer
  ), 0) + 1
  into v_seq
  from public.road_incidents
  where incident_ref like 'INC-' || v_year || '-%';

  new.incident_ref := 'INC-' || v_year || '-' || lpad(v_seq::text, 3, '0');
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Validate that a geography point falls within NER bounding box.
-- NER approximate bounds: lat 21.9–29.5 N, lon 88.0–97.5 E
-- ---------------------------------------------------------------------------
create or replace function public.validate_ner_point(p_point extensions.geography)
returns boolean
language sql immutable security definer
set search_path = public, extensions
as $$
  select st_x(p_point::geometry) between 88.0 and 97.5
     and st_y(p_point::geometry) between 21.9 and 29.5;
$$;
