import { useState } from "react";
import ProfileScreen from "../ProfileScreen";
import {
  Home,
  MapPin,
  Warning,
  RouteNodes,
  Truck,
  Check,
  Sparkle,
  Bell,
  FileText,
  BarChart,
  Menu,
  XIcon,
  ChevronRight,
  ChevronLeft,
  Clock,
  Download,
  Plus,
} from "../icons";
import type { Role } from "../LoginScreen";
import { AshokaChakra } from "../AshokaChakra";
import { DistrictMap, type Layer } from "./DistrictMap";
import {
  DemoTag,
  PriorityBadge,
  AccessScore,
  accessBand,
  Card,
  KpiTile,
  SectionTitle,
  AiCard,
  StatusChip,
  ScrollTabs,
  AlertBanner,
  type Priority,
} from "./DistrictShared";

// District Officer identity accent — the ONLY new color. Used strictly for
// DO identity chrome (badge, active nav, role switcher). Never for risk.
const GOLD = "#d9a441";

const DISTRICT = "Kamrup Metro, Assam";
const PORTAL = "NER Operations Portal";

type NavId =
  | "overview"
  | "map"
  | "incidents"
  | "routes"
  | "logistics"
  | "tasks"
  | "ai"
  | "alerts"
  | "reports"
  | "analytics";

const NAV: { id: NavId; label: string; Icon: typeof Home; badge?: number }[] = [
  { id: "overview", label: "Dashboard", Icon: Home },
  { id: "map", label: "District Map", Icon: MapPin },
  { id: "incidents", label: "Incidents", Icon: Warning, badge: 2 },
  { id: "routes", label: "Routes", Icon: RouteNodes },
  { id: "logistics", label: "Logistics", Icon: Truck },
  { id: "tasks", label: "Tasks", Icon: Check },
  { id: "ai", label: "AI Insights", Icon: Sparkle },
  { id: "alerts", label: "Alerts", Icon: Bell, badge: 3 },
  { id: "reports", label: "Reports", Icon: FileText },
  { id: "analytics", label: "Analytics", Icon: BarChart },
];

export default function DistrictOfficerApp({
  role,
  onSignOut,
  onProfileUpdated,
}: {
  role: Role;
  onSignOut: () => void;
  onProfileUpdated: () => Promise<void>;
}) {
  void role;
  const [screen, setScreen] = useState<NavId>("overview");
  const [drawer, setDrawer] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const go = (id: NavId) => {
    setScreen(id);
    setDrawer(false);
  };

  const pageLabel = NAV.find((n) => n.id === screen)!.label;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-paper font-noto">
      {/* ── Top bar ── */}
      <div className="relative z-20 shrink-0 bg-navy px-4 pt-3 pb-3 text-white">
        <div className="flex items-center justify-between">
          <span className="font-public text-[15px] font-bold tracking-tight">09:41</span>
          <div className="flex items-center gap-1.5 text-white/80">
            <StatusGlyphs />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={() => setDrawer(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/25 bg-white/10 active:bg-white/20"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-noto text-[11px] text-white/60">
              NER Platform › District Officer › {pageLabel}
            </p>
            <h1 className="truncate font-public text-[20px] font-bold leading-tight">{pageLabel}</h1>
          </div>
          <button
            onClick={() => setProfileOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-public text-[13px] font-extrabold text-navy transition-transform active:scale-90"
            style={{ background: GOLD }}
            aria-label="Profile"
          >
            DO
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          <Screen id={screen} go={go} />
        </div>
      </div>

      {/* ── Drawer ── */}
      {drawer && <Drawer screen={screen} go={go} onClose={() => setDrawer(false)} />}

      {profileOpen && (
        <ProfileScreen
          profileRole="district"
          onClose={() => setProfileOpen(false)}
          onSignOut={onSignOut}
          onUpdated={() => void onProfileUpdated()}
        />
      )}
    </div>
  );
}

// ── Screen router ──
function Screen({ id, go }: { id: NavId; go: (id: NavId) => void }) {
  switch (id) {
    case "overview":
      return <Dashboard go={go} />;
    case "map":
      return <DistrictMapScreen />;
    case "incidents":
      return <Incidents />;
    case "routes":
      return <Routes />;
    case "logistics":
      return <Logistics />;
    case "tasks":
      return <Tasks />;
    case "ai":
      return <AiInsights />;
    case "alerts":
      return <Alerts />;
    case "reports":
      return <Reports />;
    case "analytics":
      return <Analytics />;
  }
}

// ════════════════════════════════════════════════════════════════
// Drawer
// ════════════════════════════════════════════════════════════════
function Drawer({
  screen,
  go,
  onClose,
}: {
  screen: NavId;
  go: (id: NavId) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex" style={{ animation: "quietFade 140ms ease-out" }}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative flex h-full w-[82%] max-w-[310px] flex-col bg-navy text-white"
        style={{ animation: "slideRight 200ms ease-out" }}
      >
        {/* identity */}
        <div className="flex items-center gap-3 px-4 pb-4 pt-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
            style={{ background: GOLD }}
          >
            <span className="font-public text-[16px] font-bold text-navy">DO</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-public text-[15px] font-bold leading-tight">District Officer</p>
            <p className="truncate font-noto text-[11.5px] text-white/60">{PORTAL}</p>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="text-white/70 active:text-white">
            <XIcon size={20} />
          </button>
        </div>

        {/* active district */}
        <div className="mx-4 rounded-md border border-white/12 bg-white/[0.06] px-3 py-2.5">
          <p className="font-public text-[10px] font-bold uppercase tracking-[0.1em] text-white/50">
            Active District
          </p>
          <p className="mt-0.5 font-public text-[14px] font-bold">{DISTRICT}</p>
          <p className="mt-1 flex items-center gap-1.5 font-noto text-[11.5px] text-white/70">
            <span className="h-2 w-2 rounded-full bg-clear" /> System Online
          </p>
        </div>

        {/* main menu */}
        <p className="px-4 pb-1 pt-4 font-public text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">
          Main Menu
        </p>
        <nav className="min-h-0 flex-1 overflow-y-auto pb-2">
          {NAV.map(({ id, label, Icon, badge }) => {
            const on = screen === id;
            return (
              <button
                key={id}
                onClick={() => go(id)}
                className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  on ? "bg-white/[0.07]" : "active:bg-white/5"
                }`}
              >
                {on && (
                  <span className="absolute left-0 top-1 bottom-1 w-1 rounded-r" style={{ background: GOLD }} />
                )}
                <span style={on ? { color: GOLD } : undefined} className={on ? "" : "text-white/70"}>
                  <Icon size={20} strokeWidth={on ? 2.1 : 1.75} />
                </span>
                <span
                  className={`flex-1 font-public text-[15px] ${
                    on ? "font-bold text-white" : "font-medium text-white/70"
                  }`}
                >
                  {label}
                </span>
                {badge != null && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-critical px-1 font-public text-[11px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PageHead + small shared bits
// ════════════════════════════════════════════════════════════════
function PageHead({
  title,
  subtitle,
  badge,
  action,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-public text-[20px] font-bold leading-tight text-navy">{title}</h2>
          <p className="mt-1 font-noto text-[13px] leading-snug text-ink">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {badge && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-clear/30 bg-[#e8f5ee] px-2.5 py-1 font-public text-[11px] font-semibold text-clear">
            <span className="h-1.5 w-1.5 rounded-full bg-clear" />
            {badge}
          </span>
        )}
        <DemoTag />
      </div>
    </div>
  );
}

function HeadBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[44px] shrink-0 items-center rounded-md bg-navy px-3.5 font-public text-[13px] font-bold text-white active:bg-navy-pressed"
    >
      {children}
    </button>
  );
}

// six-item district map legend (color + text)
function DistrictLegend() {
  const rows: { c: string; label: string; outline?: boolean }[] = [
    { c: "#1e6b45", label: "Open Route" },
    { c: "#d97a1f", label: "Restricted" },
    { c: "#b3261e", label: "Closed-Blocked" },
    { c: "#b3261e", label: "Critical Incident" },
    { c: "#d97a1f", label: "Active Incident" },
    { c: "#0e2a47", label: "Safe Zone", outline: true },
  ];
  return (
    <div className="rounded-md border border-hairline bg-white px-3 py-2.5">
      <p className="mb-1.5 font-public text-[12px] font-bold text-navy">Legend</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={
                r.outline
                  ? { border: `2px solid ${r.c}`, background: "transparent" }
                  : { background: r.c }
              }
            />
            <span className="font-noto text-[12px] text-ink">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// AI disruption-probability row (bar + window + confidence + factor tags)
function RiskBar({ pct, tone }: { pct: number; tone: "critical" | "saffron" | "navy" }) {
  const bar = tone === "critical" ? "bg-critical" : tone === "saffron" ? "bg-saffron" : "bg-navy";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
      <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function FactorTags({ tags }: { tags: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t} className="rounded border border-hairline bg-[#f4f5f1] px-2 py-0.5 font-noto text-[11px] text-ink">
          {t}
        </span>
      ))}
    </div>
  );
}

interface RiskPred {
  route: string;
  prob: number;
  tone: "critical" | "saffron" | "navy";
  window: string;
  confidence: number;
  tags: string[];
}
const RISK_PREDS: RiskPred[] = [
  { route: "NH-27", prob: 94, tone: "critical", window: "Next 3 hrs", confidence: 94, tags: ["Heavy rain", "River level", "3 prior floods"] },
  { route: "NH-13", prob: 78, tone: "saffron", window: "Next 6 hrs", confidence: 78, tags: ["Structural fatigue", "Overnight rain"] },
  { route: "NH-306", prob: 64, tone: "saffron", window: "Next 12 hrs", confidence: 64, tags: ["Slope saturation", "Forecast rain"] },
];

function RiskPredRow({ p }: { p: RiskPred }) {
  return (
    <div className="border-t border-hairline px-3.5 py-3 first:border-t-0">
      <div className="flex items-center justify-between">
        <span className="font-public text-[14px] font-bold text-navy">{p.route}</span>
        <span className={`font-public text-[15px] font-bold ${p.tone === "critical" ? "text-critical" : "text-saffron"}`}>
          {p.prob}%
        </span>
      </div>
      <p className="mb-1.5 mt-0.5 font-noto text-[11.5px] text-ink/70">Disruption probability</p>
      <RiskBar pct={p.prob} tone={p.tone} />
      <div className="mt-2 flex items-center justify-between font-noto text-[12px] text-ink">
        <span className="flex items-center gap-1">
          <Clock size={12} /> {p.window}
        </span>
        <span>{p.confidence}% confidence</span>
      </div>
      <FactorTags tags={p.tags} />
      <p className="mt-2 font-noto text-[10.5px] italic text-ink/60">AI-generated estimate</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 1 · Dashboard
// ════════════════════════════════════════════════════════════════
interface DashAlert {
  severity: Priority;
  title: string;
  location: string;
  time: string;
  source: string;
}
const DASH_ALERTS: DashAlert[] = [
  { severity: "critical", title: "Flash flood warning", location: "NH-27, Barpeta", time: "8 min ago", source: "Sensor + Citizen SMS" },
  { severity: "critical", title: "Bridge damage reported", location: "Tawang, NH-13", time: "25 min ago", source: "Field officer" },
  { severity: "high", title: "3 convoys at risk", location: "NH-2 Zone", time: "40 min ago", source: "Fleet system" },
];

interface QueueRow {
  id: string;
  type: string;
  location: string;
  severity: Priority;
  status: string;
  statusTone: "critical" | "saffron" | "navy" | "clear";
}
const DASH_QUEUE: QueueRow[] = [
  { id: "INC-2026-041", type: "Flash Flood", location: "Barpeta", severity: "critical", status: "Pending", statusTone: "saffron" },
  { id: "INC-2026-042", type: "Convoy At Risk", location: "NH-2 Zone", severity: "high", status: "Pending", statusTone: "saffron" },
  { id: "INC-2026-043", type: "Bridge Damage", location: "Tawang", severity: "critical", status: "Escalated", statusTone: "critical" },
  { id: "INC-2026-044", type: "Landslide", location: "NH-306 Km 54", severity: "high", status: "Active", statusTone: "navy" },
  { id: "INC-2026-045", type: "Road Blockage", location: "NH-6 Km 120", severity: "medium", status: "Active", statusTone: "navy" },
];

function Dashboard({ go }: { go: (id: NavId) => void }) {
  const [acked, setAcked] = useState<Record<number, boolean>>({});
  return (
    <div>
      <PageHead
        title="District Operations"
        subtitle="Real-time district connectivity, logistics and incident intelligence"
        badge="Demo Data — Live Monitoring Active"
        action={<HeadBtn onClick={() => go("reports")}>Generate Report</HeadBtn>}
      />

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        <KpiTile label="Active Incidents" value="24" tone="critical" hint="+3 vs yesterday" onClick={() => go("incidents")} />
        <KpiTile label="Blocked Routes" value="07" tone="saffron" hint="+2 vs yesterday" onClick={() => go("routes")} />
        <KpiTile label="High-Risk Routes" value="12" tone="saffron" hint="+1 vs yesterday" onClick={() => go("routes")} />
        <KpiTile label="Active Logistics" value="86" tone="navy" hint="−4 vs yesterday" onClick={() => go("logistics")} />
        <KpiTile label="Pending Reports" value="18" tone="navy" hint="+5 vs yesterday" onClick={() => go("reports")} />
        <KpiTile label="Avg Response Time" value="42m" tone="clear" hint="−8% week" onClick={() => go("analytics")} />
      </div>

      {/* Map */}
      <SectionTitle
        action={
          <button onClick={() => go("map")} className="font-public text-[13px] font-semibold text-navy">
            Full Map
          </button>
        }
      >
        District Map
      </SectionTitle>
      <Card className="overflow-hidden">
        <div className="h-[170px] w-full">
          <DistrictMap layers={{ roads: true, risk: true, incidents: true, vehicles: true, infra: false }} height={170} />
        </div>
      </Card>
      <div className="mt-2.5">
        <DistrictLegend />
      </div>

      {/* Critical Alerts */}
      <SectionTitle
        action={
          <button onClick={() => go("alerts")} className="font-public text-[13px] font-semibold text-navy">
            View All
          </button>
        }
      >
        Critical Alerts
      </SectionTitle>
      <p className="-mt-1 mb-2.5 font-noto text-[12px] text-critical">3 unacknowledged</p>
      <div className="flex flex-col gap-2.5">
        {DASH_ALERTS.map((a, i) => (
          <Card key={i} className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <span className="font-public text-[14px] font-bold text-navy">{a.title}</span>
              <PriorityBadge level={a.severity} />
            </div>
            <p className="mt-1 flex items-center gap-1 font-noto text-[12px] text-ink">
              <MapPin size={12} className="text-ink/60" /> {a.location} · {a.time}
            </p>
            <p className="mt-1 font-noto text-[11px] text-ink/60">Source: {a.source}</p>
            <div className="mt-2.5 flex gap-2">
              <MiniBtn>View</MiniBtn>
              {acked[i] ? (
                <span className="inline-flex items-center gap-1 rounded border border-clear/30 bg-[#e8f5ee] px-2.5 py-1.5 font-public text-[12px] font-semibold text-clear">
                  <Check size={13} /> Acknowledged
                </span>
              ) : (
                <MiniBtn primary onClick={() => setAcked((s) => ({ ...s, [i]: true }))}>
                  Acknowledge
                </MiniBtn>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Incident Queue */}
      <SectionTitle
        action={
          <button onClick={() => go("incidents")} className="font-public text-[13px] font-semibold text-navy">
            View All
          </button>
        }
      >
        Incident Queue
      </SectionTitle>
      <div className="flex flex-col gap-2.5">
        {DASH_QUEUE.map((q) => (
          <Card key={q.id} onClick={() => go("incidents")} className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-navy px-1.5 py-0.5 font-public text-[11px] font-bold text-white">{q.id}</span>
                <span className="font-public text-[14px] font-semibold text-navy">{q.type}</span>
              </div>
              <PriorityBadge level={q.severity} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="flex items-center gap-1 font-noto text-[12px] text-ink">
                <MapPin size={12} className="text-ink/60" /> {q.location}
              </span>
              <div className="flex items-center gap-2">
                <StatusChip tone={q.statusTone}>{q.status}</StatusChip>
                <span className="font-public text-[13px] font-semibold text-navy">View →</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <SectionTitle
        action={
          <button onClick={() => go("ai")} className="font-public text-[13px] font-semibold text-navy">
            View All
          </button>
        }
      >
        AI Insights
      </SectionTitle>
      <Card>
        {RISK_PREDS.map((p) => (
          <RiskPredRow key={p.route} p={p} />
        ))}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 2 · District Map
// ════════════════════════════════════════════════════════════════
const MAP_LAYER_OPTS: { key: string; label: string }[] = [
  { key: "roads", label: "Roads" },
  { key: "incidents", label: "Incidents" },
  { key: "flood", label: "Flood Risk" },
  { key: "landslide", label: "Landslide Risk" },
  { key: "logistics", label: "Logistics" },
  { key: "infra", label: "Infrastructure" },
];

interface MapRoute {
  id: string;
  status: string;
}
const MAP_ROUTES: MapRoute[] = [
  { id: "NH-27", status: "Blocked" },
  { id: "NH-2", status: "Restricted" },
  { id: "NH-308", status: "Restricted" },
  { id: "NH-6", status: "Restricted" },
  { id: "NH-13", status: "Closed" },
  { id: "NH-40", status: "Open" },
  { id: "NH-10", status: "Open" },
];

function routeStatusTone(status: string): "critical" | "saffron" | "clear" {
  if (status === "Blocked" || status === "Closed") return "critical";
  if (status === "Restricted") return "saffron";
  return "clear";
}
function RouteStatusChip({ status }: { status: string }) {
  const tone = routeStatusTone(status);
  return (
    <StatusChip tone={tone}>
      {tone === "clear" ? <Check size={12} /> : <Warning size={12} />}
      {status}
    </StatusChip>
  );
}

function DistrictMapScreen() {
  const [layers, setLayers] = useState<Record<string, boolean>>({
    roads: true,
    incidents: true,
    flood: true,
    landslide: true,
    logistics: true,
    infra: true,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sim, setSim] = useState(false);

  const mapLayers: Record<Layer, boolean> = {
    roads: layers.roads,
    incidents: layers.incidents,
    risk: layers.flood || layers.landslide,
    vehicles: layers.logistics,
    infra: layers.infra,
  };

  return (
    <div>
      <PageHead
        title="District Map"
        subtitle="Geospatial intelligence — routes, incidents, logistics"
        action={<HeadBtn onClick={() => setSim((v) => !v)}>Simulate Closure</HeadBtn>}
      />

      {sim && (
        <div className="mb-3">
          <AiCard kind="Simulation result" title="Closing NH-27 (demo)">
            <ul className="ml-4 list-disc space-y-1">
              <li>Affected convoys: LG-102, LG-115 rerouted</li>
              <li>Added delay: ~34 min average</li>
              <li>Recommended alternate: NH-37 via Jorhat</li>
            </ul>
          </AiCard>
        </div>
      )}

      {/* filter drawer */}
      <button
        onClick={() => setFiltersOpen((v) => !v)}
        className="flex min-h-[44px] w-full items-center justify-between rounded-md border border-hairline bg-white px-3.5 font-public text-[14px] font-semibold text-navy"
      >
        Map Filters
        <ChevronRight size={18} className={`text-ink/50 transition-transform ${filtersOpen ? "rotate-90" : ""}`} />
      </button>
      {filtersOpen && (
        <Card className="mt-2 p-3.5" >
          <Field label="Map Layers">
            <div className="flex flex-col gap-2">
              {MAP_LAYER_OPTS.map((l) => (
                <label key={l.key} className="flex items-center gap-2.5 font-noto text-[13px] text-navy">
                  <input
                    type="checkbox"
                    checked={!!layers[l.key]}
                    onChange={() => setLayers((s) => ({ ...s, [l.key]: !s[l.key] }))}
                    className="h-4 w-4 accent-[#0e2a47]"
                  />
                  {l.label}
                </label>
              ))}
            </div>
          </Field>
          <div className="mt-3">
            <Field label="Risk Level">
              <SelectMock options={["Low", "Moderate", "High", "Critical"]} />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Time Range">
              <SelectMock options={["Last 1 hour", "Last 6 hours", "Last 24 hours", "Last 7 days"]} />
            </Field>
          </div>
        </Card>
      )}

      {/* map */}
      <Card className="mt-3 overflow-hidden">
        <div className="h-[300px] w-full">
          <DistrictMap layers={mapLayers} height={300} />
        </div>
      </Card>
      <div className="mt-2.5">
        <DistrictLegend />
      </div>

      {/* routes list */}
      <SectionTitle>Routes</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {MAP_ROUTES.map((r) => (
          <Card key={r.id} className="flex items-center justify-between p-3.5">
            <span className="rounded bg-navy px-2 py-0.5 font-public text-[12px] font-bold text-white">{r.id}</span>
            <RouteStatusChip status={r.status} />
          </Card>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 3 · Incidents
// ════════════════════════════════════════════════════════════════
type IncTab = "all" | "pending" | "active" | "escalated" | "resolved";

interface Incident {
  id: string;
  type: string;
  location: string;
  route: string;
  severity: Priority;
  reporter: string;
  time: string;
  verified: boolean;
  officer: string;
  status: IncTab;
}

const INCIDENTS: Incident[] = [
  { id: "INC-2026-041", type: "Flash Flood", location: "Barpeta", route: "NH-27", severity: "critical", reporter: "Citizen SMS", time: "8 min ago", verified: false, officer: "—", status: "pending" },
  { id: "INC-2026-042", type: "Convoy At Risk", location: "NH-2 Zone", route: "NH-2", severity: "high", reporter: "Fleet system", time: "18 min ago", verified: false, officer: "—", status: "pending" },
  { id: "INC-2026-043", type: "Bridge Damage", location: "Tawang", route: "NH-13", severity: "critical", reporter: "FO D. Wangmo", time: "40 min ago", verified: true, officer: "Response Team B", status: "escalated" },
  { id: "INC-2026-044", type: "Landslide", location: "NH-306 Km 54", route: "NH-306", severity: "high", reporter: "FO K. Rabha", time: "1 hr ago", verified: true, officer: "K. Rabha", status: "active" },
  { id: "INC-2026-045", type: "Road Blockage", location: "NH-6 Km 120", route: "NH-6", severity: "medium", reporter: "Fleet system", time: "1 hr 20 min ago", verified: true, officer: "A. Das", status: "active" },
  { id: "INC-2026-038", type: "Waterlogging", location: "Guwahati GS Road", route: "NH-27", severity: "medium", reporter: "Citizen app", time: "Yesterday", verified: true, officer: "A. Das", status: "resolved" },
  { id: "INC-2026-039", type: "Fallen Tree", location: "Jorhat bypass", route: "NH-37", severity: "low", reporter: "Citizen app", time: "Yesterday", verified: true, officer: "K. Rabha", status: "resolved" },
];

const INC_STATUS_LABEL: Record<IncTab, string> = {
  all: "All",
  pending: "Pending",
  active: "Active",
  escalated: "Escalated",
  resolved: "Resolved",
};
function incStatusTone(s: IncTab): "critical" | "saffron" | "navy" | "clear" {
  if (s === "escalated") return "critical";
  if (s === "pending") return "saffron";
  if (s === "resolved") return "clear";
  return "navy";
}

function Incidents() {
  const [tab, setTab] = useState<IncTab>("all");
  const [selected, setSelected] = useState<Incident | null>(null);
  if (selected) return <IncidentDetail incident={selected} onBack={() => setSelected(null)} />;

  const filtered = INCIDENTS.filter((i) => tab === "all" || i.status === tab);
  const count = (t: IncTab) => (t === "all" ? INCIDENTS.length : INCIDENTS.filter((i) => i.status === t).length);

  return (
    <div>
      <PageHead title="Incidents" subtitle="Manage and verify incident reports across the district." />

      <ScrollTabs<IncTab>
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "all", label: "All", count: count("all") },
          { id: "pending", label: "Pending Verification", count: count("pending") },
          { id: "active", label: "Active", count: count("active") },
          { id: "escalated", label: "Escalated", count: count("escalated") },
          { id: "resolved", label: "Resolved", count: count("resolved") },
        ]}
      />

      <div className="mt-3 flex gap-2">
        <div className="flex-1">
          <SelectMock options={["All Severity", "Critical", "High", "Medium", "Low"]} />
        </div>
        <div className="flex-1">
          <SelectMock options={["All Types", "Flash Flood", "Landslide", "Bridge Damage", "Road Blockage"]} />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {filtered.map((i) => (
          <Card
            key={i.id}
            className={`p-3.5 ${i.status === "escalated" ? "border-l-[3px] border-l-critical" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-navy px-1.5 py-0.5 font-public text-[11px] font-bold text-white">{i.id}</span>
                <span className="font-public text-[14px] font-semibold text-navy">{i.type}</span>
              </div>
              <PriorityBadge level={i.severity} />
            </div>
            <p className="mt-1.5 flex items-center gap-1 font-noto text-[13px] text-ink">
              <MapPin size={13} className="text-ink/60" /> {i.location} · {i.route}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-noto text-[12px] text-ink/70">
              <span>{i.reporter}</span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> {i.time}
              </span>
              {i.verified ? (
                <StatusChip tone="clear">
                  <Check size={12} /> Verified
                </StatusChip>
              ) : (
                <StatusChip tone="saffron">
                  <Warning size={12} /> Unverified
                </StatusChip>
              )}
            </div>
            <div className="mt-2.5 flex items-center justify-between border-t border-hairline pt-2.5">
              <span className="font-noto text-[12px] text-ink">
                Assigned: <span className="font-semibold text-navy">{i.officer}</span>
              </span>
              <div className="flex items-center gap-2">
                <StatusChip tone={incStatusTone(i.status)}>{INC_STATUS_LABEL[i.status]}</StatusChip>
                <MiniBtn onClick={() => setSelected(i)}>View</MiniBtn>
                {!i.verified && <MiniBtn primary onClick={() => setSelected(i)}>Verify</MiniBtn>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function IncidentDetail({ incident, onBack }: { incident: Incident; onBack: () => void }) {
  return (
    <div>
      <BackRow label="Incidents" onBack={onBack} />
      <div className="mt-1 flex items-center justify-between">
        <span className="rounded bg-navy px-2 py-0.5 font-public text-[12px] font-bold text-white">{incident.id}</span>
        <PriorityBadge level={incident.severity} />
      </div>
      <h2 className="mt-2 font-public text-[19px] font-bold text-navy">{incident.type}</h2>
      <p className="font-noto text-[13px] text-ink">
        {incident.location} · reported {incident.time}
      </p>

      <SectionTitle>Location</SectionTitle>
      <Card className="overflow-hidden">
        <div className="h-[140px]">
          <DistrictMap layers={{ roads: true, risk: true, incidents: true, vehicles: false, infra: false }} height={140} />
        </div>
      </Card>

      <DetailRows
        rows={[
          ["Route", incident.route],
          ["Reporter", incident.reporter],
          ["Verification", incident.verified ? "Verified" : "Unverified"],
          ["Assigned officer", incident.officer],
          ["Status", INC_STATUS_LABEL[incident.status]],
        ]}
      />

      <div className="mt-3">
        <AiCard kind="Risk estimate" confidence={81} title="Secondary impact likely within 6 hours">
          Saturated conditions and forecast rain. Recommend staging response resources and pre-emptive route
          restriction.
        </AiCard>
      </div>

      <SectionTitle>Actions</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        <ActionButton primary>Verify</ActionButton>
        <ActionButton>Assign officer</ActionButton>
        <ActionButton tone="critical">Escalate</ActionButton>
        <ActionButton tone="clear">Resolve</ActionButton>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 4 · Routes
// ════════════════════════════════════════════════════════════════
interface DRoute {
  id: string;
  name: string;
  distance: string;
  score: number;
  status: string;
  weather: string;
  eta: string;
  delay: string;
  updated: string;
}
const DROUTES: DRoute[] = [
  { id: "NH-27", name: "NH-27 Guwahati–Barpeta", distance: "92 km", score: 90, status: "Blocked", weather: "Heavy rain", eta: "—", delay: "+58 min", updated: "09:38" },
  { id: "NH-2", name: "NH-2 Dimapur–Kohima", distance: "74 km", score: 68, status: "Restricted", weather: "Light rain", eta: "2 h 10 m", delay: "+22 min", updated: "09:35" },
  { id: "NH-306", name: "NH-306 Silchar link", distance: "130 km", score: 62, status: "Restricted", weather: "Cloudy", eta: "3 h 05 m", delay: "+16 min", updated: "09:40" },
  { id: "NH-6", name: "NH-6 Shillong corridor", distance: "210 km", score: 58, status: "Restricted", weather: "Overcast", eta: "4 h 20 m", delay: "+12 min", updated: "09:41" },
  { id: "NH-13", name: "NH-13 Tawang approach", distance: "165 km", score: 95, status: "Closed", weather: "Snow/rain", eta: "—", delay: "Closed", updated: "09:30" },
  { id: "NH-40", name: "NH-40 Jorabat–Shillong", distance: "100 km", score: 20, status: "Open", weather: "Clear", eta: "2 h 30 m", delay: "On time", updated: "09:39" },
  { id: "NH-10", name: "NH-10 Siliguri gateway", distance: "145 km", score: 15, status: "Open", weather: "Clear", eta: "3 h 10 m", delay: "On time", updated: "09:37" },
];

function Routes() {
  const [sel, setSel] = useState<DRoute | null>(null);
  if (sel) return <RouteDetail route={sel} onBack={() => setSel(null)} />;
  return (
    <div>
      <PageHead
        title="Routes"
        subtitle="Route intelligence and accessibility monitoring"
        action={
          <div className="w-[130px]">
            <SelectMock options={["All Status", "Open", "Restricted", "Blocked", "Closed"]} />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-2.5">
        <KpiTile label="Open Routes" value={2} tone="clear" />
        <KpiTile label="Restricted" value={3} tone="saffron" />
        <KpiTile label="Blocked" value={1} tone="critical" />
        <KpiTile label="Closed" value={1} tone="critical" />
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {DROUTES.map((r) => {
          const band = accessBand(r.score);
          return (
            <Card key={r.id} onClick={() => setSel(r)} className="p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-navy px-1.5 py-0.5 font-public text-[11px] font-bold text-white">{r.id}</span>
                  <span className="font-public text-[14px] font-semibold text-navy">{r.name}</span>
                </div>
                <RouteStatusChip status={r.status} />
              </div>
              <p className="mt-1 font-noto text-[12px] text-ink">{r.distance}</p>
              <div className="mt-2.5">
                <AccessScore score={r.score} />
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-noto text-[12px] text-ink/70">
                <span className={`font-semibold ${band.text}`}>{band.label} risk</span>
                <span>{r.weather}</span>
                <span>ETA {r.eta}</span>
                <span className={r.delay.startsWith("+") || r.delay === "Closed" ? "text-[#7a4310]" : ""}>{r.delay}</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {r.updated}
                </span>
                <span className="ml-auto font-public font-semibold text-navy">Detail →</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function RouteDetail({ route, onBack }: { route: DRoute; onBack: () => void }) {
  return (
    <div>
      <BackRow label="Routes" onBack={onBack} />
      <div className="mt-1 flex items-center justify-between">
        <h2 className="font-public text-[19px] font-bold text-navy">{route.name}</h2>
        <RouteStatusChip status={route.status} />
      </div>
      <p className="font-noto text-[13px] text-ink">
        {route.distance} · updated {route.updated}
      </p>
      <div className="mt-3">
        <AccessScore score={route.score} />
      </div>
      <DetailRows
        rows={[
          ["Status", route.status],
          ["Weather", route.weather],
          ["ETA", route.eta],
          ["Delay", route.delay],
          ["Landslide risk", route.score > 75 ? "High" : "Moderate"],
        ]}
      />
      <SectionTitle>Current vs. alternative</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        <CompareCard title="Current" band={accessBand(route.score)} score={route.score} eta={route.eta} note={route.status} />
        <CompareCard title="Alternative" band={accessBand(20)} score={20} eta="2 h 45 m" note="Suggested reroute" />
      </div>
      <div className="mt-3">
        <AiCard kind="Route recommendation" confidence={76} title="Consider alternate for priority loads">
          Alternative scores Good. Adds travel time but avoids the current restriction on {route.id}.
        </AiCard>
      </div>
    </div>
  );
}

function CompareCard({
  title,
  band,
  score,
  eta,
  note,
}: {
  title: string;
  band: ReturnType<typeof accessBand>;
  score: number;
  eta: string;
  note: string;
}) {
  return (
    <div className="rounded-md border border-hairline p-3">
      <p className="font-public text-[13px] font-bold text-navy">{title}</p>
      <p className={`mt-2 font-public text-[22px] font-bold leading-none ${band.text}`}>{score}</p>
      <p className={`font-public text-[12px] font-bold ${band.text}`}>{band.label}</p>
      <p className="mt-2 font-noto text-[12px] text-ink">ETA {eta}</p>
      <p className="mt-1 font-noto text-[12px] text-ink/70">{note}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 5 · Logistics
// ════════════════════════════════════════════════════════════════
interface Vehicle {
  id: string;
  cargo: string;
  origin: string;
  dest: string;
  location: string;
  route: string;
  eta: string;
  delay: string;
  risk: Priority;
  status: string;
}
const VEHICLES: Vehicle[] = [
  { id: "LG-102", cargo: "Medical supplies", origin: "Guwahati", dest: "Barpeta", location: "NH-27 Km 40", route: "NH-27", eta: "14:20", delay: "+45 min", risk: "critical", status: "At risk" },
  { id: "LG-115", cargo: "Relief kits", origin: "Guwahati", dest: "Nalbari", location: "NH-27 Km 18", route: "NH-27", eta: "12:05", delay: "On time", risk: "low", status: "Moving" },
  { id: "LG-089", cargo: "Relief rations", origin: "Dimapur", dest: "Kohima", location: "NH-2 Km 30", route: "NH-2", eta: "15:10", delay: "+30 min", risk: "high", status: "At risk" },
  { id: "LG-134", cargo: "Equipment", origin: "Jorhat", dest: "Sivasagar", location: "NH-37 Km 22", route: "NH-37", eta: "13:40", delay: "On time", risk: "low", status: "Moving" },
  { id: "LG-098", cargo: "Water tankers", origin: "Shillong", dest: "Nongpoh", location: "NH-6 Km 55", route: "NH-6", eta: "13:15", delay: "+10 min", risk: "medium", status: "Moving" },
  { id: "LG-121", cargo: "Fuel", origin: "Tezpur", dest: "Tawang", location: "Held · depot", route: "NH-13", eta: "—", delay: "Stopped", risk: "critical", status: "Stopped" },
];

interface Convoy {
  id: string;
  cargo: string;
  origin: string;
  dest: string;
  route: string;
  eta: string;
  risk: Priority;
  delay: string;
}
const AT_RISK: Convoy[] = [
  { id: "LG-102", cargo: "Medical supplies", origin: "Guwahati", dest: "Barpeta", route: "NH-27", eta: "14:20", risk: "critical", delay: "+45 min" },
  { id: "LG-089", cargo: "Relief rations", origin: "Dimapur", dest: "Kohima", route: "NH-2", eta: "15:10", risk: "high", delay: "+30 min" },
  { id: "LG-121", cargo: "Fuel", origin: "Tezpur", dest: "Tawang", route: "NH-13", eta: "—", risk: "critical", delay: "Stopped" },
];

function vehStatusTone(status: string): "critical" | "saffron" | "clear" {
  if (status === "Stopped") return "critical";
  if (status === "At risk") return "saffron";
  return "clear";
}

function Logistics() {
  const [sel, setSel] = useState<Vehicle | null>(null);
  if (sel) return <VehicleDetail v={sel} onBack={() => setSel(null)} />;
  return (
    <div>
      <PageHead title="Logistics" subtitle="District logistics monitoring and convoy management." />

      <div className="grid grid-cols-2 gap-2.5">
        <KpiTile label="Active Vehicles" value={5} tone="navy" />
        <KpiTile label="Delayed Vehicles" value={3} tone="saffron" />
        <KpiTile label="At-Risk Shipments" value={3} tone="critical" />
        <KpiTile label="Stopped" value={1} tone="critical" />
      </div>

      <SectionTitle>Active Convoys</SectionTitle>
      <Card className="overflow-hidden">
        <div className="h-[170px]">
          <DistrictMap layers={{ roads: true, risk: false, incidents: false, vehicles: true, infra: false }} height={170} />
        </div>
      </Card>

      <SectionTitle>At-Risk Convoys</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {AT_RISK.map((c) => (
          <Card key={c.id} className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-navy px-1.5 py-0.5 font-public text-[11px] font-bold text-white">{c.id}</span>
                <span className="font-public text-[14px] font-semibold text-navy">{c.cargo}</span>
              </div>
              <PriorityBadge level={c.risk} />
            </div>
            <p className="mt-1.5 font-noto text-[12px] text-ink">
              {c.origin} → {c.dest} · {c.route}
            </p>
            <div className="mt-1.5 flex items-center gap-3 font-noto text-[12px] text-ink/70">
              <span>ETA {c.eta}</span>
              <span className="text-[#7a4310]">{c.delay}</span>
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle>All Vehicles</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {VEHICLES.map((v) => (
          <Card key={v.id} onClick={() => setSel(v)} className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md border border-hairline">
                  <Truck size={16} className="text-navy" />
                </span>
                <div>
                  <p className="font-public text-[14px] font-semibold text-navy">{v.id}</p>
                  <p className="font-noto text-[12px] text-ink">{v.cargo}</p>
                </div>
              </div>
              <StatusChip tone={vehStatusTone(v.status)}>{v.status}</StatusChip>
            </div>
            <p className="mt-2 font-noto text-[12px] text-ink">
              {v.origin} → {v.dest} · {v.route}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-noto text-[12px] text-ink/70">
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {v.location}
              </span>
              <span>ETA {v.eta}</span>
              <span className={v.delay.startsWith("+") || v.delay === "Stopped" ? "text-[#7a4310]" : ""}>{v.delay}</span>
              <span className="flex items-center gap-1">
                Risk: <PriorityBadge level={v.risk} />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function VehicleDetail({ v, onBack }: { v: Vehicle; onBack: () => void }) {
  return (
    <div>
      <BackRow label="Logistics" onBack={onBack} />
      <div className="mt-1 flex items-center justify-between">
        <h2 className="font-public text-[19px] font-bold text-navy">{v.id}</h2>
        <StatusChip tone={vehStatusTone(v.status)}>{v.status}</StatusChip>
      </div>
      <p className="font-noto text-[13px] text-ink">
        {v.cargo} · {v.origin} → {v.dest}
      </p>
      <Card className="mt-3 overflow-hidden">
        <div className="h-[140px]">
          <DistrictMap layers={{ roads: true, risk: true, incidents: false, vehicles: true, infra: true }} height={140} />
        </div>
      </Card>
      <DetailRows
        rows={[
          ["Current location", v.location],
          ["Route", v.route],
          ["ETA", v.eta],
          ["Delay", v.delay],
          ["Origin", v.origin],
          ["Destination", v.dest],
        ]}
      />
      <div className="mt-3">
        <AiCard kind="Logistics prediction" confidence={74} title="Arrival at risk of slipping">
          Route conditions and weather may extend transit time. Rerouting via alternate corridor can recover part of
          the projected delay.
        </AiCard>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 6 · Tasks
// ════════════════════════════════════════════════════════════════
type TaskTab = "all" | "new" | "progress" | "completed" | "escalated";
interface DTask {
  id: string;
  title: string;
  ref: string;
  location: string;
  priority: Priority;
  officer: string;
  created: string;
  deadline: string;
  status: TaskTab;
}
const TASKS: DTask[] = [
  { id: "TSK-0891", title: "Verify flash flood report", ref: "INC-2026-041", location: "Barpeta", priority: "critical", officer: "Unassigned", created: "09:12", deadline: "10:30", status: "new" },
  { id: "TSK-0890", title: "Inspect bridge structure", ref: "INC-2026-043", location: "Tawang", priority: "critical", officer: "Response Team B", created: "08:50", deadline: "11:00", status: "progress" },
  { id: "TSK-0889", title: "Clear landslide debris", ref: "INC-2026-044", location: "NH-306 Km 54", priority: "high", officer: "K. Rabha", created: "08:20", deadline: "12:00", status: "progress" },
  { id: "TSK-0887", title: "Escort at-risk convoy LG-102", ref: "LG-102", location: "NH-27 Km 40", priority: "high", officer: "A. Das", created: "07:55", deadline: "14:00", status: "progress" },
  { id: "TSK-0885", title: "Restore road signage", ref: "INC-2026-039", location: "Jorhat bypass", priority: "low", officer: "K. Rabha", created: "Yesterday", deadline: "Done", status: "completed" },
];
const TASK_STATUS_LABEL: Record<TaskTab, string> = {
  all: "All",
  new: "New",
  progress: "In Progress",
  completed: "Completed",
  escalated: "Escalated",
};
function taskStatusTone(s: TaskTab): "critical" | "saffron" | "navy" | "clear" {
  if (s === "escalated") return "critical";
  if (s === "new") return "saffron";
  if (s === "completed") return "clear";
  return "navy";
}

function Tasks() {
  const [tab, setTab] = useState<TaskTab>("all");
  const [sel, setSel] = useState<DTask | null>(null);
  const [create, setCreate] = useState(false);
  if (sel) return <TaskDetail t={sel} onBack={() => setSel(null)} />;
  const filtered = TASKS.filter((t) => tab === "all" || t.status === tab);
  const count = (t: TaskTab) => (t === "all" ? TASKS.length : TASKS.filter((x) => x.status === t).length);
  return (
    <div>
      <PageHead
        title="Tasks"
        subtitle="Field task management and assignment"
        action={
          <HeadBtn onClick={() => setCreate(true)}>
            <Plus size={15} className="mr-1" /> Create Task
          </HeadBtn>
        }
      />

      <ScrollTabs<TaskTab>
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "all", label: "All", count: count("all") },
          { id: "new", label: "New", count: count("new") },
          { id: "progress", label: "In Progress", count: count("progress") },
          { id: "completed", label: "Completed", count: count("completed") },
          { id: "escalated", label: "Escalated", count: count("escalated") },
        ]}
      />

      <div className="mt-3 flex flex-col gap-2.5">
        {filtered.map((t) => (
          <Card
            key={t.id}
            className={`p-3.5 ${t.status === "escalated" ? "border-l-[3px] border-l-critical" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-navy px-1.5 py-0.5 font-public text-[11px] font-bold text-white">{t.id}</span>
                <span className="font-public text-[14px] font-semibold text-navy">{t.title}</span>
              </div>
              <PriorityBadge level={t.priority} />
            </div>
            <p className="mt-1 font-noto text-[12px] text-ink/70">↳ {t.ref}</p>
            <p className="mt-1 flex items-center gap-1 font-noto text-[13px] text-ink">
              <MapPin size={13} className="text-ink/60" /> {t.location}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-noto text-[12px] text-ink/70">
              <span>{t.officer}</span>
              <span>Created {t.created}</span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> Deadline {t.deadline}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between border-t border-hairline pt-2.5">
              <StatusChip tone={taskStatusTone(t.status)}>{TASK_STATUS_LABEL[t.status]}</StatusChip>
              <div className="flex gap-2">
                <MiniBtn onClick={() => setSel(t)}>View</MiniBtn>
                <MiniBtn primary onClick={() => setSel(t)}>Assign</MiniBtn>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {create && (
        <BottomSheet onClose={() => setCreate(false)} title="Create Task">
          <div className="mt-3 flex flex-col gap-3">
            <Field label="Title">
              <input
                placeholder="Task title"
                className="w-full rounded-md border border-hairline bg-white px-3 py-2.5 font-noto text-[14px] text-navy outline-none placeholder:text-ink/40"
              />
            </Field>
            <Field label="Linked reference">
              <SelectMock options={["INC-2026-041", "INC-2026-043", "LG-102"]} />
            </Field>
            <Field label="Priority">
              <SelectMock options={["Critical", "High", "Medium", "Low"]} />
            </Field>
            <Field label="Assign officer">
              <SelectMock options={["Unassigned", "K. Rabha", "A. Das", "Response Team B"]} />
            </Field>
            <button
              onClick={() => setCreate(false)}
              className="mt-1 w-full rounded-md bg-navy py-3 font-public text-[15px] font-bold text-white active:bg-navy-pressed"
            >
              Create Task
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

function TaskDetail({ t, onBack }: { t: DTask; onBack: () => void }) {
  return (
    <div>
      <BackRow label="Tasks" onBack={onBack} />
      <div className="mt-1 flex items-center justify-between">
        <span className="rounded bg-navy px-2 py-0.5 font-public text-[12px] font-bold text-white">{t.id}</span>
        <PriorityBadge level={t.priority} />
      </div>
      <h2 className="mt-2 font-public text-[19px] font-bold text-navy">{t.title}</h2>
      <p className="font-noto text-[13px] text-ink">↳ {t.ref}</p>
      <DetailRows
        rows={[
          ["Location", t.location],
          ["Linked reference", t.ref],
          ["Officer", t.officer],
          ["Created", t.created],
          ["Deadline", t.deadline],
          ["Status", TASK_STATUS_LABEL[t.status]],
        ]}
      />
      <SectionTitle>Actions</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        <ActionButton primary>Assign</ActionButton>
        <ActionButton>Reassign</ActionButton>
        <ActionButton tone="clear">Complete</ActionButton>
        <ActionButton tone="critical">Escalate</ActionButton>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 7 · AI Insights
// ════════════════════════════════════════════════════════════════
interface DelayPred {
  route: string;
  convoys: string;
  prob: number;
  cause: string;
  delay: string;
}
const DELAY_PREDS: DelayPred[] = [
  { route: "NH-2", convoys: "LG-089", prob: 72, cause: "Restricted — landslide risk", delay: "+30 min" },
  { route: "NH-27", convoys: "LG-102, LG-115", prob: 88, cause: "Flood on approach", delay: "+45 min" },
  { route: "NH-306", convoys: "—", prob: 61, cause: "Slope saturation", delay: "+20 min" },
];

function AiInsights() {
  return (
    <div>
      <PageHead
        title="AI Insights"
        subtitle="AI-generated predictions and recommendations — Demo Data — Not guaranteed facts"
      />

      <div className="mb-3">
        <AlertBanner
          tone="saffron"
          title="AI-generated estimates"
          text="All predictions are AI-generated estimates based on historical data, weather patterns, and real-time incident feed. These are recommendations, not confirmed facts. District Officer discretion required."
        />
      </div>

      {/* Risk predictions */}
      <SectionTitle>Risk Predictions</SectionTitle>
      <Card>
        {RISK_PREDS.map((p) => (
          <RiskPredRow key={p.route} p={p} />
        ))}
      </Card>

      {/* Logistics delay predictions */}
      <SectionTitle>Logistics Delay Predictions</SectionTitle>
      <Card className="p-3.5">
        <p className="font-noto text-[13px] font-semibold text-navy">6 logistics routes may experience delays</p>
        <div className="mt-2 flex flex-col divide-y divide-hairline">
          {DELAY_PREDS.map((d) => (
            <div key={d.route} className="py-2.5 first:pt-0">
              <div className="flex items-center justify-between">
                <span className="font-public text-[14px] font-bold text-navy">{d.route}</span>
                <span className="font-public text-[14px] font-bold text-saffron">{d.prob}%</span>
              </div>
              <p className="mt-0.5 font-noto text-[12px] text-ink">Convoys: {d.convoys}</p>
              <p className="font-noto text-[12px] text-ink">{d.cause}</p>
              <p className="font-noto text-[12px] text-[#7a4310]">Est. delay {d.delay}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 font-noto text-[10.5px] italic text-ink/60">AI-generated estimate</p>
      </Card>

      {/* Route recommendations */}
      <SectionTitle>Route Recommendations</SectionTitle>
      <div className="flex flex-col gap-2.5">
        <AiCard kind="Route recommendation" title="Reroute NH-27 → NH-37 via Jorhat">
          <p>Avoids flood zone.</p>
          <div className="mt-2 flex gap-4 font-public text-[12px]">
            <span className="font-bold text-clear">Risk −62%</span>
            <span className="text-ink">+34 km</span>
          </div>
        </AiCard>
        <AiCard kind="Route recommendation" title="Switch NH-13 to air transport via Tezpur">
          <p>Bypasses closed pass.</p>
          <div className="mt-2 flex gap-4 font-public text-[12px]">
            <span className="font-bold text-clear">Risk −80%</span>
            <span className="text-ink">Helicopter, 2 sorties</span>
          </div>
        </AiCard>
      </div>

      {/* Resource recommendations */}
      <SectionTitle>Resource Recommendations</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {["Deploy 2 field teams to Barpeta", "Pre-position NDRF unit at Kohima", "1 logistics coordinator needed at Dimapur"].map(
          (r) => (
            <Card key={r} className="p-3.5">
              <p className="font-public text-[14px] font-semibold text-navy">{r}</p>
              <div className="mt-2.5 flex gap-2">
                <MiniBtn primary>Act on Recommendation</MiniBtn>
                <MiniBtn>Dismiss</MiniBtn>
              </div>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 8 · Alerts
// ════════════════════════════════════════════════════════════════
type AlertChip =
  | "all"
  | "critical"
  | "closure"
  | "flood"
  | "landslide"
  | "delay"
  | "escalation"
  | "ai";
const ALERT_CHIPS: { id: AlertChip; label: string }[] = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "closure", label: "Route Closure" },
  { id: "flood", label: "Flood" },
  { id: "landslide", label: "Landslide" },
  { id: "delay", label: "Logistics Delay" },
  { id: "escalation", label: "Escalation" },
  { id: "ai", label: "AI Warning" },
];

interface DAlert {
  id: string;
  severity: Priority;
  title: string;
  location: string;
  source: string;
  time: string;
  acknowledged: boolean;
}
const ALERTS: DAlert[] = [
  { id: "AL-1", severity: "critical", title: "Flash flood warning", location: "NH-27, Barpeta", source: "Sensor + Citizen SMS", time: "8 min ago", acknowledged: false },
  { id: "AL-2", severity: "critical", title: "Bridge damage", location: "Tawang, NH-13", source: "Field officer", time: "25 min ago", acknowledged: false },
  { id: "AL-3", severity: "high", title: "3 convoys at risk", location: "NH-2 Zone", source: "Fleet system", time: "40 min ago", acknowledged: false },
  { id: "AL-4", severity: "high", title: "INC-2026-043 SLA exceeded", location: "Tawang", source: "System", time: "1 hr ago", acknowledged: true },
  { id: "AL-5", severity: "high", title: "Increased landslide probability", location: "NH-306", source: "AI model", time: "2 hr ago", acknowledged: true },
  { id: "AL-6", severity: "critical", title: "NH-13 closed indefinitely", location: "Tawang approach", source: "District officer", time: "3 hr ago", acknowledged: true },
];

function Alerts() {
  const [chip, setChip] = useState<AlertChip>("all");
  const [acked, setAcked] = useState<Record<string, boolean>>({});
  return (
    <div>
      <PageHead
        title="Alerts"
        subtitle="Operational notification center — 3 unacknowledged"
        action={<HeadBtn>Acknowledge All</HeadBtn>}
      />

      <ScrollTabs<AlertChip> active={chip} onChange={setChip} tabs={ALERT_CHIPS} />

      <div className="mt-3 flex flex-col gap-2.5">
        {ALERTS.map((a) => {
          const isAck = a.acknowledged || acked[a.id];
          return (
            <Card key={a.id} className={`p-3.5 ${isAck ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <span className="font-public text-[14px] font-bold text-navy">{a.title}</span>
                {isAck ? (
                  <span className="inline-flex items-center gap-1 rounded border border-clear/30 bg-[#e8f5ee] px-2 py-0.5 font-public text-[12px] font-semibold text-clear">
                    <Check size={12} /> Acknowledged
                  </span>
                ) : (
                  <PriorityBadge level={a.severity} />
                )}
              </div>
              <p className="mt-1 flex items-center gap-1 font-noto text-[12px] text-ink">
                <MapPin size={12} className="text-ink/60" /> {a.location} · {a.time}
              </p>
              <p className="mt-1 font-noto text-[11px] text-ink/60">Source: {a.source}</p>
              {!isAck && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <MiniBtn>View</MiniBtn>
                  <MiniBtn primary onClick={() => setAcked((s) => ({ ...s, [a.id]: true }))}>
                    Acknowledge
                  </MiniBtn>
                  <MiniBtn>Assign</MiniBtn>
                  <MiniBtn tone="critical">Escalate</MiniBtn>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 9 · Reports
// ════════════════════════════════════════════════════════════════
function Reports() {
  const [generated, setGenerated] = useState(false);
  return (
    <div>
      <PageHead title="Reports" subtitle="Generate and export operational reports." />

      <SectionTitle>Report Configuration</SectionTitle>
      <div className="flex flex-col gap-3">
        <Field label="Report Type">
          <SelectMock
            options={["Daily Situation Report", "Incident Report", "Route Risk Report", "Logistics Report", "AI Risk Report"]}
          />
        </Field>
        <Field label="Date">
          <input
            type="date"
            defaultValue="2026-09-10"
            className="w-full rounded-md border border-hairline bg-white px-3 py-2.5 font-noto text-[14px] text-navy outline-none"
          />
        </Field>
        <Field label="District">
          <input
            defaultValue={DISTRICT}
            className="w-full rounded-md border border-hairline bg-white px-3 py-2.5 font-noto text-[14px] text-navy outline-none"
          />
        </Field>
        <Field label="Incident Type">
          <SelectMock options={["All", "Flood", "Landslide", "Bridge", "Road Blockage"]} />
        </Field>
        <Field label="Severity Filter">
          <SelectMock options={["All", "Critical", "High", "Medium", "Low"]} />
        </Field>
        <button
          onClick={() => setGenerated(true)}
          className="mt-1 w-full rounded-md bg-navy py-3 font-public text-[15px] font-bold text-white active:bg-navy-pressed"
        >
          Generate Report
        </button>
      </div>

      <SectionTitle>Report Preview</SectionTitle>
      {!generated ? (
        <Card className="p-8 text-center">
          <p className="font-public text-[15px] font-bold text-navy">Configure and generate a report</p>
          <p className="mt-1 font-noto text-[13px] text-ink">Select report type and parameters above.</p>
        </Card>
      ) : (
        <ReportPreview />
      )}
    </div>
  );
}

function ReportPreview() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div>
          <p className="font-public text-[16px] font-bold text-navy">Daily Situation Report</p>
          <p className="font-noto text-[12px] text-ink">{DISTRICT} · 10 Sep 2026</p>
        </div>
        <AshokaChakra size={30} color="#0e2a47" />
      </div>
      <p className="mt-3 font-public text-[11px] font-bold uppercase tracking-wide text-ink/60">Key figures</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {[
          ["Incidents", "24"],
          ["Blocked", "07"],
          ["Avg resp.", "42m"],
        ].map(([l, v]) => (
          <div key={l} className="rounded border border-hairline p-2 text-center">
            <p className="font-public text-[18px] font-bold text-navy">{v}</p>
            <p className="font-noto text-[10px] text-ink">{l}</p>
          </div>
        ))}
      </div>
      <ReportBlock title="Incident summary" text="24 incidents in 24h (2 critical). Flash flood at Barpeta dominates response." />
      <ReportBlock title="Route summary" text="NH-27 blocked; NH-13 closed. Restrictions active on NH-2, NH-306, NH-6." />
      <ReportBlock title="Logistics summary" text="86 active shipments, 3 delayed, 3 at-risk (medical, rations, fuel)." />
      <ReportBlock title="Risk summary" text="Flood risk High on NH-27 corridor; landslide watch on NH-306." />
      <p className="mt-3 border-t border-hairline pt-2 font-noto text-[10px] text-ink/60">
        Generated by NER Operations Portal · MDoNER · for official use only · DEMO DATA
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <ActionButton primary>
          <Download size={15} className="mr-1.5 inline" />
          Export PDF
        </ActionButton>
        <ActionButton>
          <Download size={15} className="mr-1.5 inline" />
          Export CSV
        </ActionButton>
      </div>
    </Card>
  );
}

function ReportBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-3">
      <p className="font-public text-[13px] font-bold text-navy">{title}</p>
      <p className="mt-0.5 font-noto text-[13px] leading-snug text-ink">{text}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 10 · Analytics
// ════════════════════════════════════════════════════════════════
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
const ROUTE_ACCESS: { route: string; accessible: number }[] = [
  { route: "NH-27", accessible: 10 },
  { route: "NH-2", accessible: 45 },
  { route: "NH-306", accessible: 52 },
  { route: "NH-6", accessible: 60 },
  { route: "NH-40", accessible: 88 },
];

function Analytics() {
  return (
    <div>
      <PageHead title="Analytics" subtitle="Decision-focused district performance analytics — Demo Data." />

      <div className="grid grid-cols-2 gap-2.5">
        <KpiTile label="Total Incidents (7d)" value={24} tone="critical" hint="+14%" />
        <KpiTile label="Avg Response Time" value="42m" tone="clear" hint="−8% week" />
        <KpiTile label="Route Accessibility" value="52%" tone="saffron" hint="−5% week" />
        <KpiTile label="Logistics On-Time" value="68%" tone="navy" />
        <KpiTile label="Unresolved >24h" value={7} tone="critical" hint="+3 week" />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <ChartCard title="Incident Trend">
          <LineChart data={[12, 15, 14, 18, 20, 22, 24]} color="#b3261e" labels={DAY_LABELS} />
        </ChartCard>

        <ChartCard title="Route Accessibility">
          <div className="mb-2.5 flex items-center gap-4 font-noto text-[11px] text-ink">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-clear" /> Accessible
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-saffron" /> Restricted
            </span>
          </div>
          <StackedBar data={ROUTE_ACCESS} />
        </ChartCard>

        <ChartCard title="Average Response Time (min)">
          <LineChart data={[48, 45, 44, 43, 42, 42, 42]} color="#1e6b45" labels={DAY_LABELS} target={35} />
          <p className="mt-2 font-noto text-[11px] text-ink/70">Dashed line = 35 min target</p>
        </ChartCard>

        <ChartCard title="District Risk Score Trend">
          <LineChart data={[42, 50, 55, 60, 66, 70, 74]} color="#d97a1f" labels={DAY_LABELS} />
          <div className="mt-3 rounded-md border border-saffron/40 bg-saffron/10 px-3 py-2.5">
            <p className="font-noto text-[12px] leading-snug text-navy">
              Risk trend increasing — 74/100 today vs 42/100 last Monday. Monsoon season contributing factor.
            </p>
          </div>
        </ChartCard>
      </div>

      <SectionTitle>District Performance Comparison</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {[
          { district: "Kamrup Metro", state: "Assam", inc: 24, resp: "42m", access: "52%", delays: 3, unres: 7 },
          { district: "Kohima", state: "Nagaland", inc: 15, resp: "38m", access: "61%", delays: 2, unres: 4 },
          { district: "Aizawl", state: "Mizoram", inc: 9, resp: "33m", access: "74%", delays: 1, unres: 2 },
          { district: "East Khasi Hills", state: "Meghalaya", inc: 12, resp: "40m", access: "58%", delays: 2, unres: 3 },
          { district: "Tawang", state: "Arunachal Pradesh", inc: 18, resp: "55m", access: "39%", delays: 4, unres: 6 },
        ].map((d) => (
          <Card key={d.district} className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-public text-[14px] font-bold text-navy">{d.district}</span>
              <span className="font-noto text-[12px] text-ink/70">{d.state}</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1.5 font-noto text-[12px]">
              <MetricCell label="Incidents" value={String(d.inc)} />
              <MetricCell label="Avg Resp" value={d.resp} />
              <MetricCell label="Route Access" value={d.access} />
              <MetricCell label="Logi Delays" value={String(d.delays)} />
              <MetricCell label="Unresolved" value={String(d.unres)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-public text-[15px] font-bold text-navy">{value}</p>
      <p className="font-noto text-[10.5px] text-ink/60">{label}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-3.5">
      <p className="font-public text-[13px] font-bold text-navy">{title}</p>
      <div className="mt-3">{children}</div>
    </Card>
  );
}

function LineChart({
  data,
  color,
  labels,
  target,
}: {
  data: number[];
  color: string;
  labels?: string[];
  target?: number;
}) {
  const max = Math.max(...data, target ?? 0) * 1.1;
  const w = 300,
    h = 90;
  const y = (d: number) => h - (d / max) * h;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${y(d)}`).join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[90px] w-full">
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={0} y1={h * g} x2={w} y2={h * g} stroke="rgba(91,100,114,0.12)" strokeWidth={1} />
        ))}
        {target != null && (
          <line x1={0} y1={y(target)} x2={w} y2={y(target)} stroke="#5b6472" strokeWidth={1.4} strokeDasharray="5 4" />
        )}
        <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={i} cx={(i / (data.length - 1)) * w} cy={y(d)} r={2.2} fill={color} />
        ))}
      </svg>
      {labels && (
        <div className="mt-1 flex justify-between font-noto text-[10px] text-ink/60">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function StackedBar({ data }: { data: { route: string; accessible: number }[] }) {
  return (
    <div className="flex flex-col gap-2">
      {data.map((d) => (
        <div key={d.route} className="flex items-center gap-2">
          <span className="w-14 shrink-0 font-noto text-[11px] text-ink">{d.route}</span>
          <div className="flex h-4 flex-1 overflow-hidden rounded-sm">
            <div className="h-full bg-clear" style={{ width: `${d.accessible}%` }} />
            <div className="h-full bg-saffron" style={{ width: `${100 - d.accessible}%` }} />
          </div>
          <span className="w-9 shrink-0 text-right font-noto text-[11px] font-semibold text-navy">{d.accessible}%</span>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Shared building blocks (generic helpers reused across screens)
// ════════════════════════════════════════════════════════════════
function BackRow({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <button onClick={onBack} className="mb-1 flex min-h-[44px] items-center gap-1 text-navy active:opacity-60">
      <ChevronLeft size={18} strokeWidth={2} />
      <span className="font-public text-[14px] font-semibold">{label}</span>
    </button>
  );
}

function DetailRows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mt-3 overflow-hidden rounded-md border border-hairline">
      {rows.map(([label, value], i) => (
        <div
          key={label}
          className={`flex items-start justify-between gap-3 px-3.5 py-2.5 ${i > 0 ? "border-t border-hairline" : ""}`}
        >
          <span className="font-public text-[12px] font-semibold uppercase tracking-wide text-ink/60">{label}</span>
          <span className="text-right font-noto text-[13px] font-medium text-navy">{value}</span>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MiniRow({ left, right, tone }: { left: string; right: string; tone: "navy" | "clear" | "muted" | "critical" }) {
  return (
    <Card className="flex items-center justify-between p-3.5">
      <span className="font-noto text-[14px] text-navy">{left}</span>
      <StatusChip tone={tone}>{right}</StatusChip>
    </Card>
  );
}

function ActionButton({
  children,
  primary,
  tone,
  onClick,
}: {
  children: React.ReactNode;
  primary?: boolean;
  tone?: "critical" | "clear";
  onClick?: () => void;
}) {
  let cls = "border border-navy text-navy active:bg-navy/5";
  if (primary) cls = "bg-navy text-white active:bg-navy-pressed";
  else if (tone === "critical") cls = "border border-critical text-critical active:bg-critical/5";
  else if (tone === "clear") cls = "border border-clear text-clear active:bg-clear/5";
  return (
    <button onClick={onClick} className={`min-h-[44px] rounded-md px-3 py-2.5 font-public text-[14px] font-bold ${cls}`}>
      {children}
    </button>
  );
}

function MiniBtn({
  children,
  primary,
  tone,
  onClick,
}: {
  children: React.ReactNode;
  primary?: boolean;
  tone?: "critical";
  onClick?: () => void;
}) {
  let cls = "border border-hairline text-navy active:bg-black/[0.03]";
  if (primary) cls = "bg-navy text-white active:bg-navy-pressed";
  else if (tone === "critical") cls = "border border-critical/40 text-critical active:bg-critical/5";
  return (
    <button onClick={onClick} className={`rounded px-2.5 py-2 font-public text-[12px] font-semibold ${cls}`}>
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 font-public text-[12px] font-semibold uppercase tracking-wide text-ink/60">{label}</p>
      {children}
    </div>
  );
}

function SelectMock({ options }: { options: string[] }) {
  return (
    <select className="w-full rounded-md border border-hairline bg-white px-3 py-2.5 font-noto text-[14px] text-navy outline-none">
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

function StatusGlyphs() {
  return (
    <>
      <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
        <rect x="0" y="8" width="3" height="4" rx="0.5" />
        <rect x="5" y="5" width="3" height="7" rx="0.5" />
        <rect x="10" y="2.5" width="3" height="9.5" rx="0.5" />
        <rect x="15" y="0" width="3" height="12" rx="0.5" />
      </svg>
      <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M1 4.2C3.4 2 5.8 1 8.5 1S13.6 2 16 4.2" strokeLinecap="round" />
        <path d="M3.6 7C5.1 5.7 6.7 5 8.5 5s3.4.7 4.9 2" strokeLinecap="round" />
        <path d="M6.2 9.7c.7-.6 1.5-.9 2.3-.9s1.6.3 2.3.9" strokeLinecap="round" />
        <circle cx="8.5" cy="11.4" r="0.6" fill="currentColor" stroke="none" />
      </svg>
      <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
        <rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke="currentColor" opacity="0.5" />
        <rect x="2" y="2" width="18" height="9" rx="1.5" fill="currentColor" />
        <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.5" />
      </svg>
    </>
  );
}

function BottomSheet({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-end bg-black/40"
      style={{ animation: "quietFade 140ms ease-out" }}
      onClick={onClose}
    >
      <div className="max-h-[82%] w-full overflow-y-auto rounded-t-2xl bg-white p-5 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[#c4c8cd]" />
        <div className="flex items-center justify-between">
          <h2 className="font-public text-[18px] font-bold text-navy">{title}</h2>
          <button onClick={onClose} aria-label="Close">
            <XIcon size={20} className="text-ink" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
