import { useEffect, useState } from "react";
import { Bell, Check, ChevronRight, Warning } from "./icons";
import { supabase } from "../lib/supabase";
import type { Alert as DbAlert } from "../lib/database.types";

type AlertSeverity = "critical" | "high" | "moderate" | "info";
type AckState = "idle" | "loading" | "done";

interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  desc: string;
  distance: string;
  time: string;
  action: string;
  incidentId?: string;
}

const ALERTS: Alert[] = [
  {
    id: "ALT-001",
    severity: "critical",
    title: "NH-6 Km 31–34 high risk — landslide predicted",
    desc: "ML model confidence 78%. Predicted landslide event within 11 min. Current route passes through flagged segment.",
    distance: "5 km ahead",
    time: "09:41",
    action: "Avoid Km 31–34 immediately. Take Lumshnong bypass. Notify control room.",
    incidentId: "INC-2291",
  },
  {
    id: "ALT-002",
    severity: "high",
    title: "SH-5 Km 31–34 full blockage — vehicle unable to pass",
    desc: "Construction lorry AS-07-TR-0091 blocked at Km 31. Road cleared partially. Single-lane movement only.",
    distance: "6.2 km",
    time: "09:28",
    action: "Coordinate with logistics officer. Dispatch field team for clearance.",
    incidentId: "INC-2287",
  },
  {
    id: "ALT-003",
    severity: "high",
    title: "Flood warning — Umiam river level rising",
    desc: "Water level at 4.8m, monitoring threshold is 5.0m. Risk of overflow near Umiam bridge within 2h.",
    distance: "12 km",
    time: "09:15",
    action: "Monitor every 30 min. Alert district coordinator if level reaches 5m.",
    incidentId: "INC-2280",
  },
  {
    id: "ALT-004",
    severity: "moderate",
    title: "NH-6 Km 22–26 wet slope — reduced speed advisory",
    desc: "Rainfall has caused surface runoff on NH-6. Traction reduced. No blockage currently.",
    distance: "4 km",
    time: "08:52",
    action: "Reduce speed to 30 km/h. Avoid overtaking on slope section.",
  },
  {
    id: "ALT-005",
    severity: "moderate",
    title: "LOG-4451 convoy delayed — rerouting in progress",
    desc: "Shipment of construction material from Lumding delayed 2h 15m due to SH-5 blockage. Rerouting via bypass.",
    distance: "Field update",
    time: "09:30",
    action: "Update receiving station at Umiam. Confirm new ETA with logistics control.",
  },
  {
    id: "ALT-006",
    severity: "info",
    title: "Daily sync complete — all field reports uploaded",
    desc: "3 incident reports, 2 task completions, and 1 route inspection synced to district server at 09:38.",
    distance: "System",
    time: "09:38",
    action: "No action required.",
  },
  {
    id: "ALT-007",
    severity: "info",
    title: "Weather update — heavy rain forecast Ri Bhoi",
    desc: "IMD forecast: 80–120mm rainfall expected in next 6h. Elevated landslide risk in hilly terrain.",
    distance: "District",
    time: "09:00",
    action: "Heighten vigilance on NH-6 and SH-5 hill sections.",
  },
];

const TABS: { id: AlertSeverity; label: string }[] = [
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "moderate", label: "Moderate" },
  { id: "info", label: "Info" },
];

const SEV: Record<AlertSeverity, { bg: string; border: string; icon: string; badgeBg: string; badgeText: string; tabBadge: string }> = {
  critical: { bg: "bg-critical/5",    border: "border-critical/40", icon: "text-critical", badgeBg: "bg-critical",  badgeText: "text-white",  tabBadge: "bg-critical text-white" },
  high:     { bg: "bg-saffron/5",     border: "border-saffron/40",  icon: "text-saffron",  badgeBg: "bg-saffron",   badgeText: "text-white",  tabBadge: "bg-saffron text-white" },
  moderate: { bg: "bg-navy/[0.03]",   border: "border-navy/20",     icon: "text-navy",     badgeBg: "bg-navy/10",   badgeText: "text-navy",   tabBadge: "bg-navy/15 text-navy" },
  info:     { bg: "bg-[#f0f1ec]",     border: "border-hairline",    icon: "text-ink",      badgeBg: "bg-ink/10",    badgeText: "text-ink",    tabBadge: "bg-ink/10 text-ink" },
};

// Map a DB alert row to the local Alert shape.
function dbAlertToUi(a: DbAlert): Alert {
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };
  const sev = (a.severity === "medium" ? "moderate" : a.severity) as AlertSeverity;
  return {
    id: a.alert_ref ?? a.id.slice(0, 8).toUpperCase(),
    severity: sev,
    title: a.title,
    desc: a.description ?? "",
    distance: a.distance_text ?? "System",
    time: formatTime(a.created_at),
    action: a.action_text ?? "No action required.",
    incidentId: a.incident_id ?? undefined,
  };
}

export default function AlertsScreen({ onCriticalTap }: { onCriticalTap?: () => void }) {
  const [alerts, setAlerts] = useState<Alert[]>(ALERTS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AlertSeverity>("critical");
  const [ackMap, setAckMap] = useState<Record<string, AckState>>({});

  // Fetch active alerts for the current user's role from Supabase.
  useEffect(() => {
    let cancelled = false;
    async function fetchAlerts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("alerts")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(50);

        if (!cancelled && !error && data && data.length > 0) {
          setAlerts(data.map(dbAlertToUi));
        }
        // Keep mock data if no rows returned.
      } catch {
        // Network error — keep mock data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAlerts();

    // Subscribe to new alerts in real time.
    const channel = supabase
      .channel("alerts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        (payload) => {
          if (cancelled) return;
          const newAlert = dbAlertToUi(payload.new as DbAlert);
          setAlerts((prev) => [newAlert, ...prev]);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = alerts.filter((a) => a.severity === activeTab);

  const getAck = (id: string): AckState => ackMap[id] ?? "idle";

  const handleAck = async (id: string) => {
    setAckMap((m) => ({ ...m, [id]: "loading" }));
    // Persist acknowledgement
    const { data: row } = await supabase
      .from("alerts")
      .select("id")
      .eq("alert_ref", id)
      .maybeSingle();
    if (row) {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase
        .from("alerts")
        .update({ status: "acknowledged", acknowledged_by: session?.user.id ?? null, acknowledged_at: new Date().toISOString() })
        .eq("id", row.id);
    }
    setAckMap((m) => ({ ...m, [id]: "done" }));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-paper">
      {/* Severity tab bar */}
      <div className="shrink-0 border-b border-hairline bg-white px-4 pt-2">
        <div className="flex">
          {TABS.map((t) => {
            const active = t.id === activeTab;
            const count = alerts.filter((a) => a.severity === t.id).length;
            const cfg = SEV[t.id];
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative flex items-center gap-1.5 px-3 pb-2.5 pt-1.5 font-public text-[13px] font-semibold transition-colors duration-150 ${
                  active ? "text-navy" : "text-ink"
                }`}
              >
                {t.label}
                {count > 0 && (
                  <span className={`inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${cfg.tabBadge}`}>
                    {count}
                  </span>
                )}
                {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-navy" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alert list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell size={36} className="text-ink/30" />
            <p className="mt-3 font-public text-[16px] font-semibold text-ink/50">No {activeTab} alerts</p>
            <p className="mt-1 font-noto text-[14px] text-ink/40">All clear in this category</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((alert) => {
              const cfg = SEV[alert.severity];
              const ack = getAck(alert.id);
              return (
                <div key={alert.id} className={`overflow-hidden rounded-md border ${cfg.border} ${cfg.bg} transition-all duration-150`}>
                  {/* Header */}
                  <div className="flex items-start gap-3 px-4 pb-2 pt-3.5">
                    <Warning size={18} className={`mt-0.5 shrink-0 ${cfg.icon}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-public text-[10px] font-bold uppercase tracking-wide ${cfg.badgeBg} ${cfg.badgeText}`}>
                          {alert.severity}
                        </span>
                        <span className="shrink-0 font-noto text-[12px] text-ink/60">{alert.time}</span>
                      </div>
                      <p className="mt-1.5 font-public text-[15px] font-semibold leading-snug text-navy">{alert.title}</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-4 pb-2">
                    <p className="font-noto text-[14px] leading-snug text-ink">{alert.desc}</p>
                    <p className="mt-1 font-noto text-[12px] text-ink/55">📍 {alert.distance}</p>
                  </div>

                  {/* Recommended action */}
                  <div className="mx-4 mb-3 rounded border border-hairline bg-white/70 px-3 py-2">
                    <p className="font-public text-[10px] font-bold uppercase tracking-wide text-ink/50">Recommended action</p>
                    <p className="mt-0.5 font-noto text-[13px] leading-snug text-navy">{alert.action}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 border-t border-hairline px-4 py-2.5">
                    {alert.incidentId && (
                      <button
                        onClick={alert.severity === "critical" ? onCriticalTap : undefined}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded border border-navy py-2 font-public text-[13px] font-semibold text-navy active:bg-navy/5"
                      >
                        View incident <ChevronRight size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => ack === "idle" && handleAck(alert.id)}
                      disabled={ack === "done"}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded py-2 font-public text-[13px] font-semibold transition-all duration-150 ${
                        ack === "done"
                          ? "border border-clear/40 bg-clear/10 text-clear"
                          : ack === "loading"
                          ? "bg-ink/10 text-ink"
                          : "border border-navy/20 bg-navy/5 text-navy active:bg-navy/10"
                      }`}
                    >
                      {ack === "done" ? (
                        <><Check size={14} className="text-clear" /> Acknowledged</>
                      ) : ack === "loading" ? (
                        <><span style={{ animation: "spinSlow 0.9s linear infinite" }} className="block h-3.5 w-3.5 rounded-full border-2 border-ink/30 border-t-ink" />Acknowledging…</>
                      ) : (
                        "Acknowledge"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-4 pb-2 text-center font-noto text-[12px] text-ink/40">
          {alerts.filter((a) => a.severity === "critical").length} critical · {alerts.filter((a) => a.severity === "high").length} high · updated {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })}
        </p>
      </div>
    </div>
  );
}
