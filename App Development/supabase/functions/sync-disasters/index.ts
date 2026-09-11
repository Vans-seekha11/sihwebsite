/**
 * sync-disasters
 *
 * Fetches disaster event data from configured providers, normalises the
 * response into disaster_events rows, and upserts idempotently using
 * source_event_id to prevent duplicates.
 *
 * Called by Supabase Cron every 15 minutes.
 * Can also be triggered manually:
 *   POST /functions/v1/sync-disasters
 *   Body: { sources?: ("gdacs" | "imd" | "ndrf")[] }
 *
 * Server-side secrets required:
 *   DISASTER_PROVIDER_API_KEY   (set when using a paid provider)
 *
 * Default: uses GDACS public API (no key required).
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// GDACS RSS/GeoJSON endpoint for South Asia region
const GDACS_URL = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?fromDate=&toDate=&alertlevel=&eventtype=FL,TC,EQ,LS&limit=50";

// NER bounding box for filtering events (approx.)
const NER_BOUNDS = { minLat: 21.9, maxLat: 29.5, minLon: 88.0, maxLon: 97.5 };

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
    // ── Fetch GDACS events ────────────────────────────────────────────────────
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let gdacsEvents: unknown[] = [];

    try {
      const resp = await fetch(GDACS_URL, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeout);

      if (resp.ok) {
        const json = await resp.json() as { features?: unknown[] };
        gdacsEvents = json.features ?? [];
      }
    } catch (fetchErr) {
      clearTimeout(timeout);
      console.warn("GDACS fetch failed:", fetchErr);
      // Non-fatal — log and continue with empty set
    }

    // ── Normalise events into disaster_events rows ────────────────────────────
    const rows: Record<string, unknown>[] = [];

    for (const feature of gdacsEvents as Record<string, unknown>[]) {
      recordsIn++;
      try {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        const geometry = feature.geometry as { coordinates?: [number, number] } | null;

        const lon = geometry?.coordinates?.[0];
        const lat = geometry?.coordinates?.[1];

        // Filter to NER region
        if (
          lat == null || lon == null ||
          lat < NER_BOUNDS.minLat || lat > NER_BOUNDS.maxLat ||
          lon < NER_BOUNDS.minLon || lon > NER_BOUNDS.maxLon
        ) {
          continue;
        }

        const eventType = gdacsTypeToEnum(String(props.eventtype ?? ""));
        if (!eventType) continue;

        rows.push({
          type: eventType,
          severity: gdacsSeverityToInt(String(props.alertlevel ?? "Green")),
          title: String(props.eventname ?? props.htmldescription ?? "Disaster Event").slice(0, 200),
          description: String(props.htmldescription ?? "").replace(/<[^>]*>/g, "").slice(0, 1000),
          started_at: props.fromdate ? new Date(String(props.fromdate)).toISOString() : new Date().toISOString(),
          probability: null,
          source: "GDACS",
          source_event_id: String(props.eventid ?? ""),
          verified: false,
        });
        recordsOut++;
      } catch (parseErr) {
        console.warn("Failed to parse GDACS feature:", parseErr);
      }
    }

    // ── Upsert on source_event_id to remain idempotent ────────────────────────
    if (rows.length > 0) {
      const { error: upsertErr } = await svc
        .from("disaster_events")
        .upsert(rows, { onConflict: "source_event_id", ignoreDuplicates: true });
      if (upsertErr) throw new Error(`Upsert failed: ${upsertErr.message}`);
    }

    // ── Ingestion log ─────────────────────────────────────────────────────────
    await svc.from("data_ingestion_logs").insert({
      source_name: "sync-disasters",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      records_in: recordsIn,
      records_out: recordsOut,
      status: "success",
    });

    return jsonResponse(200, { success: true, records_in: recordsIn, records_out: recordsOut });
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
    console.error("sync-disasters error:", errorMsg);

    await svc.from("data_ingestion_logs").insert({
      source_name: "sync-disasters",
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

function gdacsTypeToEnum(type: string): string | null {
  const map: Record<string, string> = {
    FL: "flood",
    TC: "cyclone",
    EQ: "earthquake",
    LS: "landslide",
    DR: "drought",
  };
  return map[type.toUpperCase()] ?? null;
}

function gdacsSeverityToInt(alertLevel: string): number {
  const map: Record<string, number> = { Green: 1, Orange: 3, Red: 5 };
  return map[alertLevel] ?? 2;
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
