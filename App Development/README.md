# NER Logistics Platform

React/Vite frontend with a Supabase PostgreSQL/PostGIS backend and Supabase Edge Functions.

The repository contains the complete backend source required to reproduce the local backend on another laptop:

- `supabase/config.toml`
- `supabase/migrations/`
- `supabase/seed.sql`
- `supabase/functions/`
- `src/lib/supabase.ts`
- `src/lib/useAuth.ts`
- `docs/BACKEND_CONNECTION.md`

No real API keys, passwords, service-role keys, database credentials, or ML credentials are committed.

## Requirements

Install:

- Node.js 20 or newer
- npm 10 or newer
- Docker Desktop running
- Supabase CLI
- Git

For mobile work, install Flutter and Android Studio separately. This repository currently contains the React/Vite application and Supabase backend; the Flutter project will live under `mobile/` when it is scaffolded.

Verify tools:

```powershell
node --version
npm --version
supabase --version
docker --version
```

## Clone

```powershell
git clone https://github.com/anandsharmacy/Binary_Battalion.git
cd Binary_Battalion
```

The current GitHub repository contains the existing dashboard application at the repository root. The `App Development` project is kept as a separate project directory when working from the workspace checkout. If your checkout contains this project in a subdirectory, enter that directory before running the commands below.

## Install frontend dependencies

```powershell
npm install
```

The committed `package-lock.json` and `pnpm-lock.yaml` are both retained. Use npm for the commands in this document unless the team standardizes on pnpm.

## Configure environment

Create a local environment file from the safe template:

```powershell
Copy-Item .env.example .env.local
```

For local Supabase, start the stack first and copy the publishable key from `supabase status` into `.env.local`:

```text
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key-from-supabase-status>
HOST=0.0.0.0
PORT=8443
VITE_API_BASE_URL=http://127.0.0.1:54321
```

`VITE_` variables are exposed to the browser. Only use the Supabase publishable key there. Never place these in `.env.local` for frontend use:

- `SUPABASE_SERVICE_ROLE_KEY`
- database passwords
- GIS provider private keys
- ML service credentials
- Firebase service-account credentials

## Start the local Supabase backend

From the project directory:

```powershell
npm run supabase:start
npm run supabase:status
npm run supabase:reset
```

`supabase db reset` applies every migration and loads `supabase/seed.sql`. The seed creates deterministic development data and fixed demo identities with randomly generated passwords on each reset. It does not commit a usable password. Create a local Auth user through the signup flow; the selected role is active immediately.

Useful local URLs:

| Service | URL |
|---|---|
| Supabase API | `http://127.0.0.1:54321` |
| Supabase Studio | `http://127.0.0.1:54323` |
| Local email inbox | `http://127.0.0.1:54324` |
| Frontend | `http://127.0.0.1:8443` |

Stop the backend when finished:

```powershell
npm run supabase:stop
```

## Configure Edge Function secrets

The Edge Functions are in `supabase/functions/`. They read server-only values from `Deno.env`.

For local development, create a local secrets file outside Git or set secrets through the CLI. For hosted Supabase:

```powershell
supabase secrets set `
  SUPABASE_SERVICE_ROLE_KEY="<server-only-key>" `
  ML_SERVICE_URL="<python-service-url>" `
  ML_SERVICE_API_KEY="<server-only-key>" `
  WEATHER_PROVIDER_BASE_URL="https://api.open-meteo.com/v1/forecast"
```

Add GIS, weather, disaster, notification, and ML provider secrets only in the Supabase project secret store. Do not add them to `.env.example`, frontend variables, SQL migrations, or Git.

Serve functions locally when needed:

```powershell
npm run supabase:functions:serve
```

Deploy a function only after reviewing its authentication, RLS, input validation, and secret usage:

```powershell
supabase functions deploy process-road-incident
supabase functions deploy route-recommendation
supabase functions deploy calculate-route-risk
supabase functions deploy sync-weather
supabase functions deploy sync-disasters
supabase functions deploy ml-prediction
supabase functions deploy send-alert
```

## Start the frontend

With Supabase running and `.env.local` configured:

```powershell
npm run dev
```

The Vite server is configured to bind to `0.0.0.0` by default and uses port `8443` unless `PORT` is set.

Production validation:

```powershell
npm run typecheck
npm run build
npm run preview
```

## LAN testing from another laptop

1. Both laptops must be on the same network.
2. Find the host laptop's private IPv4 address:

```powershell
ipconfig
```

3. On the host laptop, start the frontend with a LAN bind:

```powershell
$env:HOST="0.0.0.0"
$env:PORT="8443"
npm run dev
```

4. On the teammate laptop, open:

```text
http://<host-ipv4>:8443
```

5. For a hosted Supabase project, set `VITE_SUPABASE_URL` to the hosted project URL. For a local Supabase stack, the teammate's browser cannot use `127.0.0.1` to reach the host laptop. Use the host machine's reachable address only if the local Supabase services are intentionally exposed and firewall rules allow it; hosted Supabase is recommended for team testing.
6. Allow TCP port `8443` through the host laptop's development firewall only on the trusted private network.

The frontend's API base is configured with `VITE_SUPABASE_URL`. There is no separate Node API server in this project; the backend API is Supabase's local or hosted API plus its Edge Functions.

## Database workflow

Create or change schema only through migrations:

```powershell
supabase migration new describe_change
supabase db reset
supabase db diff --local
supabase db push
```

Never make undocumented production-only schema changes in Supabase Studio.

The backend uses PostGIS geography columns and RLS policies. Review `supabase/migrations/20260101000012_rls.sql` before adding a table exposed through the Data API.

## Backend files

### Database

- `supabase/config.toml`
- `supabase/migrations/20260101000001_extensions.sql` through `20260101000016_realtime.sql`
- `supabase/seed.sql`

### Edge Functions

- `calculate-route-risk`
- `ml-prediction`
- `process-road-incident`
- `route-recommendation`
- `send-alert`
- `sync-disasters`
- `sync-weather`

### Frontend connection

- `src/lib/supabase.ts`
- `src/lib/useAuth.ts`
- `src/lib/database.types.ts`

### Documentation

- `docs/BACKEND_CONNECTION.md`

## Troubleshooting

### Missing environment variables

If Vite reports `Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY`, verify `.env.local` exists in the frontend project directory and restart Vite.

### Docker or Supabase reset fails

Ensure Docker Desktop is running, then run:

```powershell
supabase stop
supabase start
supabase db reset
```

### Port already in use

Choose another frontend port:

```powershell
$env:PORT="8444"
npm run dev
```

Update the URL used by the browser accordingly.

### Auth user is inactive

New users are active immediately after registration. Operational role assignment remains separate from account creation.

## Security rules

- Never commit `.env`, `.env.local`, secrets, tokens, passwords, or credentials.
- Never ship the Supabase service-role key to a browser or mobile client.
- Keep private provider and ML credentials in Supabase secrets.
- Keep RLS enabled on every exposed application table.
- Do not treat client-side role selection as authorization.
- Do not use development seed identities or data in production.

## Current limitations

- GIS provider vendors are not selected yet; adapters and configuration placeholders are used.
- The Python ML service contract and deployment URL are not finalized.
- Push notifications require Firebase project configuration.
- The Flutter mobile project has not yet been scaffolded.
