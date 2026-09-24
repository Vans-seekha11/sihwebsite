-- 0008: Logistics Requests and Shipments
-- Logistics requests are submitted by field/district officers.
-- Shipments track the live movement of cargo once dispatched.

create table public.logistics_requests (
  id                      uuid                         primary key default extensions.uuid_generate_v4(),
  user_id                 uuid                         references auth.users (id),
  source_location_id      uuid                         references public.locations (id),
  destination_location_id uuid                         references public.locations (id),
  cargo_type              text,
  cargo_description       text,
  cargo_weight_kg         double precision,
  priority                public.priority_enum         not null default 'medium',
  required_by             timestamptz,
  preferred_transport_id  uuid                         references public.transport_modes (id),
  status                  public.logistics_status_enum not null default 'draft',
  notes                   text,
  created_at              timestamptz                  not null default now(),
  updated_at              timestamptz                  not null default now()
);

create table public.shipments (
  id                  uuid                         primary key default extensions.uuid_generate_v4(),
  request_id          uuid                         references public.logistics_requests (id),
  route_id            uuid                         references public.routes (id),
  transport_mode_id   uuid                         references public.transport_modes (id),
  shipment_number     text                         unique not null,  -- 'LG-102', 'TRK-1042' etc.
  vehicle_id          text,                                          -- external vehicle identifier
  cargo_weight_kg     double precision,
  cargo_description   text,
  origin_location_id  uuid                         references public.locations (id),
  dest_location_id    uuid                         references public.locations (id),
  current_location    extensions.geography(Point,4326),
  current_location_text text,                                        -- human-readable narrative
  risk_level          public.priority_enum,
  status              public.shipment_status_enum  not null default 'scheduled',
  departure_time      timestamptz,
  estimated_arrival   timestamptz,
  actual_arrival      timestamptz,
  delay_description   text,
  created_at          timestamptz                  not null default now(),
  updated_at          timestamptz                  not null default now()
);

comment on table public.shipments is
  'Live shipment tracking. shipment_number is the user-visible ID (LG-102 etc.).';
comment on column public.shipments.current_location_text is
  'Narrative location used for display when precise GPS is unavailable.';
