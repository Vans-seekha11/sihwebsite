-- 0001: Extensions
-- Enable PostGIS for spatial data, uuid-ossp for UUID generation, pgcrypto for crypto helpers

create extension if not exists "postgis"       with schema extensions;
create extension if not exists "uuid-ossp"     with schema extensions;
create extension if not exists "pgcrypto"      with schema extensions;
-- pg_cron is enabled by default in hosted Supabase; skip in local dev if unavailable
create extension if not exists "pg_cron"       with schema extensions;
