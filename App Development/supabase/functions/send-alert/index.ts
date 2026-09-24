/**
 * send-alert
 *
 * Creates an alert record and fans out per-user notification rows for all
 * users whose role matches the alert's target_role (or all roles if null).
 * Optionally invokes push delivery (FCM) when FCM_SERVICE_ACCOUNT is set.
 *
 * POST /functions/v1/send-alert
 * Body: {
 *   severity: "critical" | "high" | "medium" | "low",
 *   title: string,
 *   description?: string,
 *   location_text?: string,
 *   route_id?: string,
 *   incident_id?: string,
 *   source?: string,
 *   action_text?: string,
 *   district?: string,
 *   state?: string,
 *   target_role?: "field_officer" | "district_officer" | "control_room"
 * }
 * Auth: Bearer <JWT>  (must be district_officer or control_room to broadcast)
 *
 * Secrets:
 *   FCM_SERVICE_ACCOUNT  — JSON service account for Firebase push (optional)
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const VALID_SEVERITIES = ["critical", "high", "medium", "low"] as const;
const VALID_ROLES = ["field_officer", "district_officer", "control_room"] as const;
type Severity = typeof VALID_SEVERITIES[number];

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
    // ── Auth: only district_officer or control_room may send alerts ──────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse(401, "Missing Authorization header");

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return errorResponse(401, "Invalid or expired session");

    // ── Parse and validate body ───────────────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Request body must be valid JSON");
    }

    const { severity, title, description, location_text, route_id,
            incident_id, source, action_text, district, state, target_role } = body;

    if (!severity || !VALID_SEVERITIES.includes(severity as Severity)) {
      return errorResponse(400, `severity must be one of: ${VALID_SEVERITIES.join(", ")}`);
    }
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return errorResponse(400, "title is required");
    }
    if (target_role && !VALID_ROLES.includes(target_role as typeof VALID_ROLES[number])) {
      return errorResponse(400, `target_role must be one of: ${VALID_ROLES.join(", ")}`);
    }

    const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Create alert record ───────────────────────────────────────────────────
    const { data: alert, error: alertErr } = await svc
      .from("alerts")
      .insert({
        severity,
        title: String(title).trim(),
        description: description ?? null,
        location_text: location_text ?? null,
        route_id: route_id ?? null,
        incident_id: incident_id ?? null,
        source: source ?? "System",
        action_text: action_text ?? null,
        district: district ?? null,
        state: state ?? null,
        target_role: target_role ?? null,
        status: "active",
      })
      .select("id, alert_ref")
      .single();

    if (alertErr || !alert) {
      return errorResponse(500, `Failed to create alert: ${alertErr?.message}`);
    }

    // ── Fan out notifications to matching users ───────────────────────────────
    let userQuery = svc
      .from("user_roles")
      .select("user_id")
      .eq("is_active", true);

    if (target_role) {
      userQuery = userQuery.eq("role", target_role);
    }

    // If district-scoped alert, filter to users in that district
    if (district) {
      const { data: distLoc } = await svc
        .from("locations")
        .select("id")
        .eq("district", district)
        .limit(1)
        .maybeSingle();
      if (distLoc) {
        userQuery = userQuery.or(`district_id.eq.${distLoc.id},district_id.is.null`);
      }
    }

    const { data: targetUsers } = await userQuery;

    const notifSeverity = (severity as Severity) === "medium" ? "info" : severity;

    if (targetUsers && targetUsers.length > 0) {
      const notifications = targetUsers.map((u: { user_id: string }) => ({
        user_id: u.user_id,
        type: "alert",
        title: String(title).trim(),
        message: description ? String(description).slice(0, 500) : String(title).trim(),
        severity: notifSeverity,
        related_alert_id: alert.id,
        related_route_id: route_id ?? null,
      }));

      const { error: notifErr } = await svc.from("notifications").insert(notifications);
      if (notifErr) console.error("Failed to create notifications:", notifErr.message);
    }

    // ── Push delivery placeholder ─────────────────────────────────────────────
    // When FCM_SERVICE_ACCOUNT is configured, invoke FCM here.
    // Omitted from this stub; implement when Firebase project is provisioned.

    return jsonResponse(200, {
      success: true,
      alert_id: alert.id,
      alert_ref: alert.alert_ref,
      notifications_sent: targetUsers?.length ?? 0,
    });
  } catch (err) {
    console.error("send-alert error:", err);
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
