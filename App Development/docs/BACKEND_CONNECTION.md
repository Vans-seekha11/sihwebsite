# Backend Connection Guide

## Purpose

This document defines the production connection contract for the NER Logistics Flutter application and its Supabase backend.

The existing React/Vite application remains the source of truth for screens, workflows, role behavior, and demo content. The Flutter application will connect to Supabase using `supabase_flutter`.

The backend uses:

- Supabase Auth
- Supabase PostgreSQL
- PostGIS
- Row Level Security (RLS)
- Supabase Storage
- Supabase Realtime
- Supabase Edge Functions
- Supabase Cron
- External GIS APIs
- A separate Python ML inference service

No service-role key, database password, private GIS credential, or ML credential may be shipped in Flutter.

## Architecture

```text
Flutter application
  |
  | supabase_flutter using project URL + publishable key
  |
  +-- Supabase Auth
  +-- Supabase Data API
  +-- Supabase Realtime
  +-- Supabase Storage
  +-- Supabase Edge Functions
  v
PostgreSQL + PostGIS
  |
  +-- RLS policies
  +-- Database functions
  +-- Triggers
  +-- Spatial indexes
  +-- Audit records
  +-- pg_cron jobs
  |
  +-- GIS providers: tiles, geocoding, routing, elevation
  +-- Python ML inference service through Edge Functions
```

Supabase is the primary backend. A separate API server is not required for the initial architecture. Edge Functions are the server-side boundary for private credentials, external providers, privileged operations, and ML orchestration.

## Environments

Maintain separate Supabase projects for:

| Environment | Purpose | Client configuration |
|---|---|---|
| Development | Local migrations, seed data, tests | Local Supabase URL/key or development project URL/key |
| Staging | Shared QA and integration testing | Staging project URL and publishable key |
| Production | Real users and production data | Production project URL and publishable key |

Flutter configuration must be injected per build environment. Do not commit real values.

Recommended variables:

```text
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable-key>
GIS_TILE_PROVIDER=<provider-name>
GIS_GEOCODING_PROVIDER=<provider-name>
GIS_ROUTING_PROVIDER=<provider-name>
GIS_ELEVATION_PROVIDER=<provider-name>
```

Server-only Supabase Edge Function secrets:

```text
GIS_PROVIDER_API_KEY
GEOCODING_PROVIDER_API_KEY
ROUTING_PROVIDER_API_KEY
ELEVATION_PROVIDER_API_KEY
ML_SERVICE_URL
ML_SERVICE_API_KEY
FCM_SERVICE_ACCOUNT
WEATHER_PROVIDER_API_KEY
DISASTER_PROVIDER_API_KEY
```

The publishable key is client-safe only when RLS is correctly configured. It does not replace authorization policies.

## Initial Setup

### Required tools

Install and verify:

```powershell
flutter --version
dart --version
supabase --version
adb version
```

For Android development, install Android Studio, Android SDK, platform tools, and a supported JDK. For iOS builds, use macOS with Xcode and CocoaPods.

### Supabase CLI

From the repository root:

```bash
supabase login
supabase init
supabase start
supabase status
```

Link a hosted environment only after confirming the project reference:

```bash
supabase link --project-ref <project-ref>
```

Apply migrations:

```bash
supabase db reset
supabase db push
```

Deploy Edge Functions:

```bash
supabase functions deploy calculate-route-risk
supabase functions deploy route-recommendation
supabase functions deploy sync-weather
supabase functions deploy sync-disasters
supabase functions deploy ml-prediction
supabase functions deploy send-alert
```

Never use `supabase db push` against production without reviewing the migration and taking the required backup.

## Flutter Connection

Initialize Supabase once before `runApp`:

```dart
await Supabase.initialize(
  url: const String.fromEnvironment('SUPABASE_URL'),
  anonKey: const String.fromEnvironment('SUPABASE_PUBLISHABLE_KEY'),
);
```

Use the current Supabase client through Riverpod providers. Do not instantiate clients inside screen widgets.

Recommended service boundary:

```text
Screen
  -> Riverpod provider/notifier
  -> feature repository
  -> data source/service
  -> Supabase client
```

Recommended services:

- `SupabaseService`: exposes the configured client.
- `AuthService`: sign in, sign up, verification, reset, refresh, logout.
- `DatabaseService`: typed query helpers and RPC calls.
- `StorageService`: signed URLs and restricted uploads.
- `RealtimeService`: scoped table/channel subscriptions.
- `EdgeFunctionService`: invokes server-side operations.

Recommended repositories:

- `AuthRepository`
- `ProfileRepository`
- `LocationRepository`
- `RouteRepository`
- `LogisticsRepository`
- `ShipmentRepository`
- `WeatherRepository`
- `DisasterRepository`
- `IncidentRepository`
- `NotificationRepository`

Raw Supabase queries must remain in data sources or repositories, never in widgets.

## Authentication

### Supported flows

The first production authentication release supports:

1. Email/password sign up.
2. Email verification.
3. Email/password sign in.
4. Password reset email.
5. Password update after reset.
6. Session restoration on app start.
7. Secure logout.
8. Auth state stream handling.

The current React demo credentials are not production credentials and must not be copied into Supabase or Flutter.

### Signup flow

```text
Flutter signup form
  -> Supabase Auth signUp
  -> verification email
  -> auth.users record
  -> database trigger creates profiles row
  -> administrator assigns approved role
  -> user signs in
```

A new account must not receive an operational role automatically. Until approval, the profile remains inactive or pending.

### Login flow

```text
Flutter login form
  -> Supabase Auth signInWithPassword
  -> session restored in secure SDK storage
  -> profile + role query
  -> active/approved check
  -> GoRouter role redirect
```

Required rejection states:

- Invalid credentials
- Email not verified
- Account inactive
- Role not assigned
- Account suspended
- Network timeout
- Supabase service error

### Password reset

Use Supabase Auth password reset email with a configured redirect URL. The reset link must deep-link to the Flutter reset-password route on Android and iOS.

## Roles and Authorization

Operational roles:

```text
field_officer
district_officer
control_room
```

Role is stored in the database and enforced by RLS/database functions. The client role is only a display and navigation hint; it is not a security boundary.

Recommended role table:

```text
user_roles
- id uuid primary key
- user_id uuid references auth.users(id)
- role text not null
- district_id uuid nullable
- is_active boolean not null default true
- approved_by uuid nullable
- approved_at timestamptz nullable
- created_at timestamptz not null default now()
```

Role scope:

| Role | Scope |
|---|---|
| Field Officer | Assigned area, own reports, assigned tasks, assigned routes, relevant alerts |
| District Officer | Assigned district, district incidents, routes, logistics, reports, analytics |
| Control Room | Regional monitoring, cross-district operations, broadcasts, risk intelligence |

Every role-sensitive query must validate the authenticated user with `auth.uid()` and database role helpers.

## Core Database Model

All schema changes must be migration files. The initial migration set should include:

```text
0001_extensions.sql
0002_enums.sql
0003_profiles.sql
0004_locations.sql
0005_roads.sql
0006_routes.sql
0007_logistics.sql
0008_weather.sql
0009_disasters.sql
0010_incidents.sql
0011_risk.sql
0012_predictions.sql
0013_notifications.sql
0014_storage.sql
0015_rls.sql
0016_functions.sql
0017_triggers.sql
0018_indexes.sql
0019_realtime.sql
```

### Required tables

```text
profiles
user_roles
locations
roads
routes
route_segments
transport_modes
logistics_requests
shipments
weather_data
disaster_events
road_incidents
route_risk_assessments
accessibility_scores
route_predictions
ml_models
notifications
data_sources
data_ingestion_logs
audit_logs
```

### Profiles

```text
profiles
- id uuid primary key references auth.users(id) on delete cascade
- full_name text
- phone text
- organization text
- avatar_url text
- is_active boolean not null default false
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
```

Never duplicate passwords or authentication secrets in `profiles`.

### Locations

```text
locations
- id uuid primary key
- name text not null
- district text
- state text
- latitude double precision
- longitude double precision
- location geography(Point,4326)
- elevation double precision
- population integer
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
```

### Roads

```text
roads
- id uuid primary key
- road_name text
- road_type road_type_enum
- source_location_id uuid references locations(id)
- destination_location_id uuid references locations(id)
- geometry geography(LineString,4326)
- length_km double precision
- width_m double precision
- surface_type text
- max_speed_kmph double precision
- condition_score double precision
- accessibility_score double precision
- is_active boolean not null default true
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
```

### Routes and segments

```text
routes
- id uuid primary key
- source_location_id uuid references locations(id)
- destination_location_id uuid references locations(id)
- geometry geography(LineString,4326)
- distance_km double precision
- estimated_time_minutes double precision
- risk_score double precision
- accessibility_score double precision
- reliability_score double precision
- route_status route_status_enum
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

route_segments
- id uuid primary key
- route_id uuid references routes(id) on delete cascade
- road_id uuid references roads(id)
- sequence_number integer not null
- distance_km double precision
- travel_time_minutes double precision
- risk_score double precision
- condition_score double precision
- status segment_status_enum
```

### Logistics and shipments

```text
logistics_requests
- id uuid primary key
- user_id uuid references auth.users(id)
- source_location_id uuid references locations(id)
- destination_location_id uuid references locations(id)
- cargo_type text
- cargo_description text
- cargo_weight_kg double precision
- priority priority_enum
- required_by timestamptz
- preferred_transport_id uuid references transport_modes(id)
- status logistics_status_enum
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

shipments
- id uuid primary key
- request_id uuid references logistics_requests(id)
- route_id uuid references routes(id)
- transport_mode_id uuid references transport_modes(id)
- shipment_number text unique not null
- cargo_weight_kg double precision
- current_location geography(Point,4326)
- status shipment_status_enum
- departure_time timestamptz
- estimated_arrival timestamptz
- actual_arrival timestamptz
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
```

### Weather, disasters, incidents

```text
weather_data
- id uuid primary key
- location_id uuid references locations(id)
- recorded_at timestamptz not null
- temperature_c double precision
- humidity_percent double precision
- rainfall_mm double precision
- wind_speed_kmph double precision
- visibility_km double precision
- pressure_hpa double precision
- weather_condition text
- source text
- raw_data jsonb
- created_at timestamptz not null default now()

disaster_events
- id uuid primary key
- type disaster_type_enum
- severity integer
- title text
- description text
- location_id uuid references locations(id)
- geometry geography
- started_at timestamptz
- ended_at timestamptz
- probability double precision
- source text
- source_event_id text
- verified boolean not null default false
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

road_incidents
- id uuid primary key
- reported_by uuid references auth.users(id)
- location_id uuid references locations(id)
- geometry geography(Point,4326)
- category text not null
- title text
- description text
- severity integer
- media_path text
- status text not null default 'pending'
- sync_source text not null default 'online'
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
```

### Risk, accessibility, predictions

```text
route_risk_assessments
- id uuid primary key
- route_id uuid references routes(id) on delete cascade
- weather_risk double precision
- flood_risk double precision
- landslide_risk double precision
- road_condition_risk double precision
- traffic_risk double precision
- disaster_risk double precision
- total_risk_score double precision
- confidence_score double precision
- model_version text
- calculated_at timestamptz not null

accessibility_scores
- id uuid primary key
- route_id uuid references routes(id) on delete cascade
- road_accessibility double precision
- weather_accessibility double precision
- transport_accessibility double precision
- infrastructure_score double precision
- overall_score double precision
- calculated_at timestamptz not null

route_predictions
- id uuid primary key
- route_id uuid references routes(id)
- prediction_type text
- predicted_value double precision
- prediction_unit text
- confidence double precision
- features jsonb
- model_version text
- prediction_time timestamptz
- created_at timestamptz not null default now()

ml_models
- id uuid primary key
- name text
- version text
- model_type text
- model_uri text
- accuracy double precision
- precision_score double precision
- recall_score double precision
- f1_score double precision
- training_dataset text
- status model_status_enum
- created_at timestamptz not null default now()
```

### Notifications and audit

```text
notifications
- id uuid primary key
- user_id uuid references auth.users(id) on delete cascade
- type notification_type_enum
- title text not null
- message text not null
- severity notification_severity_enum
- related_route_id uuid references routes(id)
- related_event_id uuid references disaster_events(id)
- is_read boolean not null default false
- created_at timestamptz not null default now()

audit_logs
- id uuid primary key
- user_id uuid references auth.users(id)
- action text not null
- entity_type text not null
- entity_id uuid
- old_value jsonb
- new_value jsonb
- created_at timestamptz not null default now()
```

## PostGIS

Enable PostGIS in the first migration. Use geography types with SRID 4326 for latitude/longitude-based application queries.

Required spatial indexes:

```sql
create index locations_location_gist_idx
  on public.locations using gist (location);

create index roads_geometry_gist_idx
  on public.roads using gist (geometry);

create index routes_geometry_gist_idx
  on public.routes using gist (geometry);

create index incidents_geometry_gist_idx
  on public.road_incidents using gist (geometry);
```

Required database functions:

- `find_nearby_locations(point, radius_meters)`
- `find_nearby_roads(point, radius_meters)`
- `get_route_segments(route_id)`
- `get_active_disasters(point, radius_meters)`
- `calculate_distance(origin, destination)`

Validate coordinates and reject invalid or out-of-region data at the database boundary.

## RLS and Grants

Enable RLS on every application table exposed through the Data API:

```sql
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.routes enable row level security;
alter table public.road_incidents enable row level security;
alter table public.notifications enable row level security;
```

Baseline policies:

| Table/data | Field Officer | District Officer | Control Room |
|---|---|---|---|
| Own profile | Read/update | Read/update | Read/update |
| Own incidents | Create/read/update pending | Read/review district | Read/review regional |
| District routes | Assigned area | Assigned district | Regional |
| Logistics | Own/assigned | District | Regional |
| Notifications | Own | Own | Own |
| Audit logs | No direct access | No direct access | Restricted operational access |

Use security-definer helper functions for role checks, for example:

```sql
public.has_role('control_room')
public.user_district_id()
public.is_active_user()
```

RLS tests must cover:

- A user cannot read another user's profile.
- A field officer cannot read another district's private data.
- A district officer cannot modify regional configuration.
- A control-room user cannot impersonate another account.
- Inactive users cannot access operational data.
- Storage paths cannot be used to bypass row permissions.

## Realtime

Enable Realtime only for tables that require live updates:

- `shipments`
- `road_incidents`
- `disaster_events`
- `notifications`
- `routes`

Flutter subscriptions must be scoped by user, district, route, or region. Do not subscribe every client to every table.

Required behaviors:

- Shipment location/status updates update the relevant view.
- Critical disaster/route events create a notification.
- Notification read state updates persist to Supabase.
- Subscription errors expose a retry state.
- Subscriptions are disposed when a screen/provider is no longer active.

## Storage

Initial buckets:

```text
avatars
incident-media
disaster-media
documents
shipment-documents
```

Rules:

- Keep buckets private by default.
- Use signed URLs for reads.
- Restrict upload paths to the authenticated user's ID or approved district scope.
- Validate content type and maximum file size.
- Store only the Storage path in database records.
- Remove orphaned files through scheduled cleanup after retention rules are approved.

Incident uploads should be written locally first when offline, then uploaded when connectivity returns. The database record must expose pending, synced, and failed status.

## Edge Functions

Use Edge Functions for private or privileged operations:

| Function | Responsibility |
|---|---|
| `calculate-route-risk` | Combines route, weather, disaster, and road inputs |
| `route-recommendation` | Ranks candidate routes and returns explainable reasons |
| `sync-weather` | Calls the selected weather provider and normalizes data |
| `sync-disasters` | Calls disaster providers and normalizes events |
| `ml-prediction` | Calls the Python inference service and stores predictions |
| `send-alert` | Creates notifications and invokes push delivery |
| `process-road-incident` | Validates, enriches, and applies incident effects |

Every function must:

1. Validate the caller or use an explicit service-only authorization path.
2. Validate input with a schema.
3. Avoid logging secrets or sensitive user data.
4. Apply timeouts to external calls.
5. Return typed success/error responses.
6. Write an ingestion or audit record where appropriate.
7. Be idempotent when triggered by a retry or Cron.

## GIS Provider Contract

The GIS vendor is intentionally not selected yet. Implement adapters so the application is not coupled to one provider.

Required capabilities:

```text
TileProvider
- tile URL/template
- attribution
- style/layer configuration
- offline/cache policy

GeocodingProvider
- forward search
- reverse geocode
- normalized place result

RoutingProvider
- candidate routes
- geometry
- distance
- ETA
- route warnings

ElevationProvider
- point elevation
- sampled route profile
- terrain metadata
```

The Flutter app should use public configuration for tile display only. Private geocoding, routing, and elevation keys should be called through Edge Functions when provider terms require key protection.

Provider responses must be normalized into internal models before storage or UI use.

## Python ML Service Contract

The ML service is a separate Python HTTP service. Flutter must never call it directly.

```text
Flutter
  -> Supabase Edge Function: ml-prediction
  -> Python ML service
  -> Edge Function validates response
  -> route_predictions / route_risk_assessments
  -> Flutter reads typed prediction result
```

Required request shape:

```json
{
  "route_id": "uuid",
  "route_segments": [],
  "weather_features": {},
  "disaster_features": {},
  "road_condition_features": {},
  "traffic_features": {},
  "model_version": "string"
}
```

Required response shape:

```json
{
  "prediction": 0.0,
  "risk_score": 0.0,
  "confidence": 0.0,
  "model_version": "string",
  "warnings": [],
  "features_reference": "string"
}
```

The final contract must define:

- ML service base URL
- Authentication method between Edge Function and Python service
- Request timeout
- Retry policy
- Maximum payload size
- Model version behavior
- Fallback when the service is unavailable
- Whether predictions are synchronous or queued
- Health check endpoint

The application must retain the last valid prediction and show its timestamp when a fresh prediction is unavailable.

## Route Intelligence

The route recommendation flow is:

```text
Origin + destination + cargo + weight + priority + deadline
  -> GIS candidate routes
  -> road, weather, disaster, and traffic features
  -> risk calculation
  -> ML prediction
  -> accessibility calculation
  -> explainable ranking
  -> recommended route
```

Return:

```json
{
  "route_id": "uuid",
  "recommendation": "RECOMMENDED",
  "risk_score": 28,
  "accessibility_score": 86,
  "reliability_score": 91,
  "estimated_time_minutes": 420,
  "distance_km": 284.5,
  "warnings": ["Heavy rainfall expected near Segment 4"],
  "reasons": ["Lower landslide risk", "Better road condition"]
}
```

The UI must show why a route was recommended. Scores must not be presented as unexplained ML output.

## Scheduled Jobs

Use Supabase Cron for:

- Weather synchronization.
- Disaster synchronization.
- Road status synchronization.
- Risk recalculation.
- Notification processing.
- Data cleanup.
- Prediction refresh.

Cron jobs must invoke idempotent database functions or Edge Functions. Store execution results in `data_ingestion_logs`.

Do not place provider keys in SQL definitions. Use Edge Function secrets or Supabase Vault.

## Seed Data

Seed only development/staging environments. Seed data should represent the current React screens:

- Three approved demo roles.
- North Eastern Region districts and locations.
- Sample road geometry and route segments.
- District connectivity scores.
- Sample incidents and disaster events.
- Sample shipments and logistics requests.
- Sample alerts and notifications.
- Sample risk assessments and predictions.

Never seed real passwords, service keys, personal data, or production identifiers.

Seed records must be deterministic enough for automated tests and replaceable by fixtures.

## Flutter Feature Mapping

| Flutter feature | Supabase boundary |
|---|---|
| Auth | Supabase Auth + `profiles` + `user_roles` |
| Field home | Locations, roads, routes, alerts |
| Route planner | Routing Edge Function + routes + risk |
| Active trip | Route Realtime + shipment/route status |
| Incident report | Storage + `road_incidents` + offline queue |
| My reports | `road_incidents` owned by authenticated user |
| Alerts | `notifications` + Realtime + push integration |
| District overview | Locations, roads, accessibility scores |
| Corridor detail | Routes, segments, risk assessments, predictions |
| Fleet view | Shipments + Realtime |
| Reports feed | Road incidents with district/region RLS |
| Settings | Shared preferences + notification/profile data |
| Admin | Server-enforced admin policies and Edge Functions |

## Error Contract

Normalize backend failures into user-safe messages:

| Code | Meaning | Client behavior |
|---|---|---|
| 400 | Invalid request | Show field or request validation |
| 401 | Session expired | Refresh or redirect to login |
| 403 | Not authorized | Show access error; do not retry blindly |
| 404 | Resource missing | Show not-found state |
| 408 | Timeout | Offer retry and preserve local work |
| 409 | Conflict | Refresh resource and explain conflict |
| 429 | Rate limited | Back off and show retry timing |
| 500/503 | Service unavailable | Show offline/service state and preserve work |

All API-driven Flutter screens must support loading, success, empty, error, and retry states.

## Security Checklist

Before staging:

- [ ] RLS is enabled on every exposed table.
- [ ] RLS policies are tested for all three roles.
- [ ] No service-role key exists in Flutter or Git.
- [ ] No provider secret exists in Flutter or Git.
- [ ] Storage buckets are private unless explicitly approved.
- [ ] Upload content types and sizes are restricted.
- [ ] Auth redirects use approved app links.
- [ ] Session logout removes local sensitive state.
- [ ] Edge Functions validate authentication and input.
- [ ] External calls have timeouts and safe retry limits.
- [ ] Audit logs exclude passwords, tokens, and secrets.
- [ ] Production projects use separate credentials from development.
- [ ] Database backups and retention policies are documented.

## Testing Checklist

### Supabase local

```bash
supabase start
supabase db reset
supabase test db
```

Test:

- Migration ordering.
- Seed data validity.
- RLS for each role.
- Spatial functions.
- Triggers and audit records.
- Storage policies.
- Realtime publication configuration.

### Edge Functions

Test:

- Authentication and authorization.
- Input validation.
- GIS provider failures.
- ML timeout and invalid response.
- Idempotent retries.
- Notification creation.
- Secret access only on the server.

### Flutter

Test:

- Auth state restoration.
- Role redirects.
- Repository mapping.
- Loading/error/empty states.
- Offline incident queue.
- Realtime subscription disposal.
- Notification deep links.
- Route recommendation display.

## Open Configuration Inputs

The following values must be selected before staging:

1. Supabase project references for development, staging, and production.
2. Supabase publishable keys for each environment.
3. GIS provider names and API contracts for tiles, geocoding, routing, and elevation.
4. GIS credentials and provider attribution/license requirements.
5. Python ML service URL, authentication, schema, timeout, and fallback policy.
6. Email sender/domain and redirect URLs.
7. Push notification/Firebase project configuration.
8. Storage file size and retention limits.
9. Data retention periods for weather, disasters, predictions, shipments, notifications, and audit logs.
10. Android application ID and iOS bundle identifier.

## First Implementation Order

1. Create the Supabase project and local CLI configuration.
2. Add migrations for extensions, enums, profiles, roles, locations, roads, routes, and incidents.
3. Add RLS helpers and role policies.
4. Add seed data based on the React demo constants.
5. Add Flutter Supabase initialization and auth repository.
6. Add profile/role loading and GoRouter guards.
7. Add repository contracts for routes, incidents, notifications, and shipments.
8. Add Realtime subscriptions for notifications and route/shipment status.
9. Add Edge Function stubs with typed contracts for GIS and ML.
10. Replace mock providers feature-by-feature after API contracts are approved.

## Definition of Connected

The backend connection is ready for staging when:

- A verified Supabase user can sign in and restore a session.
- The user's approved role is loaded from the database.
- Flutter role guards prevent unauthorized navigation.
- RLS tests pass for field, district, and control-room access.
- A field officer can create an incident with a restricted media upload.
- A district/control-room user can view only their permitted incident scope.
- Notifications and route/shipment changes arrive through scoped Realtime subscriptions.
- GIS calls occur through approved adapters or Edge Functions.
- ML predictions are requested through the Edge Function and stored with confidence/version metadata.
- Offline/local failures preserve user work and expose retry/sync status.
- No private secret is present in Flutter, migrations, seed data, or the repository.
