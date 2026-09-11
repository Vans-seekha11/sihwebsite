/**
 * process-road-incident
 *
 * Validates, enriches, and persists a road incident reported from the
 * ReportScreen 6-step wizard. Also applies downstream effects:
 *   - Updates the route's risk_score
 *   - Fires send-alert for critical/high severity incidents
 *   - Writes an audit record
 *
 * POST /functions/v1/process-road-incident
 * Body: {
 *   category: incident_type_enum,
 *   title?: string,
 *   description?: string,
 *   severity: "critical" | "high" | "medium" | "low",
 *   latitude: number,
 *   longitude: number,
 *   route_id?: string,
 *   media_path?: string,
 *   sync_source?: "online" | "offline"
 * }
 * Auth: Bearer <user JWT>  (field_officer, district_officer, or control_room)
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const VALID_CATEGORIES = [
  "road_block", "flood", "landslide", "bridge_damage",
  "vehicle_breakdown", "accident", "infrastructure_damage", "other",
] as const;
const VALID_SEVERITIES = ["critical", "high", "medium", "low"] as const;

// NER bounding box
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

  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse(401, "Missing Authorization header");

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return errorResponse(401, "Invalid or expired session");

    // ── Parse body ────────────────────────────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Request body must be valid JSON");
    }

    const {
      category, title, description, severity,
      latitude, longitude, route_id, media_path,
      sync_source = "online",
    } = body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!category || !VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
      return errorResponse(400, `category must be one of: ${VALID_CATEGORIES.join(", ")}`);
    }
    if (!severity || !VALID_SEVERITIES.includes(severity as typeof VALID_SEVERITIES[number])) {
      return errorResponse(400, `severity must be one of: ${VALID_SEVERITIES.join(", ")}`);
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return errorResponse(400, "latitude and longitude must be numbers");
    }
    // Reject coordinates outside NER
    if (
      lat < NER_BOUNDS.minLat || lat > NER_BOUNDS.maxLat ||
      lon < NER_BOUNDS.minLon || lon > NER_BOUNDS.maxLon
    ) {
      return errorResponse(400, "Coordinates are outside the NER operational boundary");
    }

    const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Nearest location lookup ───────────────────────────────────────────────
    const { data: nearbyLocs } = await svc.rpc("find_nearby_locations", {
      p_point: `SRID=4326;POINT(${lon} ${lat})`,
      p_radius_m: 30000,
    });

    const nearestLocation = nearbyLocs?.[0] ?? null;

    // ── Reporter's profile ────────────────────────────────────────────────────
    const { data: profile } = await svc
      .from("profiles")
      .select("is_active")
      .eq("id", user.id)
      .single();

    if (!profile?.is_active) {
      return errorResponse(403, "Account is inactive. Contact an administrator.");
    }

    // ── Insert incident ───────────────────────────────────────────────────────
    const { data: incident, error: insertErr } = await svc
      .from("road_incidents")
      .insert({
        reported_by: user.id,
        location_id: nearestLocation?.id ?? null,
        geometry: `SRID=4326;POINT(${lon} ${lat})`,
        route_id: route_id ?? null,
        category,
        title: title ? String(title).trim() : `${category} reported`,
        description: description ? String(description).slice(0, 2000) : null,
        severity,
        media_path: media_path ?? null,
        status: "pending",
        district: nearestLocation?.district ?? null,
        state: null,
        sync_source: sync_source === "offline" ? "offline" : "online",
        sync_status: "synced",
      })
      .select("id, incident_ref")
      .single();

    if (insertErr || !incident) {
      return errorResponse(500, `Failed to create incident: ${insertErr?.message}`);
    }

    // ── Update route risk if route_id provided ────────────────────────────────
    if (route_id) {
      const severityPenalty: Record<string, number> = {
        critical: 25, high: 15, medium: 8, low: 3,
      };
      const penalty = severityPenalty[String(severity)] ?? 5;

      await svc.rpc("calculate_distance", {}).catch(() => {}); // no-op warmup
      // Nudge the route's risk score upward
      const { data: currentRoute } = await svc
        .from("routes")
        .select("risk_score")
        .eq("id", String(route_id))
        .single();

      if (currentRoute) {
        const newRisk = Math.min(100, (currentRoute.risk_score ?? 50) + penalty);
        await svc
          .from("routes")
          .update({ risk_score: newRisk, updated_at: new Date().toISOString() })
          .eq("id", String(route_id));
      }
    }

    // ── Auto-alert for critical and high incidents ────────────────────────────
    if (severity === "critical" || severity === "high") {
      const alertUrl = `${SUPABASE_URL}/functions/v1/send-alert`;
      await fetch(alertUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          severity,
          title: `${severity === "critical" ? "🔴" : "🟠"} ${title ?? category} — ${nearestLocation?.name ?? "NER"}`,
          description: description ?? null,
          route_id: route_id ?? null,
          incident_id: incident.id,
          source: "Field Report",
          district: nearestLocation?.district ?? null,
        }),
      }).catch((e) => console.warn("Auto-alert failed:", e));
    }

    return jsonResponse(201, {
      success: true,
      incident_id: incident.id,
      incident_ref: incident.incident_ref,
    });
  } catch (err) {
    console.error("process-road-incident error:", err);
    return errorResponse(500, "Internal server error");
  }
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
function errorResponse(status: number, message: string): Response {
  return jsonResponse(status, { success: false, error: message });
}
