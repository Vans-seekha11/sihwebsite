-- 0014: Triggers
-- Automatic updated_at maintenance, profile creation, incident ref generation, and audit logging.

-- ===========================================================================
-- Generic updated_at trigger function
-- ===========================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at to all tables that have the column
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_locations_updated_at
  before update on public.locations
  for each row execute function public.set_updated_at();

create trigger trg_roads_updated_at
  before update on public.roads
  for each row execute function public.set_updated_at();

create trigger trg_routes_updated_at
  before update on public.routes
  for each row execute function public.set_updated_at();

create trigger trg_logistics_updated_at
  before update on public.logistics_requests
  for each row execute function public.set_updated_at();

create trigger trg_shipments_updated_at
  before update on public.shipments
  for each row execute function public.set_updated_at();

create trigger trg_disaster_events_updated_at
  before update on public.disaster_events
  for each row execute function public.set_updated_at();

create trigger trg_incidents_updated_at
  before update on public.road_incidents
  for each row execute function public.set_updated_at();

create trigger trg_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create trigger trg_alerts_updated_at
  before update on public.alerts
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- Auto-create profile row when a new auth user is created
-- ===========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    false  -- must be approved by admin before operational access
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_auth_users_new_profile
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- Auto-generate incident_ref on insert
-- ===========================================================================
create trigger trg_incidents_generate_ref
  before insert on public.road_incidents
  for each row
  when (new.incident_ref is null)
  execute function public.generate_incident_ref();

-- ===========================================================================
-- Auto-generate task_ref on insert
-- ===========================================================================
create or replace function public.generate_task_ref()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_seq integer;
begin
  select coalesce(max(
    (regexp_match(task_ref, 'TSK-(\d+)'))[1]::integer
  ), 0) + 1
  into v_seq
  from public.tasks;

  new.task_ref := 'TSK-' || lpad(v_seq::text, 4, '0');
  return new;
end;
$$;

create trigger trg_tasks_generate_ref
  before insert on public.tasks
  for each row
  when (new.task_ref is null)
  execute function public.generate_task_ref();

-- ===========================================================================
-- Auto-generate alert_ref on insert
-- ===========================================================================
create or replace function public.generate_alert_ref()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_seq integer;
begin
  select coalesce(max(
    (regexp_match(alert_ref, 'ALT-(\d+)'))[1]::integer
  ), 0) + 1
  into v_seq
  from public.alerts;

  new.alert_ref := 'ALT-' || lpad(v_seq::text, 3, '0');
  return new;
end;
$$;

create trigger trg_alerts_generate_ref
  before insert on public.alerts
  for each row
  when (new.alert_ref is null)
  execute function public.generate_alert_ref();

-- ===========================================================================
-- Audit log trigger (records create/update/delete on key tables)
-- ===========================================================================
create or replace function public.write_audit_log()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_value,
    new_value
  )
  values (
    auth.uid(),
    lower(tg_op),       -- 'insert', 'update', 'delete'
    tg_table_name,
    case
      when tg_op = 'DELETE' then old.id
      else new.id
    end,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );
  return null;  -- after trigger, return value unused
end;
$$;

-- Apply audit to key tables
create trigger trg_audit_incidents
  after insert or update or delete on public.road_incidents
  for each row execute function public.write_audit_log();

create trigger trg_audit_tasks
  after insert or update or delete on public.tasks
  for each row execute function public.write_audit_log();

create trigger trg_audit_alerts
  after insert or update or delete on public.alerts
  for each row execute function public.write_audit_log();

create trigger trg_audit_shipments
  after insert or update or delete on public.shipments
  for each row execute function public.write_audit_log();

create trigger trg_audit_logistics
  after insert or update or delete on public.logistics_requests
  for each row execute function public.write_audit_log();
