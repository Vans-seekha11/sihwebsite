-- 0016: Realtime Publication Configuration
-- Enable Realtime only for tables that require live updates.
-- Clients must subscribe with scoped filters (by user_id, district, route_id, etc.)
-- Never subscribe all clients to all changes.

-- Drop the existing supabase_realtime publication if it exists (safe to recreate)
drop publication if exists supabase_realtime;

-- Create publication covering only the tables that need live updates
create publication supabase_realtime for table
  public.shipments,
  public.road_incidents,
  public.disaster_events,
  public.notifications,
  public.routes,
  public.alerts,
  public.tasks;

comment on publication supabase_realtime is
  'Realtime publication. Subscribe with scoped filters — never subscribe unfiltered to these tables.';
