-- 0010: Risk Assessments, Accessibility Scores, Route Predictions, ML Models
-- Stores outputs from the ML inference pipeline and risk calculation Edge Functions.

-- ---------------------------------------------------------------------------
-- Per-route risk breakdown (output of calculate-route-risk Edge Function)
-- ---------------------------------------------------------------------------
create table public.route_risk_assessments (
  id                   uuid        primary key default extensions.uuid_generate_v4(),
  route_id             uuid        not null references public.routes (id) on delete cascade,
  weather_risk         double precision check (weather_risk between 0 and 100),
  flood_risk           double precision check (flood_risk between 0 and 100),
  landslide_risk       double precision check (landslide_risk between 0 and 100),
  road_condition_risk  double precision check (road_condition_risk between 0 and 100),
  traffic_risk         double precision check (traffic_risk between 0 and 100),
  disaster_risk        double precision check (disaster_risk between 0 and 100),
  total_risk_score     double precision check (total_risk_score between 0 and 100),
  confidence_score     double precision check (confidence_score between 0 and 1),
  model_version        text,
  calculated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Per-route accessibility breakdown
-- ---------------------------------------------------------------------------
create table public.accessibility_scores (
  id                      uuid        primary key default extensions.uuid_generate_v4(),
  route_id                uuid        not null references public.routes (id) on delete cascade,
  road_accessibility      double precision check (road_accessibility between 0 and 100),
  weather_accessibility   double precision check (weather_accessibility between 0 and 100),
  transport_accessibility double precision check (transport_accessibility between 0 and 100),
  infrastructure_score    double precision check (infrastructure_score between 0 and 100),
  overall_score           double precision check (overall_score between 0 and 100),
  calculated_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- AI / ML predictions shown in District and Control Room dashboards
-- ---------------------------------------------------------------------------
create table public.route_predictions (
  id               uuid                        primary key default extensions.uuid_generate_v4(),
  route_id         uuid                        references public.routes (id),
  prediction_type  public.prediction_type_enum not null,
  -- For disruption/delay predictions
  probability      double precision            check (probability between 0 and 100),
  confidence       double precision            check (confidence between 0 and 100),
  time_window      text,                                            -- 'Next 3 hrs', 'Next 6 hrs'
  -- For delay predictions
  affected_convoys integer,
  delay_estimate   text,
  cause            text,
  -- For route recommendations
  from_location    text,
  to_location      text,
  reason           text,
  benefit          text,
  -- For resource recommendations
  recommendation_text text,
  recommendation_sub  text,
  -- Shared
  factors          jsonb,                                           -- string array of contributing factors
  district         text,
  model_version    text,
  prediction_time  timestamptz                 not null default now(),
  created_at       timestamptz                 not null default now()
);

-- ---------------------------------------------------------------------------
-- Registered ML models (version tracking)
-- ---------------------------------------------------------------------------
create table public.ml_models (
  id               uuid                     primary key default extensions.uuid_generate_v4(),
  name             text                     not null,
  version          text                     not null,
  model_type       text,
  model_uri        text,
  accuracy         double precision,
  precision_score  double precision,
  recall_score     double precision,
  f1_score         double precision,
  training_dataset text,
  status           public.model_status_enum not null default 'training',
  created_at       timestamptz              not null default now(),
  unique (name, version)
);

comment on table public.route_predictions is
  'AI/ML predictions rendered in District AI Insights and Control Room AI Predictions screens.';
comment on column public.route_predictions.factors is
  'JSON array of factor strings, e.g. ["Heavy rain", "River level rising", "Soft shoulder"].';
