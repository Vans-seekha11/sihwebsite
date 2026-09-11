import { useState } from "react";
import { ChevronLeft, MapPin, Clock, Warning } from "./icons";
import { RiskBadge } from "./shared";
import type { RiskLevel } from "./shared";

interface RouteDetail {
  floodRisk: string;
  landslideRisk: string;
  blockage: string;
  history: string;
  action: string;
}

interface Route {
  id: string;
  name: string;
  score: number;
  risk: RiskLevel;
  condition: string;
  incidents: number;
  weather: string;
  updated: string;
  detail: RouteDetail;
}

const routes: Route[] = [
  {
    id: "NH-6",
    name: "NH-6 Lumding–Sabroom",
    score: 72,
    risk: "caution",
    condition: "Fair — wet slope Km 22–26",
    incidents: 2,
    weather: "Light rain, 18°C",
    updated: "09:38",
    detail: {
      floodRisk: "Low",
      landslideRisk: "Moderate",
      blockage: "Km 22–26 (active)",
      history: "3 incidents this week",
      action: "Reduce speed, monitor Km 22–26",
    },
  },
  {
    id: "NH-27",
    name: "NH-27 Shillong–Silchar",
    score: 88,
    risk: "clear",
    condition: "Good — no active incidents",
    incidents: 0,
    weather: "Partly cloudy, 22°C",
    updated: "09:35",
    detail: {
      floodRisk: "Low",
      landslideRisk: "Low",
      blockage: "None",
      history: "0 incidents this week",
      action: "Proceed normally",
    },
  },
  {
    id: "SH-5",
    name: "SH-5 Nongpoh–Umiam",
    score: 41,
    risk: "critical",
    condition: "Poor — Km 31–34 blocked",
    incidents: 3,
    weather: "Heavy rain, 15°C",
    updated: "09:41",
    detail: {
      floodRisk: "High",
      landslideRisk: "High",
      blockage: "Km 31–34 (full blockage)",
      history: "7 incidents this week",
      action: "Avoid — use Lumshnong bypass",
    },
  },
  {
    id: "PMGSY-L",
    name: "Lumshnong Bypass (PMGSY)",
    score: 93,
    risk: "clear",
    condition: "Good — clear alternate route",
    incidents: 0,
    weather: "Overcast, 16°C",
    updated: "09:40",
    detail: {
      floodRisk: "Low",
      landslideRisk: "Low",
      blockage: "None",
      history: "1 incident this week",
      action: "Recommended alternate for SH-5",
    },
  },
];

function scoreColor(score: number): string {
  if (score >= 80) return "bg-clear";
  if (score >= 50) return "bg-saffron";
  return "bg-critical";
}

function scoreTextColor(score: number): string {
  if (score >= 80) return "text-clear";
  if (score >= 50) return "text-saffron";
  return "text-critical";
}

function actionBorderColor(risk: RiskLevel): string {
  if (risk === "clear") return "border-clear/40 bg-[#e8f5ee]";
  if (risk === "caution") return "border-saffron/40 bg-saffron/10";
  return "border-critical/40 bg-critical/5";
}

function actionTextColor(risk: RiskLevel): string {
  if (risk === "clear") return "text-clear";
  if (risk === "caution") return "text-[#7a4310]";
  return "text-critical";
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-public text-[11px] font-semibold uppercase tracking-wide text-ink/60">
        {label}
      </span>
      <span className="font-noto text-[14px] text-navy">{value}</span>
    </div>
  );
}

function RouteDetailView({
  route,
  onBack,
}: {
  route: Route;
  onBack: () => void;
}) {
  const [toastVisible, setToastVisible] = useState(false);

  function handleIncidents() {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Back row */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 px-4 py-3 text-navy transition-all duration-150 active:opacity-60"
      >
        <ChevronLeft size={18} strokeWidth={2} />
        <span className="font-public text-[14px] font-semibold">Route Status</span>
      </button>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* Heading */}
        <h2 className="font-public text-[18px] font-bold text-navy">{route.name}</h2>
        <p className="mt-0.5 font-noto text-[13px] text-ink">Updated {route.updated}</p>

        {/* Score + badge row */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className={`font-public text-[36px] font-bold leading-none ${scoreTextColor(route.score)}`}>
              {route.score}
            </span>
            <span className="font-public text-[11px] text-ink/60">/100</span>
            <span className="mt-0.5 font-public text-[11px] font-semibold uppercase tracking-wide text-ink/60">
              Accessibility
            </span>
          </div>
          <div className="h-14 w-px bg-ink/10" />
          <RiskBadge level={route.risk} />
        </div>

        {/* Score bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className={`h-full rounded-full transition-all duration-150 ${scoreColor(route.score)}`}
            style={{ width: `${route.score}%` }}
          />
        </div>

        {/* Detail grid */}
        <div className="mt-5 rounded-md border border-ink/20 bg-paper">
          <div className="grid grid-cols-2 gap-0">
            {[
              ["Flood Risk", route.detail.floodRisk],
              ["Landslide Risk", route.detail.landslideRisk],
              ["Blockage", route.detail.blockage],
              ["Condition", route.condition],
              ["Weather", route.weather],
              ["Incidents", `${route.incidents} active`],
            ].map(([label, value], i) => (
              <div
                key={label}
                className={`px-3 py-3 ${i % 2 === 0 ? "border-r border-ink/10" : ""} ${i < 4 ? "border-b border-ink/10" : ""}`}
              >
                <DetailField label={label} value={value} />
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="mt-4 flex items-center gap-2 rounded-md border border-ink/20 bg-paper px-3 py-3">
          <Clock size={15} strokeWidth={1.75} className="shrink-0 text-ink" />
          <span className="font-noto text-[14px] text-ink">{route.detail.history}</span>
        </div>

        {/* Recommended action */}
        <div className={`mt-4 rounded-md border px-3 py-3 ${actionBorderColor(route.risk)}`}>
          <p className="font-public text-[11px] font-semibold uppercase tracking-wide text-ink/60">
            Recommended Action
          </p>
          <p className={`mt-1 font-noto text-[14px] font-semibold ${actionTextColor(route.risk)}`}>
            {route.detail.action}
          </p>
        </div>

        {/* All incidents button */}
        <button
          onClick={handleIncidents}
          className="mt-4 w-full rounded-md border border-navy/30 bg-paper px-4 py-2.5 font-public text-[14px] font-semibold text-navy transition-all duration-150 active:opacity-60"
        >
          All incidents on this route
        </button>
      </div>

      {/* Toast */}
      {toastVisible && (
        <div className="absolute bottom-20 left-4 right-4 rounded-md bg-navy px-4 py-3 shadow-none">
          <p className="font-public text-[13px] text-white">Incident history is available when connected to network.</p>
        </div>
      )}
    </div>
  );
}

function RouteCard({ route, onSelect }: { route: Route; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="w-full rounded-md border border-ink/20 bg-paper px-3 py-3 text-left transition-all duration-150 active:opacity-70"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-navy px-2 py-0.5 font-public text-[11px] font-bold text-white">
            {route.id}
          </span>
          <span className="font-public text-[14px] font-semibold text-navy">{route.name}</span>
        </div>
        <RiskBadge level={route.risk} />
      </div>

      {/* Score bar */}
      <div className="mt-2.5 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
          <div
            className={`h-full rounded-full ${scoreColor(route.score)}`}
            style={{ width: `${route.score}%` }}
          />
        </div>
        <span className={`font-public text-[13px] font-bold ${scoreTextColor(route.score)}`}>
          {route.score}/100
        </span>
      </div>

      {/* Condition */}
      <p className="mt-2 font-noto text-[14px] text-ink">{route.condition}</p>

      {/* Bottom meta row */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {route.incidents > 0 && (
          <span className="flex items-center gap-1 font-public text-[12px] text-critical">
            <Warning size={12} strokeWidth={2} />
            {route.incidents} incident{route.incidents !== 1 ? "s" : ""}
          </span>
        )}
        <span className="flex items-center gap-1 font-public text-[12px] text-ink">
          <MapPin size={12} strokeWidth={1.75} />
          {route.weather}
        </span>
        <span className="flex items-center gap-1 font-public text-[12px] text-ink/60">
          <Clock size={12} strokeWidth={1.75} />
          {route.updated}
        </span>
      </div>
    </button>
  );
}

export default function RouteStatusScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = routes.find((r) => r.id === selectedId) ?? null;

  if (selected) {
    return (
      <div className="relative flex h-full flex-col bg-paper">
        <RouteDetailView route={selected} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-paper">
      {/* Sub-header */}
      <div className="border-b border-ink/10 px-4 py-2">
        <p className="font-public text-[13px] text-ink/60">
          4 routes monitored · Ri Bhoi district
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex flex-col gap-3">
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onSelect={() => setSelectedId(route.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
