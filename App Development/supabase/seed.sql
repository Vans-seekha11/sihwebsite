-- =============================================================================
-- NER Logistics Seed Data
-- Development / Staging only. Never run against production.
-- Mirrors the mock data from the React website exactly so the UI
-- renders identically when connected to Supabase.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Demo users (auth.users + profiles + user_roles)
-- Passwords are generated randomly on every reset. No usable password is
-- committed; create local users through Auth or set a local-only password.
-- UUIDs are fixed so seed is deterministic and references are stable.
-- ---------------------------------------------------------------------------

-- Field Officer: A. Sangma  /  NER-FO-4471
insert into auth.users (
  id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, role, aud, instance_id
) values (
  '00000000-0000-0000-0000-000000000001',
  'a.sangma@ner.gov.in',
  crypt(gen_random_uuid()::text, gen_salt('bf')),
  now(), now(), now(),
  '{"full_name": "A. Sangma"}'::jsonb,
  'authenticated', 'authenticated',
  '00000000-0000-0000-0000-000000000000'
) on conflict (id) do nothing;

-- District Officer: R. Borah  /  NER-DO-2210
insert into auth.users (
  id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, role, aud, instance_id
) values (
  '00000000-0000-0000-0000-000000000002',
  'r.borah@kamrup.gov.in',
  crypt(gen_random_uuid()::text, gen_salt('bf')),
  now(), now(), now(),
  '{"full_name": "R. Borah"}'::jsonb,
  'authenticated', 'authenticated',
  '00000000-0000-0000-0000-000000000000'
) on conflict (id) do nothing;

-- Control Room Operator: S. Khongsdier  /  NER-CR-0007
insert into auth.users (
  id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, role, aud, instance_id
) values (
  '00000000-0000-0000-0000-000000000003',
  's.khongsdier@ner.gov.in',
  crypt(gen_random_uuid()::text, gen_salt('bf')),
  now(), now(), now(),
  '{"full_name": "S. Khongsdier"}'::jsonb,
  'authenticated', 'authenticated',
  '00000000-0000-0000-0000-000000000000'
) on conflict (id) do nothing;

-- Profiles (trigger should have created these; upsert to ensure correct data)
insert into public.profiles (id, full_name, officer_id, phone, organization, department, region, is_active) values
  ('00000000-0000-0000-0000-000000000001',
   'A. Sangma', 'NER-FO-4471', '+91 94365 00471',
   'NER Logistics Division', 'NER Logistics Division',
   'Ri Bhoi District, Meghalaya', true),
  ('00000000-0000-0000-0000-000000000002',
   'R. Borah', 'NER-DO-2281', null,
   'Kamrup Metro District Administration', 'Kamrup Metro District Administration',
   'Kamrup Metro, Assam', true),
  ('00000000-0000-0000-0000-000000000003',
   'S. Khongsdier', 'NER-CO-0012', null,
   'NER Regional Command Center', 'NER Regional Command Center',
   'North Eastern Region (8 States)', true)
on conflict (id) do update set
  full_name   = excluded.full_name,
  officer_id  = excluded.officer_id,
  phone       = excluded.phone,
  department  = excluded.department,
  region      = excluded.region,
  is_active   = excluded.is_active;

-- ---------------------------------------------------------------------------
-- Locations — NER districts and key depots
-- Coordinates are approximate centres for each district HQ.
-- ---------------------------------------------------------------------------
insert into public.locations (id, name, district, state, latitude, longitude,
  location, elevation, location_type) values
-- Assam
('10000000-0000-0000-0000-000000000001', 'Kamrup Metro', 'Kamrup Metro', 'Assam',
 26.1445, 91.7362, st_point(91.7362, 26.1445)::extensions.geography, 55, 'district_hq'),
('10000000-0000-0000-0000-000000000002', 'Barpeta', 'Barpeta', 'Assam',
 26.3227, 91.0053, st_point(91.0053, 26.3227)::extensions.geography, 45, 'district_hq'),
('10000000-0000-0000-0000-000000000003', 'Dibrugarh', 'Dibrugarh', 'Assam',
 27.4728, 94.9120, st_point(94.9120, 27.4728)::extensions.geography, 108, 'district_hq'),
('10000000-0000-0000-0000-000000000004', 'Cachar', 'Cachar', 'Assam',
 24.8333, 92.7789, st_point(92.7789, 24.8333)::extensions.geography, 25, 'district_hq'),
-- Nagaland
('10000000-0000-0000-0000-000000000005', 'Dimapur', 'Dimapur', 'Nagaland',
 25.9099, 93.7267, st_point(93.7267, 25.9099)::extensions.geography, 232, 'district_hq'),
('10000000-0000-0000-0000-000000000006', 'Kohima', 'Kohima', 'Nagaland',
 25.6747, 94.1086, st_point(94.1086, 25.6747)::extensions.geography, 1444, 'district_hq'),
-- Manipur
('10000000-0000-0000-0000-000000000007', 'Imphal West', 'Imphal West', 'Manipur',
 24.8170, 93.9368, st_point(93.9368, 24.8170)::extensions.geography, 786, 'district_hq'),
-- Meghalaya
('10000000-0000-0000-0000-000000000008', 'East Khasi Hills', 'East Khasi Hills', 'Meghalaya',
 25.5788, 91.8933, st_point(91.8933, 25.5788)::extensions.geography, 1496, 'district_hq'),
('10000000-0000-0000-0000-000000000009', 'Ri Bhoi', 'Ri Bhoi', 'Meghalaya',
 25.9300, 92.0200, st_point(92.0200, 25.9300)::extensions.geography, 920, 'district_hq'),
-- Mizoram
('10000000-0000-0000-0000-000000000010', 'Aizawl', 'Aizawl', 'Mizoram',
 23.7307, 92.7173, st_point(92.7173, 23.7307)::extensions.geography, 1132, 'district_hq'),
-- Arunachal Pradesh
('10000000-0000-0000-0000-000000000011', 'Tawang', 'Tawang', 'Arunachal Pradesh',
 27.5860, 91.8594, st_point(91.8594, 27.5860)::extensions.geography, 3048, 'district_hq'),
-- Sikkim
('10000000-0000-0000-0000-000000000012', 'East Sikkim', 'East Sikkim', 'Sikkim',
 27.3389, 88.6065, st_point(88.6065, 27.3389)::extensions.geography, 1650, 'district_hq'),
-- Tripura
('10000000-0000-0000-0000-000000000013', 'West Tripura', 'West Tripura', 'Tripura',
 23.8315, 91.2868, st_point(91.2868, 23.8315)::extensions.geography, 15, 'district_hq'),
-- NER Command
('10000000-0000-0000-0000-000000000014', 'NER Regional Command', null, null,
 26.1445, 91.7362, st_point(91.7362, 26.1445)::extensions.geography, 55, 'depot'),
-- Sonapur (field officer destination in demo trip)
('10000000-0000-0000-0000-000000000015', 'Sonapur', 'Kamrup Metro', 'Assam',
 26.1553, 91.9019, st_point(91.9019, 26.1553)::extensions.geography, 58, 'town')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- User Roles
-- ---------------------------------------------------------------------------
insert into public.user_roles (id, user_id, role, district_id, is_active) values
  ('20000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'field_officer',
   '10000000-0000-0000-0000-000000000009',   -- Ri Bhoi / Dimapur operational area
  true),
  ('20000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000002',
   'district_officer',
   '10000000-0000-0000-0000-000000000001',   -- Kamrup Metro
  true),
  ('20000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000003',
   'control_room',
   null,
  true)
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- Transport Modes
-- ---------------------------------------------------------------------------
insert into public.transport_modes (id, name, capacity_kg, description, is_active) values
  ('30000000-0000-0000-0000-000000000001', 'truck',       10000, 'Heavy goods vehicle', true),
  ('30000000-0000-0000-0000-000000000002', 'light_truck',  3000, 'Light commercial vehicle', true),
  ('30000000-0000-0000-0000-000000000003', 'helicopter',    500, 'Emergency air delivery', true),
  ('30000000-0000-0000-0000-000000000004', 'boat',         2000, 'River/waterway transport', true),
  ('30000000-0000-0000-0000-000000000005', 'train',       50000, 'Rail freight', true)
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- Roads — key NHs in NER matching the app's route list
-- ---------------------------------------------------------------------------
insert into public.roads (id, road_number, road_name, road_type, state,
  source_location_id, destination_location_id,
  length_km, condition_score, accessibility_score, is_active) values
('40000000-0000-0000-0000-000000000001', 'NH-27', 'East-West Corridor',
 'national_highway', 'Assam',
 '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003',
 92, 45, 42, true),
('40000000-0000-0000-0000-000000000002', 'NH-2', 'Assam-Meghalaya Link',
 'national_highway', 'Assam',
 '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008',
 120, 72, 68, true),
('40000000-0000-0000-0000-000000000003', 'NH-37', 'Assam-Nagaland Corridor',
 'national_highway', 'Assam',
 '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005',
 84, 60, 58, true),
('40000000-0000-0000-0000-000000000004', 'NH-39', 'Imphal Road',
 'national_highway', 'Nagaland',
 '10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000007',
 215, 55, 52, true),
('40000000-0000-0000-0000-000000000005', 'NH-53', 'Silchar-Jiribam Road',
 'national_highway', 'Assam',
 '10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000007',
 187, 40, 38, true),
('40000000-0000-0000-0000-000000000006', 'NH-44', 'Guwahati-Shillong Road',
 'national_highway', 'Assam',
 '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008',
 105, 78, 75, true),
('40000000-0000-0000-0000-000000000007', 'NH-10', 'Sikkim Corridor',
 'national_highway', 'Sikkim',
 '10000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001',
 164, 65, 62, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Routes — mirrors DROUTES / ROUTE_ROWS in the React app
-- ---------------------------------------------------------------------------
insert into public.routes (id, route_number, name, state, district,
  source_location_id, destination_location_id,
  distance_km, estimated_time_minutes,
  risk_score, accessibility_score, reliability_score,
  route_status, weather_summary, current_eta, current_delay, updated_at) values
('50000000-0000-0000-0000-000000000001', 'NH-27', 'NH-27 East-West Corridor', 'Assam', 'Kamrup Metro',
 '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003',
 92, 180, 78, 42, 35, 'blocked',
 'Heavy rain + flooding', '14:30', '+2h 15m', now() - interval '8 minutes'),

('50000000-0000-0000-0000-000000000002', 'NH-2', 'NH-2 Assam–Meghalaya', 'Assam', 'Kamrup Metro',
 '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008',
 120, 210, 55, 68, 72, 'restricted',
 'Moderate rain', '15:45', '+45m', now() - interval '15 minutes'),

('50000000-0000-0000-0000-000000000003', 'NH-37', 'NH-37 Assam–Nagaland', 'Assam', 'Kamrup Metro',
 '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005',
 84, 150, 45, 74, 80, 'open',
 'Overcast', '13:15', 'On time', now() - interval '5 minutes'),

('50000000-0000-0000-0000-000000000004', 'NH-39', 'NH-39 Nagaland–Manipur', 'Nagaland', 'Dimapur',
 '10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000007',
 215, 420, 62, 52, 60, 'restricted',
 'Landslide warning', '18:00', '+1h 30m', now() - interval '12 minutes'),

('50000000-0000-0000-0000-000000000005', 'NH-53', 'NH-53 Silchar–Jiribam', 'Assam', 'Cachar',
 '10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000007',
 187, 360, 85, 38, 28, 'closed',
 'Severe flooding', '—', '+6h+', now() - interval '3 minutes'),

('50000000-0000-0000-0000-000000000006', 'NH-44', 'NH-44 Guwahati–Shillong', 'Assam', 'Kamrup Metro',
 '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008',
 105, 180, 28, 86, 91, 'open',
 'Clear skies', '12:30', 'On time', now() - interval '2 minutes'),

('50000000-0000-0000-0000-000000000007', 'NH-10', 'NH-10 Sikkim Corridor', 'Sikkim', 'East Sikkim',
 '10000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001',
 164, 300, 58, 62, 70, 'restricted',
 'Fog + low visibility', '16:15', '+50m', now() - interval '20 minutes')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Route Risk Assessments
-- ---------------------------------------------------------------------------
insert into public.route_risk_assessments
  (route_id, weather_risk, flood_risk, landslide_risk, road_condition_risk,
   traffic_risk, disaster_risk, total_risk_score, confidence_score, model_version) values
('50000000-0000-0000-0000-000000000001', 82, 90, 45, 70, 30, 85, 78, 0.87, 'v2.1'),
('50000000-0000-0000-0000-000000000002', 50, 40, 30, 45, 25, 35, 55, 0.82, 'v2.1'),
('50000000-0000-0000-0000-000000000003', 30, 20, 25, 40, 20, 15, 45, 0.90, 'v2.1'),
('50000000-0000-0000-0000-000000000004', 55, 30, 75, 55, 20, 50, 62, 0.78, 'v2.1'),
('50000000-0000-0000-0000-000000000005', 90, 95, 60, 80, 15, 90, 85, 0.92, 'v2.1'),
('50000000-0000-0000-0000-000000000006', 15, 10, 10, 20, 30, 10, 28, 0.95, 'v2.1'),
('50000000-0000-0000-0000-000000000007', 60, 25, 50, 45, 20, 40, 58, 0.80, 'v2.1');

-- ---------------------------------------------------------------------------
-- Accessibility Scores
-- ---------------------------------------------------------------------------
insert into public.accessibility_scores
  (route_id, road_accessibility, weather_accessibility, transport_accessibility,
   infrastructure_score, overall_score) values
('50000000-0000-0000-0000-000000000001', 40, 22, 55, 48, 42),
('50000000-0000-0000-0000-000000000002', 70, 62, 72, 68, 68),
('50000000-0000-0000-0000-000000000003', 78, 72, 75, 70, 74),
('50000000-0000-0000-0000-000000000004', 55, 50, 58, 44, 52),
('50000000-0000-0000-0000-000000000005', 35, 20, 42, 38, 38),
('50000000-0000-0000-0000-000000000006', 90, 88, 85, 82, 86),
('50000000-0000-0000-0000-000000000007', 65, 60, 68, 58, 62);

-- ---------------------------------------------------------------------------
-- Road Incidents — mirrors INCIDENTS in DistrictOfficerApp + ControlRoomApp
-- ---------------------------------------------------------------------------
insert into public.road_incidents
  (id, incident_ref, reported_by, route_id, location_id,
   category, title, description, severity, district, state,
   status, verified, assigned_to, created_at, updated_at) values
-- INC-2026-041: Flash Flood on NH-27
('60000000-0000-0000-0000-000000000001', 'INC-2026-041',
 '00000000-0000-0000-0000-000000000001',
 '50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
 'flood', 'Flash Flood — Chaygaon Area', 'NH-27 submerged near km 42. Water level rising.',
 'critical', 'Kamrup Metro', 'Assam',
 'active', true, '00000000-0000-0000-0000-000000000002',
 now() - interval '2 hours', now() - interval '10 minutes'),

-- INC-2026-039: Convoy At Risk NH-2
('60000000-0000-0000-0000-000000000002', 'INC-2026-039',
 '00000000-0000-0000-0000-000000000001',
 '50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
 'road_block', 'Convoy At Risk — NH-2 Km 78', 'Medical convoy LG-102 stopped at debris field.',
 'high', 'Kamrup Metro', 'Assam',
 'active', true, '00000000-0000-0000-0000-000000000002',
 now() - interval '3 hours', now() - interval '30 minutes'),

-- INC-2026-038: Bridge Damage NH-37
('60000000-0000-0000-0000-000000000003', 'INC-2026-038',
 '00000000-0000-0000-0000-000000000001',
 '50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005',
 'bridge_damage', 'Bridge Structural Damage — NH-37', 'Sarupathar bridge: cracks in central span. Load limit imposed.',
 'critical', 'Golaghat', 'Assam',
 'escalated', false, '00000000-0000-0000-0000-000000000002',
 now() - interval '5 hours', now() - interval '1 hour'),

-- INC-2026-037: Landslide NH-39
('60000000-0000-0000-0000-000000000004', 'INC-2026-037',
 '00000000-0000-0000-0000-000000000001',
 '50000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006',
 'landslide', 'Landslide — NH-39 Km 112', '200m of carriageway buried. Clearing in progress.',
 'critical', 'Kohima', 'Nagaland',
 'active', true, '00000000-0000-0000-0000-000000000002',
 now() - interval '4 hours', now() - interval '45 minutes'),

-- INC-2026-035: Road Blockage NH-53
('60000000-0000-0000-0000-000000000005', 'INC-2026-035',
 '00000000-0000-0000-0000-000000000001',
 '50000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004',
 'road_block', 'Road Blockage — NH-53 Km 55', 'Multiple trees across road after cyclonic wind.',
 'high', 'Cachar', 'Assam',
 'pending', false, null,
 now() - interval '1 hour', now() - interval '20 minutes'),

-- INC-2026-033: Waterlogging NH-44
('60000000-0000-0000-0000-000000000006', 'INC-2026-033',
 '00000000-0000-0000-0000-000000000001',
 '50000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001',
 'flood', 'Waterlogging — NH-44 Km 18', 'Drainage overflow. Passable with caution.',
 'medium', 'Kamrup Metro', 'Assam',
 'pending', false, null,
 now() - interval '30 minutes', now() - interval '10 minutes'),

-- INC-2026-031: Fallen Tree NH-10
('60000000-0000-0000-0000-000000000007', 'INC-2026-031',
 '00000000-0000-0000-0000-000000000001',
 '50000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000012',
 'road_block', 'Fallen Tree — NH-10 Km 34', 'Large tree blocking one lane. Traffic moving on alternate.',
 'low', 'East Sikkim', 'Sikkim',
 'resolved', true, '00000000-0000-0000-0000-000000000002',
 now() - interval '6 hours', now() - interval '2 hours')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Shipments — mirrors VEHICLES / LOGISTICS_DATA / FLEET in React app
-- ---------------------------------------------------------------------------
insert into public.shipments
  (id, shipment_number, route_id, transport_mode_id,
   cargo_description, cargo_weight_kg,
   origin_location_id, dest_location_id,
   current_location_text, risk_level, status,
   departure_time, estimated_arrival, delay_description, updated_at) values
('70000000-0000-0000-0000-000000000001', 'LG-102',
 '50000000-0000-0000-0000-000000000002',
 '30000000-0000-0000-0000-000000000001',
 'Medical supplies', 2400,
 '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007',
 'Nongpoh, Ri Bhoi – NH-2 Km 78', 'high', 'delayed',
 now() - interval '3 hours', now() + interval '2 hours', '+1h 20m',
 now() - interval '15 minutes'),

('70000000-0000-0000-0000-000000000002', 'LG-108',
 '50000000-0000-0000-0000-000000000003',
 '30000000-0000-0000-0000-000000000001',
 'Relief kits', 3200,
 '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005',
 'Morigaon – NH-37 Km 42', 'medium', 'in_transit',
 now() - interval '2 hours', now() + interval '1 hour 30 minutes', 'On time',
 now() - interval '5 minutes'),

('70000000-0000-0000-0000-000000000003', 'LG-115',
 '50000000-0000-0000-0000-000000000004',
 '30000000-0000-0000-0000-000000000002',
 'Food rations', 1800,
 '10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000007',
 'Senapati – NH-39 Km 88', 'critical', 'at_risk',
 now() - interval '5 hours', now() + interval '4 hours', '+2h 40m',
 now() - interval '8 minutes'),

('70000000-0000-0000-0000-000000000004', 'LG-119',
 '50000000-0000-0000-0000-000000000006',
 '30000000-0000-0000-0000-000000000001',
 'Engineering equipment', 6500,
 '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008',
 'Jorabat – NH-44 Km 15', 'low', 'in_transit',
 now() - interval '1 hour', now() + interval '2 hours 30 minutes', 'On time',
 now() - interval '3 minutes'),

('70000000-0000-0000-0000-000000000005', 'LG-121',
 '50000000-0000-0000-0000-000000000005',
 '30000000-0000-0000-0000-000000000001',
 'Construction material', 9000,
 '10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000007',
 'Jiribam – NH-53 Km 55 (stopped)', 'critical', 'stopped',
 now() - interval '6 hours', now() + interval '8 hours', '+6h+',
 now() - interval '2 minutes'),

('70000000-0000-0000-0000-000000000006', 'TRK-1042',
 '50000000-0000-0000-0000-000000000001',
 '30000000-0000-0000-0000-000000000001',
 'Disaster relief supplies', 4200,
 '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003',
 'Nagaon – NH-27 Km 120 (rerouting)', 'high', 'at_risk',
 now() - interval '4 hours', now() + interval '5 hours', '+3h 00m',
 now() - interval '10 minutes')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Tasks — mirrors INITIAL_TASKS (field) + TASKS (district) in React app
-- ---------------------------------------------------------------------------
insert into public.tasks
  (id, task_ref, title, location_text, route_id, incident_id,
   assigned_to, created_by, district, priority, status,
   accepted_at, deadline, created_at) values
-- Field Officer tasks (MyTasksScreen INITIAL_TASKS)
('80000000-0000-0000-0000-000000000001', 'TSK-001',
 'Inspect NH-27 Km 42 flood damage', 'NH-27, Km 42 Chaygaon',
 '50000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
 'Kamrup Metro', 'critical', 'in_progress',
 now() - interval '1 hour',
 now() + interval '2 hours',
 now() - interval '3 hours'),

('80000000-0000-0000-0000-000000000002', 'TSK-002',
 'Guide LG-102 medical convoy reroute', 'NH-2, Nongpoh area',
 '50000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
 'Ri Bhoi', 'critical', 'pending',
 null,
 now() + interval '1 hour',
 now() - interval '2 hours'),

('80000000-0000-0000-0000-000000000003', 'TSK-003',
 'Photograph Sarupathar bridge damage', 'NH-37, Sarupathar Bridge',
 '50000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
 'Golaghat', 'high', 'pending',
 null,
 now() + interval '4 hours',
 now() - interval '1 hour'),

('80000000-0000-0000-0000-000000000004', 'TSK-004',
 'Clear debris on NH-53 Km 55', 'NH-53, Km 55',
 '50000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
 'Cachar', 'high', 'pending',
 null,
 now() + interval '6 hours',
 now() - interval '30 minutes'),

('80000000-0000-0000-0000-000000000005', 'TSK-005',
 'Conduct route survey Guwahati–Sonapur', 'Guwahati–Sonapur sector',
 '50000000-0000-0000-0000-000000000006', null,
 '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
 'Kamrup Metro', 'medium', 'completed',
 now() - interval '4 hours',
 now() - interval '1 hour',
 now() - interval '8 hours'),

('80000000-0000-0000-0000-000000000006', 'TSK-006',
 'Verify waterlogging report NH-44 Km 18', 'NH-44, Km 18',
 '50000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
 'Kamrup Metro', 'medium', 'overdue',
 null,
 now() - interval '2 hours',
 now() - interval '5 hours'),

('80000000-0000-0000-0000-000000000007', 'TSK-007',
 'Distribute emergency kits — Dimapur depot', 'Dimapur District Depot',
 null, null,
 '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
 'Dimapur', 'low', 'pending',
 null,
 now() + interval '24 hours',
 now() - interval '2 hours'),

('80000000-0000-0000-0000-000000000008', 'TSK-008',
 'File daily activity report', 'Field — Any location',
 null, null,
 '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
 'Ri Bhoi', 'low', 'pending',
 null,
 now() + interval '10 hours',
 now() - interval '1 hour'),

-- District Officer tasks (TASKS in DistrictOfficerApp)
('80000000-0000-0000-0000-000000000009', 'TSK-0891',
 'Deploy response team to NH-27 Km 42', 'NH-27, Chaygaon',
 '50000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001',
 null, '00000000-0000-0000-0000-000000000002',
 'Kamrup Metro', 'critical', 'new',
 null,
 now() + interval '3 hours',
 now() - interval '1 hour'),

('80000000-0000-0000-0000-000000000010', 'TSK-0892',
 'Coordinate LG-102 medical convoy reroute', 'NH-2, Nongpoh',
 '50000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
 'Kamrup Metro', 'critical', 'in_progress',
 now() - interval '30 minutes',
 now() + interval '1 hour',
 now() - interval '2 hours'),

('80000000-0000-0000-0000-000000000011', 'TSK-0893',
 'Structural assessment Sarupathar Bridge', 'NH-37 Bridge',
 '50000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000003',
 null, '00000000-0000-0000-0000-000000000002',
 'Golaghat', 'high', 'escalated',
 null,
 now() + interval '2 hours',
 now() - interval '4 hours'),

('80000000-0000-0000-0000-000000000012', 'TSK-0894',
 'Update logistics ETA for NH-39 convoy', 'NH-39, Senapati',
 '50000000-0000-0000-0000-000000000004', null,
 null, '00000000-0000-0000-0000-000000000002',
 'Kohima', 'medium', 'new',
 null,
 now() + interval '5 hours',
 now() - interval '1 hour'),

('80000000-0000-0000-0000-000000000013', 'TSK-0895',
 'Generate daily district situation report', 'Kamrup Metro HQ',
 null, null,
 '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
 'Kamrup Metro', 'low', 'completed',
 now() - interval '3 hours',
 now() - interval '30 minutes',
 now() - interval '8 hours')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Alerts — mirrors ALERTS in AlertsScreen (field) + district/control room
-- ---------------------------------------------------------------------------
insert into public.alerts
  (id, alert_ref, severity, title, description,
   location_text, route_id, incident_id,
   source, distance_text, action_text,
   district, state, target_role, status, created_at) values
('90000000-0000-0000-0000-000000000001', 'ALT-001',
 'critical', 'Flash Flood Alert — NH-27 Km 42',
 'NH-27 submerged near Chaygaon. Avoid the segment. Emergency services deployed.',
 'NH-27, Km 42, Chaygaon',
 '50000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001',
 'Sensor + Citizen SMS', '5 km ahead', 'Reroute via NH-37',
 'Kamrup Metro', 'Assam', null, 'active',
 now() - interval '2 hours'),

('90000000-0000-0000-0000-000000000002', 'ALT-002',
 'critical', 'Convoy LG-102 At Risk',
 'Medical convoy stopped due to debris. Immediate assistance required.',
 'NH-2, Nongpoh, Km 78',
 '50000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002',
 'Fleet system', '12 km ahead', 'Dispatch support team',
 'Ri Bhoi', 'Meghalaya', null, 'active',
 now() - interval '3 hours'),

('90000000-0000-0000-0000-000000000003', 'ALT-003',
 'high', 'Landslide Warning — NH-39',
 'Geo-sensor reports slope instability near Km 112. High probability in next 3 hrs.',
 'NH-39, Senapati area',
 '50000000-0000-0000-0000-000000000004', null,
 'AI model', '35 km ahead', 'Monitor and prepare alternate route',
 'Senapati', 'Manipur', null, 'active',
 now() - interval '1 hour'),

('90000000-0000-0000-0000-000000000004', 'ALT-004',
 'high', 'Bridge Load Restriction — NH-37',
 'Sarupathar bridge: structural cracks detected. Max load 10 tonnes until assessed.',
 'NH-37, Sarupathar',
 '50000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000003',
 'Field officer', 'Field update', 'Apply load restriction immediately',
 'Golaghat', 'Assam', null, 'active',
 now() - interval '5 hours'),

('90000000-0000-0000-0000-000000000005', 'ALT-005',
 'moderate', 'Road Closure — NH-53',
 'NH-53 fully closed due to flooding near Jiribam. All convoys halted.',
 'NH-53, Jiribam area',
 '50000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000005',
 'District', 'District', 'Use air/river alternatives',
 'Cachar', 'Assam', null, 'active',
 now() - interval '4 hours'),

('90000000-0000-0000-0000-000000000006', 'ALT-006',
 'moderate', 'Weather Advisory — Heavy Rain Next 6 Hours',
 'IMD forecast: 80mm+ rainfall expected across Kamrup, Ri Bhoi, and Cachar.',
 'Regional',
 null, null,
 'IMD Weather', 'System', 'Delay non-critical logistics',
 null, null, null, 'active',
 now() - interval '30 minutes'),

('90000000-0000-0000-0000-000000000007', 'ALT-007',
 'info', 'Route NH-44 Cleared — Normal Operations',
 'Waterlogging on NH-44 Km 18 cleared. Route open for all vehicle classes.',
 'NH-44, Km 18',
 '50000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000006',
 'System', 'System', 'Resume normal operations',
 'Kamrup Metro', 'Assam', null, 'resolved',
 now() - interval '1 hour')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- AI Route Predictions — mirrors RISK_PREDS + district/control room AI screens
-- ---------------------------------------------------------------------------
insert into public.route_predictions
  (route_id, prediction_type, probability, confidence, time_window,
   affected_convoys, delay_estimate, cause,
   from_location, to_location, reason, benefit,
   recommendation_text, recommendation_sub,
   factors, district, model_version, prediction_time) values
-- Disruption predictions (Risk Preds in DistrictOfficerApp)
('50000000-0000-0000-0000-000000000001', 'disruption',
 87, 91, 'Next 3 hrs',
 null, null, null, null, null, null, null, null, null,
 '["Heavy rain", "River level rising", "NH-27 drainage at capacity"]'::jsonb,
 'Kamrup Metro', 'v2.1', now()),

('50000000-0000-0000-0000-000000000004', 'disruption',
 74, 85, 'Next 6 hrs',
 null, null, null, null, null, null, null, null, null,
 '["Landslide probability", "Soft soil", "Monsoon saturation"]'::jsonb,
 'Senapati', 'v2.1', now()),

('50000000-0000-0000-0000-000000000005', 'disruption',
 95, 97, 'Next 1 hr',
 null, null, null, null, null, null, null, null, null,
 '["Active flooding", "Road submerged", "Rising water table"]'::jsonb,
 'Cachar', 'v2.1', now()),

-- Delay predictions
('50000000-0000-0000-0000-000000000002', 'delay',
 72, 83, 'Next 4 hrs',
 3, '+1h 30m', 'Medical convoy blocked by debris',
 null, null, null, null, null, null,
 '["Debris blockage", "Slow clearance", "Weather deteriorating"]'::jsonb,
 'Ri Bhoi', 'v2.1', now()),

('50000000-0000-0000-0000-000000000004', 'delay',
 68, 79, 'Next 8 hrs',
 2, '+2h 45m', 'Landslide risk causing precautionary halts',
 null, null, null, null, null, null,
 '["Active landslide warning", "Precautionary halt", "Single-lane clearance"]'::jsonb,
 'Kohima', 'v2.1', now()),

-- Route recommendations
(null, 'route_recommendation',
 null, 88, null,
 null, null, null,
 'Guwahati', 'Dimapur',
 'NH-37 has lower flood risk and better road condition than NH-27',
 '~40% lower risk score, saves 35 minutes',
 null, null,
 '["Lower landslide risk", "Better road condition", "No active incidents"]'::jsonb,
 'Kamrup Metro', 'v2.1', now()),

(null, 'route_recommendation',
 null, 82, null,
 null, null, null,
 'Silchar', 'Imphal',
 'Air transport recommended: NH-53 fully closed',
 'Helicopter alternative saves 6+ hours',
 null, null,
 '["NH-53 closed", "Flooding severe", "No road alternative available"]'::jsonb,
 'Cachar', 'v2.1', now()),

-- Resource recommendations
(null, 'resource',
 null, null, null,
 null, null, null,
 null, null, null, null,
 'Pre-position emergency response team at Nongpoh (Ri Bhoi)',
 'Convoy LG-102 at risk; response team needed within 2 hrs',
 null, 'Ri Bhoi', 'v2.1', now()),

(null, 'resource',
 null, null, null,
 null, null, null,
 null, null, null, null,
 'Dispatch NDRF team to NH-53 Jiribam flooding',
 'Flood depth >1.5m; standard vehicles cannot proceed',
 null, 'Cachar', 'v2.1', now()),

(null, 'resource',
 null, null, null,
 null, null, null,
 null, null, null, null,
 'Activate standby helicopter for Tawang corridor',
 'Road cut-off likely in next 24 hrs due to snowfall forecast',
 null, 'Tawang', 'v2.1', now());

-- ---------------------------------------------------------------------------
-- Demo trip (field officer active trip)
-- ---------------------------------------------------------------------------
insert into public.shipments
  (id, shipment_number, route_id, transport_mode_id,
   cargo_description, cargo_weight_kg,
   origin_location_id, dest_location_id,
   current_location_text, risk_level, status,
   departure_time, estimated_arrival, updated_at)
values
  ('70000000-0000-0000-0000-000000000010', 'TRP-2291',
   '50000000-0000-0000-0000-000000000006',
   '30000000-0000-0000-0000-000000000001',
   'P1 Medical Priority', 500,
   '10000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000015',
   'En route Guwahati → Sonapur via NH-44', 'low', 'in_transit',
   now() - interval '1 hour', now() + interval '45 minutes',
   now() - interval '5 minutes')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Weather data sample
-- ---------------------------------------------------------------------------
insert into public.weather_data
  (location_id, recorded_at, temperature_c, humidity_percent, rainfall_mm,
   wind_speed_kmph, visibility_km, weather_condition, source) values
('10000000-0000-0000-0000-000000000001', now() - interval '1 hour',
 28, 91, 42, 35, 3.2, 'Heavy Rain', 'IMD'),
('10000000-0000-0000-0000-000000000005', now() - interval '1 hour',
 24, 85, 18, 22, 6.0, 'Moderate Rain', 'IMD'),
('10000000-0000-0000-0000-000000000007', now() - interval '1 hour',
 22, 88, 8, 15, 8.5, 'Overcast', 'IMD'),
('10000000-0000-0000-0000-000000000008', now() - interval '1 hour',
 18, 78, 55, 40, 1.5, 'Heavy Rain', 'IMD'),
('10000000-0000-0000-0000-000000000012', now() - interval '1 hour',
 12, 72, 0, 28, 4.0, 'Fog', 'IMD');

-- ---------------------------------------------------------------------------
-- Disaster Events
-- ---------------------------------------------------------------------------
insert into public.disaster_events
  (id, type, severity, title, description, location_id, route_id,
   started_at, probability, source, verified, district, state) values
('a0000000-0000-0000-0000-000000000001', 'flash_flood', 5,
 'Flash Flood — Chaygaon / NH-27',
 'Rapid onset flooding due to Brahmaputra tributary overflow.',
 '10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001',
 now() - interval '3 hours', 0.92, 'CWC + Field Report', true, 'Kamrup Metro', 'Assam'),

('a0000000-0000-0000-0000-000000000002', 'landslide', 4,
 'Landslide Risk — NH-39 Senapati',
 'GSI sensor alert: slope instability above NH-39 km 112.',
 '10000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000004',
 now() - interval '1 hour', 0.74, 'GSI Sensor', false, 'Senapati', 'Manipur'),

('a0000000-0000-0000-0000-000000000003', 'flood', 5,
 'Severe Flooding — NH-53 Jiribam',
 'NH-53 fully inundated. Road closed indefinitely.',
 '10000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000005',
 now() - interval '5 hours', 0.99, 'NDRF + Field Report', true, 'Cachar', 'Assam')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Data Sources
-- ---------------------------------------------------------------------------
insert into public.data_sources (name, type, provider, is_active) values
  ('IMD Weather', 'weather', 'India Meteorological Department', true),
  ('CWC Flood', 'disaster', 'Central Water Commission', true),
  ('GSI Landslide', 'disaster', 'Geological Survey of India', true),
  ('NDRF Reports', 'disaster', 'National Disaster Response Force', true),
  ('OpenStreetMap', 'gis', 'OSM / Mapbox', true),
  ('ML Inference Service', 'ml', 'Internal Python Service', true)
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- ML Models registry
-- ---------------------------------------------------------------------------
insert into public.ml_models (name, version, model_type, accuracy, status) values
  ('Route Risk Predictor', 'v2.1', 'gradient_boosting', 0.89, 'active'),
  ('Flood Risk Classifier', 'v1.4', 'random_forest', 0.92, 'active'),
  ('Landslide Probability', 'v1.2', 'neural_network', 0.85, 'active'),
  ('Logistics Delay ETA', 'v1.0', 'xgboost', 0.83, 'active')
on conflict (name, version) do nothing;
