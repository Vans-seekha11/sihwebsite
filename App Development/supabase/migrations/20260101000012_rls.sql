-- 0012: Row Level Security — helpers and baseline policies
-- RLS is enabled on every table exposed through the Data API.
-- Security-definer helpers keep policy expressions simple and fast.

-- ===========================================================================
-- Security-definer helper functions
-- These run as the table owner and may access auth.users safely.
-- ===========================================================================

-- Returns the authenticated user's operational role, or null if none.
create or replace function public.my_role()
returns public.user_role_enum
language sql stable security definer
set search_path = public
as $$
  select role from public.user_roles
  where user_id = auth.uid() and is_active = true
  limit 1;
$$;

-- Returns true if the current user has the given role.
create or replace function public.has_role(p_role public.user_role_enum)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = p_role and is_active = true
  );
$$;

-- Returns the district_id of the current user, or null.
create or replace function public.my_district_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select district_id from public.user_roles
  where user_id = auth.uid() and is_active = true
  limit 1;
$$;

-- Returns the district name string for the current user.
create or replace function public.my_district_name()
returns text
language sql stable security definer
set search_path = public
as $$
  select l.district from public.user_roles ur
  join public.locations l on l.id = ur.district_id
  where ur.user_id = auth.uid() and ur.is_active = true
  limit 1;
$$;

-- Returns true if the current user's profile is active.
create or replace function public.is_active_user()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce((
    select is_active from public.profiles where id = auth.uid()
  ), false);
$$;

-- ===========================================================================
-- Enable RLS on all application tables
-- ===========================================================================

alter table public.profiles              enable row level security;
alter table public.user_roles            enable row level security;
alter table public.locations             enable row level security;
alter table public.roads                 enable row level security;
alter table public.routes                enable row level security;
alter table public.route_segments        enable row level security;
alter table public.transport_modes       enable row level security;
alter table public.logistics_requests    enable row level security;
alter table public.shipments             enable row level security;
alter table public.weather_data          enable row level security;
alter table public.disaster_events       enable row level security;
alter table public.road_incidents        enable row level security;
alter table public.route_risk_assessments enable row level security;
alter table public.accessibility_scores  enable row level security;
alter table public.route_predictions     enable row level security;
alter table public.ml_models             enable row level security;
alter table public.tasks                 enable row level security;
alter table public.alerts                enable row level security;
alter table public.notifications         enable row level security;
alter table public.data_sources          enable row level security;
alter table public.data_ingestion_logs   enable row level security;
alter table public.audit_logs            enable row level security;

-- ===========================================================================
-- profiles policies
-- ===========================================================================

-- Users can read their own profile
create policy "profiles: own read"
  on public.profiles for select
  using (id = auth.uid());

-- Users can update their own profile (name, phone, avatar only — not is_active)
create policy "profiles: own update"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- District officers can read profiles of field officers in their district
create policy "profiles: district officer read subordinates"
  on public.profiles for select
  using (
    public.has_role('district_officer')
    and public.is_active_user()
  );

-- Control room can read all profiles
create policy "profiles: control room read all"
  on public.profiles for select
  using (
    public.has_role('control_room')
    and public.is_active_user()
  );

-- ===========================================================================
-- user_roles policies
-- ===========================================================================

-- Users can read their own role
create policy "user_roles: own read"
  on public.user_roles for select
  using (user_id = auth.uid());

-- Control room can read all roles
create policy "user_roles: control room read all"
  on public.user_roles for select
  using (
    public.has_role('control_room')
    and public.is_active_user()
  );

-- ===========================================================================
-- locations — read-only for authenticated active users
-- ===========================================================================

create policy "locations: authenticated read"
  on public.locations for select
  using (auth.uid() is not null and public.is_active_user());

-- ===========================================================================
-- roads — read-only for authenticated active users
-- ===========================================================================

create policy "roads: authenticated read"
  on public.roads for select
  using (auth.uid() is not null and public.is_active_user());

-- ===========================================================================
-- routes — scoped by role
-- ===========================================================================

-- Field officers see routes in their district
create policy "routes: field officer district read"
  on public.routes for select
  using (
    public.has_role('field_officer')
    and public.is_active_user()
    and (district is null or district = public.my_district_name())
  );

-- District officers see routes in their district
create policy "routes: district officer read"
  on public.routes for select
  using (
    public.has_role('district_officer')
    and public.is_active_user()
    and (district is null or district = public.my_district_name())
  );

-- Control room sees all routes
create policy "routes: control room read all"
  on public.routes for select
  using (
    public.has_role('control_room')
    and public.is_active_user()
  );

-- ===========================================================================
-- route_segments — follow route-level access
-- ===========================================================================

create policy "route_segments: active user read"
  on public.route_segments for select
  using (auth.uid() is not null and public.is_active_user());

-- ===========================================================================
-- transport_modes — reference data, all active users can read
-- ===========================================================================

create policy "transport_modes: active user read"
  on public.transport_modes for select
  using (auth.uid() is not null and public.is_active_user());

-- ===========================================================================
-- logistics_requests
-- ===========================================================================

-- Field officers see their own requests
create policy "logistics: field officer own read"
  on public.logistics_requests for select
  using (
    public.has_role('field_officer')
    and public.is_active_user()
    and user_id = auth.uid()
  );

create policy "logistics: field officer own create"
  on public.logistics_requests for insert
  with check (
    public.has_role('field_officer')
    and public.is_active_user()
    and user_id = auth.uid()
  );

-- District officers see all requests in their district
create policy "logistics: district officer read"
  on public.logistics_requests for select
  using (
    public.has_role('district_officer')
    and public.is_active_user()
  );

create policy "logistics: district officer update"
  on public.logistics_requests for update
  using (
    public.has_role('district_officer')
    and public.is_active_user()
  );

-- Control room reads all
create policy "logistics: control room read"
  on public.logistics_requests for select
  using (
    public.has_role('control_room')
    and public.is_active_user()
  );

-- ===========================================================================
-- shipments — same scoping as logistics
-- ===========================================================================

create policy "shipments: field officer own read"
  on public.shipments for select
  using (public.has_role('field_officer') and public.is_active_user());

create policy "shipments: district officer read"
  on public.shipments for select
  using (public.has_role('district_officer') and public.is_active_user());

create policy "shipments: district officer update"
  on public.shipments for update
  using (public.has_role('district_officer') and public.is_active_user());

create policy "shipments: control room read all"
  on public.shipments for select
  using (public.has_role('control_room') and public.is_active_user());

-- ===========================================================================
-- weather_data / disaster_events — read-only reference data
-- ===========================================================================

create policy "weather_data: active user read"
  on public.weather_data for select
  using (auth.uid() is not null and public.is_active_user());

create policy "disaster_events: active user read"
  on public.disaster_events for select
  using (auth.uid() is not null and public.is_active_user());

-- ===========================================================================
-- road_incidents
-- ===========================================================================

-- Field officers can create and read their own reports
create policy "incidents: field officer create"
  on public.road_incidents for insert
  with check (
    public.has_role('field_officer')
    and public.is_active_user()
    and reported_by = auth.uid()
  );

create policy "incidents: field officer own read"
  on public.road_incidents for select
  using (
    public.has_role('field_officer')
    and public.is_active_user()
    and reported_by = auth.uid()
  );

create policy "incidents: field officer own update pending"
  on public.road_incidents for update
  using (
    public.has_role('field_officer')
    and public.is_active_user()
    and reported_by = auth.uid()
    and status = 'pending'
  );

-- District officers see incidents in their district
create policy "incidents: district officer read"
  on public.road_incidents for select
  using (
    public.has_role('district_officer')
    and public.is_active_user()
    and (district is null or district = public.my_district_name())
  );

create policy "incidents: district officer update"
  on public.road_incidents for update
  using (
    public.has_role('district_officer')
    and public.is_active_user()
    and (district is null or district = public.my_district_name())
  );

-- Control room sees all incidents
create policy "incidents: control room read all"
  on public.road_incidents for select
  using (
    public.has_role('control_room')
    and public.is_active_user()
  );

create policy "incidents: control room update"
  on public.road_incidents for update
  using (
    public.has_role('control_room')
    and public.is_active_user()
  );

-- ===========================================================================
-- risk assessments, accessibility scores, predictions — read-only
-- ===========================================================================

create policy "risk: active user read"
  on public.route_risk_assessments for select
  using (auth.uid() is not null and public.is_active_user());

create policy "accessibility: active user read"
  on public.accessibility_scores for select
  using (auth.uid() is not null and public.is_active_user());

create policy "predictions: active user read"
  on public.route_predictions for select
  using (auth.uid() is not null and public.is_active_user());

create policy "ml_models: active user read"
  on public.ml_models for select
  using (auth.uid() is not null and public.is_active_user());

-- ===========================================================================
-- tasks
-- ===========================================================================

-- Field officers see tasks assigned to them
create policy "tasks: field officer own read"
  on public.tasks for select
  using (
    public.has_role('field_officer')
    and public.is_active_user()
    and assigned_to = auth.uid()
  );

create policy "tasks: field officer own update"
  on public.tasks for update
  using (
    public.has_role('field_officer')
    and public.is_active_user()
    and assigned_to = auth.uid()
  );

-- District officers manage tasks in their district
create policy "tasks: district officer read"
  on public.tasks for select
  using (
    public.has_role('district_officer')
    and public.is_active_user()
    and (district is null or district = public.my_district_name())
  );

create policy "tasks: district officer write"
  on public.tasks for all
  using (
    public.has_role('district_officer')
    and public.is_active_user()
    and (district is null or district = public.my_district_name())
  );

-- Control room can read and manage all tasks
create policy "tasks: control room all"
  on public.tasks for all
  using (
    public.has_role('control_room')
    and public.is_active_user()
  );

-- ===========================================================================
-- alerts
-- ===========================================================================

-- All active users see alerts matching their role or broadcast (null target)
create policy "alerts: role-scoped read"
  on public.alerts for select
  using (
    auth.uid() is not null
    and public.is_active_user()
    and (target_role is null or target_role = public.my_role())
  );

-- Field officers can acknowledge their alerts
create policy "alerts: field officer acknowledge"
  on public.alerts for update
  using (
    public.has_role('field_officer')
    and public.is_active_user()
  )
  with check (
    status = 'acknowledged'
    and acknowledged_by = auth.uid()
  );

-- District officers can acknowledge/resolve
create policy "alerts: district officer update"
  on public.alerts for update
  using (
    public.has_role('district_officer')
    and public.is_active_user()
    and (district is null or district = public.my_district_name())
  );

-- Control room can create and manage all alerts
create policy "alerts: control room all"
  on public.alerts for all
  using (
    public.has_role('control_room')
    and public.is_active_user()
  );

-- ===========================================================================
-- notifications — strictly personal
-- ===========================================================================

create policy "notifications: own read"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "notifications: own update read-state"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ===========================================================================
-- data_sources / ingestion_logs — control room read only
-- ===========================================================================

create policy "data_sources: control room read"
  on public.data_sources for select
  using (public.has_role('control_room') and public.is_active_user());

create policy "ingestion_logs: control room read"
  on public.data_ingestion_logs for select
  using (public.has_role('control_room') and public.is_active_user());

-- ===========================================================================
-- audit_logs — no direct user access; service-role only via Edge Functions
-- ===========================================================================

-- No user-facing policies; only the service role (Edge Functions) can write/read.
