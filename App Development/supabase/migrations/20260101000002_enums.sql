-- 0002: Enums
-- Central enum definitions used across all tables.

-- User roles matching the three React app role types
create type public.user_role_enum as enum (
  'field_officer',
  'district_officer',
  'control_room'
);

-- Risk/priority levels matching Priority type in the React app
-- Also used for alert severity which adds 'moderate' and 'info'
create type public.priority_enum as enum (
  'critical',
  'high',
  'moderate',
  'medium',
  'low',
  'info'
);

-- Incident lifecycle states (normalized across district + control room views)
create type public.incident_status_enum as enum (
  'pending',
  'active',
  'escalated',
  'resolved'
);

-- Route accessibility status
create type public.route_status_enum as enum (
  'open',
  'restricted',
  'blocked',
  'closed'
);

-- Vehicle / shipment status
create type public.vehicle_status_enum as enum (
  'moving',
  'stopped',
  'delayed',
  'at_risk',
  'on_time',
  'arrived'
);

-- Task lifecycle states
create type public.task_status_enum as enum (
  'new',
  'pending',
  'in_progress',
  'completed',
  'escalated',
  'overdue'
);

-- Alert acknowledgement status
create type public.alert_status_enum as enum (
  'active',
  'acknowledged',
  'resolved'
);

-- Disaster type matching disaster_events usage
create type public.disaster_type_enum as enum (
  'flood',
  'flash_flood',
  'landslide',
  'earthquake',
  'cyclone',
  'drought',
  'bridge_damage',
  'road_blockage',
  'infrastructure_damage',
  'other'
);

-- Incident report category (ReportScreen wizard types)
create type public.incident_type_enum as enum (
  'road_block',
  'flood',
  'landslide',
  'bridge_damage',
  'vehicle_breakdown',
  'accident',
  'infrastructure_damage',
  'other'
);

-- Severity levels for incident reports
create type public.severity_enum as enum (
  'critical',
  'high',
  'medium',
  'low'
);

-- Offline sync state for incident reports from field officers
create type public.sync_status_enum as enum (
  'pending',
  'synced',
  'failed'
);

-- Road type
create type public.road_type_enum as enum (
  'national_highway',
  'state_highway',
  'district_road',
  'village_road',
  'mountain_pass',
  'bridge'
);

-- Logistics request status
create type public.logistics_status_enum as enum (
  'draft',
  'submitted',
  'approved',
  'assigned',
  'in_transit',
  'delivered',
  'cancelled'
);

-- Notification type
create type public.notification_type_enum as enum (
  'alert',
  'task',
  'incident',
  'route',
  'system',
  'logistics'
);

-- Notification severity
create type public.notification_severity_enum as enum (
  'critical',
  'high',
  'medium',
  'info'
);

-- ML model status
create type public.model_status_enum as enum (
  'training',
  'active',
  'deprecated',
  'failed'
);

-- AI prediction type
create type public.prediction_type_enum as enum (
  'disruption',
  'delay',
  'route_recommendation',
  'resource'
);

-- Segment status
create type public.segment_status_enum as enum (
  'clear',
  'caution',
  'blocked',
  'closed'
);

-- Shipment status
create type public.shipment_status_enum as enum (
  'scheduled',
  'departed',
  'in_transit',
  'delayed',
  'at_risk',
  'stopped',
  'arrived',
  'cancelled'
);
