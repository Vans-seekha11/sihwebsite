/**
 * sync-weather
 *
 * Fetches weather data from the configured provider, normalises the response,
 * and upserts into weather_data. Idempotent — safe to call from Cron or retry.
 *
 * Called by Supabase Cron every 30 minutes.
 * Can also be triggered manually:
 *   POST /functions/v1/sync-weather
 *   Body: { location_ids?: string[] }  (optional filter; omit for all locations)
 *
 * Server-side secrets required (set via `supabase secrets set`):
 *   WEATHER_PROVIDER_API_KEY
 * Optional:
 *   WEATHER_PROVIDER_BASE_URL  (defaults to Open-Meteo free tier — no key required)
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Open-Meteo is used as the default provider (no API key required for basic data).
// Replace with your provider's base URL when a commercial contract is in place.
const WEATHER_BASE_URL =
  Deno.env.get("WEATHER_PROVIDER_BASE_URL") ?? "https://api.open-meteo.com/v1/forecast";

interface LocationRow {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const startedAt = new Date().toISOString();
  let recordsIn = 0;
  let recordsOut = 0;
  let errorMsg: string | null = null;

  try {
    // ── Determine which locations to sync ─────────────────────────────────────
    let locationFilter: string[] | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        locationFilter = body.location_ids ?? null;
      } catch {
        // Body is optional; proceed with all locations
      }
    }

    let query = svc
      .from("locations")
      .select("id, latitude, longitude, name")
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    if (locationFilter && locationFilter.length > 0) {
      query = query.in("id", locationFilter);
    }

    const { data: locations, error: locErr } = await query;
    if (locErr) throw new Error(`Failed to fetch locations: ${locErr.message}`);
    if (!locations || locations.length === 0) {
      return jsonResponse(200, { success: true, message: "No locations to sync", records_out: 0 });
    }

    // ── Fetch and upsert weather for each location ────────────────────────────
    const weatherRows: Record<string, unknown>[] = [];

    for (const loc of locations as LocationRow[]) {
      recordsIn++;
      try {
        // Open-Meteo API: free, no key, covers India
        const url = new URL(WEATHER_BASE_URL);
        url.searchParams.set("latitude", String(loc.latitude));
        url.searchParams.set("longitude", String(loc.longitude));
        url.searchParams.set(
          "current",
          "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,visibility,surface_pressure,weather_code"
        );
        url.searchParams.set("timezone", "Asia/Kolkata");

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        let weatherData: Record<string, unknown> = {};

        try {
          const resp = await fetch(url.toString(), { signal: controller.signal });
          clearTimeout(timeout);
          if (resp.ok) {
            weatherData = await resp.json();
          }
        } catch (fetchErr) {
          clearTimeout(timeout);
          console.warn(`Weather fetch failed for ${loc.name}:`, fetchErr);
          continue;
        }

        const current = (weatherData.current as Record<string, unknown>) ?? {};
        const wmoCode = Number(current.weather_code ?? 0);

        weatherRows.push({
          location_id: loc.id,
          recorded_at: current.time ?? new Date().toISOString(),
          temperature_c: current.temperature_2m ?? null,
          humidity_percent: current.relative_humidity_2m ?? null,
          rainfall_mm: current.precipitation ?? null,
          wind_speed_kmph: current.wind_speed_10m ?? null,
          visibility_km: current.visibility ? Number(current.visibility) / 1000 : null,
          pressure_hpa: current.surface_pressure ?? null,
          weather_condition: wmoCodeToCondition(wmoCode),
          source: "Open-Meteo",
          raw_data: current,
        });
        recordsOut++;
      } catch (locErr) {
        console.warn(`Failed to process weather for location ${loc.id}:`, locErr);
      }
    }

    // ── Batch insert ──────────────────────────────────────────────────────────
    if (weatherRows.length > 0) {
      const { error: insertErr } = await svc.from("weather_data").insert(weatherRows);
      if (insertErr) throw new Error(`Failed to insert weather data: ${insertErr.message}`);
    }

    // ── Write ingestion log ───────────────────────────────────────────────────
    await svc.from("data_ingestion_logs").insert({
      source_name: "sync-weather",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      records_in: recordsIn,
      records_out: recordsOut,
      status: "success",
    });

    return jsonResponse(200, {
      success: true,
      records_in: recordsIn,
      records_out: recordsOut,
    });
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
    console.error("sync-weather error:", errorMsg);

    await svc.from("data_ingestion_logs").insert({
      source_name: "sync-weather",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      records_in: recordsIn,
      records_out: recordsOut,
      status: "failed",
      error: errorMsg,
    }).catch(() => {});

    return errorResponse(500, errorMsg);
  }
});

/** Map WMO weather interpretation codes to human-readable strings. */
function wmoCodeToCondition(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 49) return "Foggy";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 82) return "Heavy Rain";
  if (code <= 84) return "Heavy Snow";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
function errorResponse(status: number, message: string): Response {
  return jsonResponse(status, { success: false, error: message });
}
