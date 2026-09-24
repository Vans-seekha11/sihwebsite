-- 0011: Tasks, Alerts, Notifications, Data Sources, Ingestion Logs, Audit Logs

-- ---------------------------------------------------------------------------
-- Tasks (field officer MyTasksScreen + district/control task management)
-- ---------------------------------------------------------------------------
create table public.tasks (
  id              uuid                     primary key default extensions.uuid_generate_v4(),
  task_ref        text                     unique,           -- 'TSK-001', 'TSK-0891' etc.
  title           text                     not null,
  description     text,
  location_id     uuid                     references public.locations (id),
  location_text   text,
  route_id        uuid                     references public.routes (id),
  incident_id     uuid                     references public.road_incidents (id),
  shipment_id     uuid                     references public.shipments (id),
  assigned_to     uuid                     references auth.users (id),
  created_by      uuid                     references auth.users (id),
  district        text,
  priority        public.priority_enum     not null default 'medium',
  status          public.task_status_enum  not null default 'new',
  accepted_at     timestamptz,
  completed_at    timestamptz,
  deadline        timestamptz,
  created_at      timestamptz              not null default now(),
  updated_at      timestamptz              not null default now()
);

comment on table public.tasks is
  'Operational tasks visible in MyTasksScreen (field) and district task management.';
comment on column public.tasks.task_ref is
  'Human-readable reference. TSK-001 for field tasks, TSK-0891 for district tasks.';

-- ---------------------------------------------------------------------------
-- Alerts (AlertsScreen field + district/control alert feeds)
-- ---------------------------------------------------------------------------
create table public.alerts (
  id              uuid                               primary key default extensions.uuid_generate_v4(),
  alert_ref       text                               unique,       -- 'ALT-001' etc.
  severity        public.priority_enum               not null,
  title           text                               not null,
  description     text,
  location_id     uuid                               references public.locations (id),
  location_text   text,
  route_id        uuid                               references public.routes (id),
  incident_id     uuid                               references public.road_incidents (id),
  disaster_id     uuid                               references public.disaster_events (id),
  source          text,                                             -- 'Sensor + Citizen SMS', 'AI model' etc.
  distance_text   text,                                             -- '5 km ahead', 'District' etc.
  action_text     text,
  district        text,
  state           text,
  target_role     public.user_role_enum,                            -- null = broadcast to all roles
  status          public.alert_status_enum           not null default 'active',
  acknowledged_by uuid                               references auth.users (id),
  acknowledged_at timestamptz,
  created_at      timestamptz                        not null default now(),
  updated_at      timestamptz                        not null default now()
);

comment on table public.alerts is
  'Operational alerts sent to field officers, district officers, and/or control room.';
comment on column public.alerts.target_role is
  'Null = all roles see this alert. Set to a specific role to limit visibility.';

-- ---------------------------------------------------------------------------
-- Notifications (per-user, Realtime-pushed inbox)
-- ---------------------------------------------------------------------------
create table public.notifications (
  id               uuid                               primary key default extensions.uuid_generate_v4(),
  user_id          uuid                               not null references auth.users (id) on delete cascade,
  type             public.notification_type_enum      not null,
  title            text                               not null,
  message          text                               not null,
  severity         public.notification_severity_enum  not null default 'info',
  related_route_id uuid                               references public.routes (id),
  related_event_id uuid                               references public.disaster_events (id),
  related_alert_id uuid                               references public.alerts (id),
  is_read          boolean                            not null default false,
  created_at       timestamptz                        not null default now()
);

comment on table public.notifications is
  'Per-user notification inbox. Delivered via Supabase Realtime and push notifications.';

-- ---------------------------------------------------------------------------
-- Data sources registry (GIS, weather, ML providers)
-- ---------------------------------------------------------------------------
create table public.data_sources (
  id           uuid        primary key default extensions.uuid_generate_v4(),
  name         text        not null unique,
  type         text        not null,   -- 'weather', 'disaster', 'gis', 'ml'
  provider     text,
  config       jsonb,                  -- non-secret provider config (base URLs, layer names)
  is_active    boolean     not null default true,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Data ingestion logs (Cron job audit trail)
-- ---------------------------------------------------------------------------
create table public.data_ingestion_logs (
  id           uuid        primary key default extensions.uuid_generate_v4(),
  source_id    uuid        references public.data_sources (id),
  source_name  text,
  started_at   timestamptz not null,
  completed_at timestamptz,
  records_in   integer,
  records_out  integer,
  status       text        not null default 'running',  -- 'running' | 'success' | 'partial' | 'failed'
  error        text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Audit logs (action trail for compliance)
-- ---------------------------------------------------------------------------
create table public.audit_logs (
  id           uuid        primary key default extensions.uuid_generate_v4(),
  user_id      uuid        references auth.users (id),
  action       text        not null,       -- 'create', 'update', 'delete', 'login', 'logout'
  entity_type  text        not null,       -- 'incident', 'task', 'alert', etc.
  entity_id    uuid,
  old_value    jsonb,
  new_value    jsonb,
  ip_address   text,
  created_at   timestamptz not null default now()
);

comment on table public.audit_logs is
  'Append-only audit trail. Never store passwords, tokens, or secrets in old_value/new_value.';
