/**
 * route-recommendation
 *
 * Ranks candidate routes between an origin and destination and returns an
 * explainable recommendation matching the UI's expected shape.
 *
 * POST /functions/v1/route-recommendation
 * Body: {
 *   origin_location_id: string,
 *   destination_location_id: string,
 *   cargo_weight_kg?: number,
 *   priority?: "critical" | "high" | "medium" | "low"
 * }
 * Auth: Bearer <user JWT>
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface RequestBody {
  origin_location_id: string;
  destination_location_id: string;
  cargo_weight_kg?: number;
  priority?: string;
}

interface RouteRecommendation {
  route_id: string;
  route_number: string;
  name: string;
  recommendation: "RECOMMENDED" | "ALTERNATIVE" | "NOT_ADVISED";
  risk_score: number;
  accessibility_score: number;
  reliability_score: number;
  estimated_time_minutes: number;
  distance_km: number;
  warnings: string[];
  reasons: string[];
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

  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse(401, "Missing Authorization header");

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return errorResponse(401, "Invalid or expired session");

    // ── Validate input ────────────────────────────────────────────────────────
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Request body must be valid JSON");
    }

    const { origin_location_id, destination_location_id, cargo_weight_kg, priority } = body;
    if (!origin_location_id || !destination_location_id) {
      return errorResponse(400, "origin_location_id and destination_location_id are required");
    }

    const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Find candidate routes connecting origin → destination ─────────────────
    // Look for routes whose source or destination matches (allowing any route
    // passing through the region when exact match doesn't exist).
    const { data: routes, error: routeErr } = await svc
      .from("routes")
      .select(`
        id, route_number, name, distance_km, estimated_time_minutes,
        risk_score, accessibility_score, reliability_score,
        route_status, weather_summary, current_eta, current_delay,
        source_location_id, destination_location_id
      `)
      .or(
        `source_location_id.eq.${origin_location_id},destination_location_id.eq.${destination_location_id}`
      )
      .order("risk_score", { ascending: true })
      .limit(5);

    if (routeErr) return errorResponse(500, "Failed to fetch candidate routes");
    if (!routes || routes.length === 0) {
      return jsonResponse(200, { success: true, data: [], message: "No routes found for the given locations" });
    }

    // ── Fetch latest risk assessments for each candidate ──────────────────────
    const riskMap: Record<string, Record<string, number>> = {};
    for (const route of routes) {
      const { data: rra } = await svc
        .from("route_risk_assessments")
        .select("flood_risk, landslide_risk, weather_risk, road_condition_risk, confidence_score")
        .eq("route_id", route.id)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (rra) riskMap[route.id] = rra as Record<string, number>;
    }

    // ── Fetch active incidents per route ──────────────────────────────────────
    const incidentMap: Record<string, number> = {};
    for (const route of routes) {
      const { count } = await svc
        .from("road_incidents")
        .select("id", { count: "exact", head: true })
        .eq("route_id", route.id)
        .in("status", ["active", "escalated"]);
      incidentMap[route.id] = count ?? 0;
    }

    // ── Score and rank routes ─────────────────────────────────────────────────
    const scored = routes.map((r) => {
      const rra = riskMap[r.id] ?? {};
      const incidentPenalty = (incidentMap[r.id] ?? 0) * 5;
      const compositeScore =
        (r.risk_score ?? 50) * 0.4 +
        (100 - (r.accessibility_score ?? 50)) * 0.3 +
        (100 - (r.reliability_score ?? 50)) * 0.2 +
        incidentPenalty * 0.1;

      const warnings: string[] = [];
      if ((rra.flood_risk ?? 0) > 60) warnings.push(`High flood risk (${Math.round(rra.flood_risk)}%)`);
      if ((rra.landslide_risk ?? 0) > 60) warnings.push(`Landslide risk (${Math.round(rra.landslide_risk)}%)`);
      if (r.route_status === "blocked") warnings.push("Route currently blocked");
      if (r.route_status === "closed") warnings.push("Route closed");
      if (r.route_status === "restricted") warnings.push("Restricted access — check requirements");
      if (incidentMap[r.id] > 0) warnings.push(`${incidentMap[r.id]} active incident(s) on route`);
      if (r.weather_summary) warnings.push(r.weather_summary);

      return { ...r, compositeScore, warnings, rra };
    }).sort((a, b) => a.compositeScore - b.compositeScore);

    // ── Build explainable recommendations ────────────────────────────────────
    const recommendations: RouteRecommendation[] = scored.map((r, idx) => {
      const reasons: string[] = [];
      if (idx === 0) {
        if ((r.risk_score ?? 100) < 40) reasons.push("Lowest overall risk score");
        if ((r.accessibility_score ?? 0) > 70) reasons.push("High accessibility score");
        if ((r.reliability_score ?? 0) > 70) reasons.push("High reliability");
        if ((r.rra?.flood_risk ?? 100) < 30) reasons.push("Low flood risk");
        if ((r.rra?.landslide_risk ?? 100) < 30) reasons.push("Low landslide risk");
        if (incidentMap[r.id] === 0) reasons.push("No active incidents");
        if (reasons.length === 0) reasons.push("Best available route given current conditions");
      } else {
        if ((r.risk_score ?? 100) < (scored[0]?.risk_score ?? 100)) reasons.push("Lower risk than recommended route");
        else reasons.push("Alternative if primary route becomes unavailable");
      }

      const label =
        idx === 0 ? "RECOMMENDED" :
        r.route_status === "blocked" || r.route_status === "closed" ? "NOT_ADVISED" :
        "ALTERNATIVE";

      return {
        route_id: r.id,
        route_number: r.route_number ?? "",
        name: r.name ?? "",
        recommendation: label,
        risk_score: r.risk_score ?? 50,
        accessibility_score: r.accessibility_score ?? 50,
        reliability_score: r.reliability_score ?? 50,
        estimated_time_minutes: r.estimated_time_minutes ?? 0,
        distance_km: r.distance_km ?? 0,
        warnings: r.warnings,
        reasons,
      };
    });

    return jsonResponse(200, { success: true, data: recommendations });
  } catch (err) {
    console.error("Unexpected error:", err);
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
