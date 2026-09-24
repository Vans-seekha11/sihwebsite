/**
 * ml-prediction
 *
 * Calls the Python ML inference service and stores the typed result in
 * route_predictions + route_risk_assessments. Flutter/web clients never
 * call the ML service directly.
 *
 * POST /functions/v1/ml-prediction
 * Body: {
 *   route_id: string,
 *   model_version?: string   (defaults to "latest")
 * }
 * Auth: Bearer <user JWT>
 *
 * Server-side secrets required:
 *   ML_SERVICE_URL       — base URL of the Python service
 *   ML_SERVICE_API_KEY   — bearer token for the service
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ML_SERVICE_URL = Deno.env.get("ML_SERVICE_URL");
const ML_SERVICE_API_KEY = Deno.env.get("ML_SERVICE_API_KEY");

const ML_TIMEOUT_MS = 15000;

interface MLRequest {
  route_id: string;
  route_segments: unknown[];
  weather_features: Record<string, unknown>;
  disaster_features: Record<string, unknown>;
  road_condition_features: Record<string, unknown>;
  traffic_features: Record<string, unknown>;
  model_version: string;
}

interface MLResponse {
  prediction: number;
  risk_score: number;
  confidence: number;
  model_version: string;
  warnings: string[];
  features_reference: string;
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

    // ── Parse input ───────────────────────────────────────────────────────────
    let body: { route_id: string; model_version?: string };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Request body must be valid JSON");
    }

    const { route_id, model_version = "latest" } = body;
    if (!route_id) return errorResponse(400, "route_id is required");

    const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Gather features from the database ────────────────────────────────────
    const [routeRes, segmentsRes, weatherRes, disasterRes, incidentRes] = await Promise.all([
      svc.from("routes").select("*").eq("id", route_id).single(),
      svc.from("route_segments").select("*").eq("route_id", route_id),
      svc.from("weather_data")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(5),
      svc.from("disaster_events")
        .select("type, severity, probability")
        .eq("route_id", route_id)
        .is("ended_at", null),
      svc.from("road_incidents")
        .select("category, severity")
        .eq("route_id", route_id)
        .in("status", ["active", "escalated"]),
    ]);

    if (routeRes.error || !routeRes.data) {
      return errorResponse(404, `Route not found: ${route_id}`);
    }

    const mlRequest: MLRequest = {
      route_id,
      route_segments: segmentsRes.data ?? [],
      weather_features: { records: weatherRes.data ?? [] },
      disaster_features: { active_events: disasterRes.data ?? [] },
      road_condition_features: {
        accessibility_score: routeRes.data.accessibility_score,
        risk_score: routeRes.data.risk_score,
      },
      traffic_features: { incident_count: incidentRes.data?.length ?? 0 },
      model_version,
    };

    // ── Call ML service (if configured) ──────────────────────────────────────
    let mlResult: MLResponse;

    if (ML_SERVICE_URL && ML_SERVICE_API_KEY) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

      try {
        const mlResp = await fetch(`${ML_SERVICE_URL}/predict`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ML_SERVICE_API_KEY}`,
          },
          body: JSON.stringify(mlRequest),
        });
        clearTimeout(timeout);

        if (!mlResp.ok) {
          const errText = await mlResp.text();
          throw new Error(`ML service returned ${mlResp.status}: ${errText.slice(0, 200)}`);
        }

        mlResult = await mlResp.json() as MLResponse;

        // Validate response shape
        if (typeof mlResult.risk_score !== "number" || typeof mlResult.confidence !== "number") {
          throw new Error("ML service returned unexpected response shape");
        }
      } catch (mlErr) {
        clearTimeout(timeout);
        console.warn("ML service unavailable, using fallback:", mlErr);
        // ── Fallback: return last valid prediction from DB ─────────────────
        const { data: lastPred } = await svc
          .from("route_predictions")
          .select("probability, confidence, model_version, prediction_time")
          .eq("route_id", route_id)
          .eq("prediction_type", "disruption")
          .order("prediction_time", { ascending: false })
          .limit(1)
          .maybeSingle();

        return jsonResponse(200, {
          success: true,
          fallback: true,
          message: "ML service unavailable. Returning last valid prediction.",
          last_prediction: lastPred ?? null,
        });
      }
    } else {
      // ── No ML service configured — return stub ───────────────────────────
      mlResult = {
        prediction: routeRes.data.risk_score ?? 50,
        risk_score: routeRes.data.risk_score ?? 50,
        confidence: 0.75,
        model_version: "v2.1-rules",
        warnings: ["ML service not configured. Using rule-based estimate."],
        features_reference: route_id,
      };
    }

    // ── Store prediction ──────────────────────────────────────────────────────
    const { error: predErr } = await svc.from("route_predictions").insert({
      route_id,
      prediction_type: "disruption",
      probability: mlResult.risk_score,
      confidence: mlResult.confidence * 100,
      model_version: mlResult.model_version,
      factors: mlResult.warnings,
      prediction_time: new Date().toISOString(),
    });

    if (predErr) console.error("Failed to store prediction:", predErr.message);

    // ── Update route risk_score ───────────────────────────────────────────────
    await svc
      .from("routes")
      .update({ risk_score: mlResult.risk_score, updated_at: new Date().toISOString() })
      .eq("id", route_id);

    return jsonResponse(200, { success: true, data: mlResult });
  } catch (err) {
    console.error("ml-prediction error:", err);
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
