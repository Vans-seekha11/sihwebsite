-- 0015: Spatial and Performance Indexes

-- ---------------------------------------------------------------------------
-- PostGIS spatial indexes (GiST)
-- ---------------------------------------------------------------------------
create index locations_location_gist_idx
  on public.locations using gist (location);

create index roads_geometry_gist_idx
  on public.roads using gist (geometry);

create index routes_geometry_gist_idx
  on public.routes using gist (geometry);

create index incidents_geometry_gist_idx
  on public.road_incidents using gist (geometry);

create index disasters_geometry_gist_idx
  on public.disaster_events using gist (geometry);

create index shipments_location_gist_idx
  on public.shipments using gist (current_location);

-- ---------------------------------------------------------------------------
-- B-tree indexes for common filter columns
-- ---------------------------------------------------------------------------

-- profiles
create index profiles_officer_id_idx         on public.profiles (officer_id);
create index profiles_is_active_idx          on public.profiles (is_active);

-- user_roles
create index user_roles_user_id_idx          on public.user_roles (user_id);
create index user_roles_role_idx             on public.user_roles (role);
create index user_roles_district_id_idx      on public.user_roles (district_id);

-- locations
create index locations_district_idx          on public.locations (district);
create index locations_state_idx             on public.locations (state);

-- roads
create index roads_road_number_idx           on public.roads (road_number);
create index roads_is_active_idx             on public.roads (is_active);
create index roads_state_idx                 on public.roads (state);

-- routes
create index routes_route_number_idx         on public.routes (route_number);
create index routes_route_status_idx         on public.routes (route_status);
create index routes_state_idx                on public.routes (state);
create index routes_updated_at_idx           on public.routes (updated_at desc);

-- road_incidents
create index incidents_reported_by_idx       on public.road_incidents (reported_by);
create index incidents_assigned_to_idx       on public.road_incidents (assigned_to);
create index incidents_status_idx            on public.road_incidents (status);
create index incidents_severity_idx          on public.road_incidents (severity);
create index incidents_district_idx          on public.road_incidents (district);
create index incidents_route_id_idx          on public.road_incidents (route_id);
create index incidents_created_at_idx        on public.road_incidents (created_at desc);

-- tasks
create index tasks_assigned_to_idx           on public.tasks (assigned_to);
create index tasks_status_idx                on public.tasks (status);
create index tasks_priority_idx              on public.tasks (priority);
create index tasks_district_idx              on public.tasks (district);
create index tasks_deadline_idx              on public.tasks (deadline);

-- alerts
create index alerts_severity_idx             on public.alerts (severity);
create index alerts_status_idx               on public.alerts (status);
create index alerts_target_role_idx          on public.alerts (target_role);
create index alerts_district_idx             on public.alerts (district);
create index alerts_created_at_idx           on public.alerts (created_at desc);

-- notifications
create index notifications_user_id_idx       on public.notifications (user_id);
create index notifications_is_read_idx       on public.notifications (is_read);
create index notifications_created_at_idx    on public.notifications (created_at desc);

-- shipments
create index shipments_status_idx            on public.shipments (status);
create index shipments_risk_level_idx        on public.shipments (risk_level);
create index shipments_route_id_idx          on public.shipments (route_id);
create index shipments_updated_at_idx        on public.shipments (updated_at desc);

-- weather_data
create index weather_location_id_idx         on public.weather_data (location_id);
create index weather_recorded_at_idx         on public.weather_data (recorded_at desc);

-- disaster_events
create index disasters_type_idx              on public.disaster_events (type);
create index disasters_ended_at_idx          on public.disaster_events (ended_at);
create index disasters_district_idx          on public.disaster_events (district);

-- route_risk_assessments
create index rra_route_id_idx                on public.route_risk_assessments (route_id);
create index rra_calculated_at_idx           on public.route_risk_assessments (calculated_at desc);

-- route_predictions
create index predictions_route_id_idx        on public.route_predictions (route_id);
create index predictions_type_idx            on public.route_predictions (prediction_type);
create index predictions_time_idx            on public.route_predictions (prediction_time desc);

-- audit_logs
create index audit_user_id_idx               on public.audit_logs (user_id);
create index audit_entity_type_idx           on public.audit_logs (entity_type);
create index audit_entity_id_idx             on public.audit_logs (entity_id);
create index audit_created_at_idx            on public.audit_logs (created_at desc);
