/**
 * calculate-route-risk
 *
 * Combines route, weather, disaster, and road condition inputs to produce a
 * typed risk breakdown stored in route_risk_assessments.
 *
 * POST /functions/v1/calculate-route-risk
 * Body: { route_id: string }
 * Auth: Bearer <user JWT>  (must be active district_officer or control_room)
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface RequestBody {
  route_id: string;
}

interface RiskResult {
  route_id: string;
  weather_risk: number;
  flood_risk: number;
  landslide_risk: number;
  road_condition_risk: number;
  traffic_risk: number;
  disaster_risk: number;
  total_risk_score: number;
  confidence_score: number;
  model_version: string;
}

Deno.serve(async (req: Request) => {
  // ── CORS pre-flight ───────────────────────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // ── Auth: verify caller identity ─────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse(401, "Missing Authorization header");
    }

    // Use a user-scoped client for auth verification
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return errorResponse(401, "Invalid or expired session");

    // ── Validate input ────────────────────────────────────────────────────────
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Request body must be valid JSON");
    }

    const { route_id } = body;
    if (!route_id || typeof route_id !== "string") {
      return errorResponse(400, "route_id is required and must be a UUID string");
    }

    // ── Service-role client for privileged reads/writes ───────────────────────
    const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Fetch route ───────────────────────────────────────────────────────────
    const { data: route, error: routeErr } = await svc
      .from("routes")
      .select("id, route_number, name, state, distance_km")
      .eq("id", route_id)
      .single();

    if (routeErr || !route) {
      return errorResponse(404, `Route not found: ${route_id}`);
    }

    // ── Fetch latest weather for route's state ────────────────────────────────
    const { data: weather } = await svc
      .from("weather_data")
      .select("rainfall_mm, wind_speed_kmph, visibility_km, weather_condition")
      .eq("locations.state", route.state)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // ── Fetch active disasters on this route ──────────────────────────────────
    const { data: disasters } = await svc
      .from("disaster_events")
      .select("type, severity, probability")
      .eq("route_id", route_id)
      .is("ended_at", null);

    // ── Fetch active incidents on this route ──────────────────────────────────
    const { data: incidents } = await svc
      .from("road_incidents")
      .select("severity, category")
      .eq("route_id", route_id)
      .in("status", ["pending", "active", "escalated"]);

    // ── Fetch road condition for segments ─────────────────────────────────────
    const { data: segments } = await svc
      .from("route_segments")
      .select("condition_score, risk_score")
      .eq("route_id", route_id);

    // ── Risk calculation ──────────────────────────────────────────────────────
    // All scores are 0–100 (higher = riskier).
    // This is a deterministic rule-based model; the ML service refines it.

    const rainfall = weather?.rainfall_mm ?? 0;
    const windSpeed = weather?.wind_speed_kmph ?? 0;
    const visibility = weather?.visibility_km ?? 10;

    const weatherRisk = Math.min(
      100,
      (rainfall / 100) * 60 + (windSpeed / 80) * 20 + ((10 - Math.min(visibility, 10)) / 10) * 20
    );

    const disasterList = disasters ?? [];
    const floodDisasters = disasterList.filter((d) => ["flood", "flash_flood"].includes(d.type));
    const landslideDisasters = disasterList.filter((d) => d.type === "landslide");

    const floodRisk = floodDisasters.length > 0
      ? Math.min(100, floodDisasters.reduce((acc, d) => acc + (d.probability ?? 0) * 100 * (d.severity / 5), 0))
      : Math.min(100, rainfall / 1.2);

    const landslideRisk = landslideDisasters.length > 0
      ? Math.min(100, landslideDisasters.reduce((acc, d) => acc + (d.probability ?? 0) * 100 * (d.severity / 5), 0))
      : 10;

    const incidentList = incidents ?? [];
    const criticalIncidents = incidentList.filter((i) => i.severity === "critical").length;
    const highIncidents = incidentList.filter((i) => i.severity === "high").length;
    const roadConditionRisk = Math.min(100, criticalIncidents * 30 + highIncidents * 15 + incidentList.length * 5);

    const segmentList = segments ?? [];
    const avgCondition = segmentList.length > 0
      ? segmentList.reduce((acc, s) => acc + (s.condition_score ?? 50), 0) / segmentList.length
      : 50;
    const trafficRisk = Math.max(0, 50 - avgCondition * 0.3);

    const disasterRisk = disasterList.length > 0
      ? Math.min(100, disasterList.reduce((acc, d) => acc + (d.probability ?? 0) * 100 * (d.severity / 5), 0) / disasterList.length)
      : 0;

    const totalRisk = Math.min(
      100,
      weatherRisk * 0.25 +
      floodRisk * 0.25 +
      landslideRisk * 0.15 +
      roadConditionRisk * 0.20 +
      trafficRisk * 0.05 +
      disasterRisk * 0.10
    );

    const result: RiskResult = {
      route_id,
      weather_risk: Math.round(weatherRisk),
      flood_risk: Math.round(floodRisk),
      landslide_risk: Math.round(landslideRisk),
      road_condition_risk: Math.round(roadConditionRisk),
      traffic_risk: Math.round(trafficRisk),
      disaster_risk: Math.round(disasterRisk),
      total_risk_score: Math.round(totalRisk),
      confidence_score: 0.82,
      model_version: "v2.1-rules",
    };

    // ── Persist assessment ────────────────────────────────────────────────────
    const { error: insertErr } = await svc
      .from("route_risk_assessments")
      .insert(result);

    if (insertErr) {
      console.error("Failed to insert risk assessment:", insertErr.message);
      return errorResponse(500, "Failed to store risk assessment");
    }

    // ── Update route's risk_score ─────────────────────────────────────────────
    await svc
      .from("routes")
      .update({ risk_score: result.total_risk_score, updated_at: new Date().toISOString() })
      .eq("id", route_id);

    return jsonResponse(200, { success: true, data: result });
  } catch (err) {
    console.error("Unexpected error:", err);
    return errorResponse(500, "Internal server error");
  }
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function errorResponse(status: number, message: string): Response {
  return jsonResponse(status, { success: false, error: message });
}
