import { useState } from "react";
import ProfileScreen from "../ProfileScreen";
import {
  Home,
  MapPin,
  Truck,
  Shield,
  Warning,
  Building,
  RouteNodes,
  Sparkle,
  Bell,
  BarChart,
  FileText,
  Settings as SettingsIcon,
  Menu,
  XIcon,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Clock,
  Check,
  RefreshCw,
  Broadcast,
  Download,
} from "../icons";
import { AshokaChakra } from "../AshokaChakra";
import { DistrictMap, MapLegend, type Layer } from "./DistrictMap";
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

type NavId =
  | "command"
  | "map"
  | "logistics"
  | "risk"
  | "incidents"
  | "districts"
  | "routes"
  | "ai"
  | "alerts"
  | "analytics"
  | "reports"
  | "settings";

const NAV: { id: NavId; label: string; Icon: typeof Home }[] = [
  { id: "command", label: "Command Center", Icon: Home },
  { id: "map", label: "Regional Map", Icon: MapPin },
  { id: "logistics", label: "Live Logistics", Icon: Truck },
  { id: "incidents", label: "Incidents", Icon: Warning },
  { id: "routes", label: "Routes", Icon: RouteNodes },
  { id: "ai", label: "AI Predictions", Icon: Sparkle },
  { id: "alerts", label: "Alerts", Icon: Bell },
  { id: "analytics", label: "Analytics", Icon: BarChart },
];

const GOLD = "#d9a441";

export default function ControlRoomApp({ onSignOut }: { onSignOut: () => void }) {
  const [screen, setScreen] = useState<NavId>("command");
  const [drawer, setDrawer] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const alertsBadge = 5;

  const go = (id: NavId) => {
    setScreen(id);
    setDrawer(false);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-paper font-noto">
      {/* ── Command-center header ── */}
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/25 bg-white/10 active:bg-white/20"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-public text-[19px] font-bold leading-tight">Regional Control Center</h1>
            <p className="truncate font-noto text-[12.5px] text-white/70">North Eastern Region</p>
          </div>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-md border border-white/25 bg-white/10 active:bg-white/20" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical px-1 font-public text-[10px] font-bold">
              {alertsBadge}
            </span>
          </button>
          <button
            onClick={() => setProfileOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-public text-[13px] font-extrabold text-navy transition-transform active:scale-90"
            style={{ background: GOLD }}
            aria-label="Profile"
          >
            CO
          </button>
        </div>
        {/* status row */}
        <div className="mt-2.5 flex items-center gap-3 font-noto text-[11.5px] text-white/70">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#5fd39a]" /> System Operational
          </span>
          <span className="inline-flex items-center gap-1"><Clock size={12} /> Last Updated: Just now</span>
          <span className="ml-auto rounded border border-white/25 bg-white/10 px-1.5 py-0.5 font-public text-[10px] font-bold uppercase tracking-[0.08em] text-white/80">
            Demo
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          <Screen id={screen} go={go} />
        </div>
      </div>

      {drawer && (
        <Drawer screen={screen} go={go} onClose={() => setDrawer(false)} alertsBadge={alertsBadge} />
      )}

      {profileOpen && (
        <ProfileScreen
          profileRole="control"
          onClose={() => setProfileOpen(false)}
          onSignOut={onSignOut}
        />
      )}
    </div>
  );
}

function Screen({ id, go }: { id: NavId; go: (id: NavId) => void }) {
  switch (id) {
    case "command":
      return <CommandCenter go={go} />;
    case "map":
      return <RegionalMap />;
    case "logistics":
      return <LiveLogistics />;
    case "risk":
      return <RiskIntelligence />;
    case "incidents":
      return <IncidentsScreen />;
    case "districts":
      return <Districts />;
    case "routes":
      return <RoutesScreen />;
    case "ai":
      return <AiPredictions />;
    case "alerts":
      return <AlertsScreen />;
    case "analytics":
      return <AnalyticsScreen />;
    case "reports":
      return <ReportsScreen />;
    case "settings":
      return <SettingsScreen />;
  }
}

// ════════════════════════════════════════════════════════════════
// Drawer
// ════════════════════════════════════════════════════════════════
function Drawer({
  screen,
  go,
  onClose,
  alertsBadge,
}: {
  screen: NavId;
  go: (id: NavId) => void;
  onClose: () => void;
  alertsBadge: number;
}) {
  return (
    <div className="absolute inset-0 z-40 flex" style={{ animation: "quietFade 140ms ease-out" }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-[80%] max-w-[300px] flex-col bg-navy text-white" style={{ animation: "slideRight 200ms ease-out" }}>
        <div className="flex items-center gap-3 border-b border-white/12 px-4 py-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg font-public text-[15px] font-extrabold text-navy" style={{ background: GOLD }}>
            CO
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-public text-[15px] font-bold leading-tight">Control Officer</p>
            <p className="truncate font-noto text-[11.5px] text-white/60">NER Regional Command</p>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="text-white/70 active:text-white">
            <XIcon size={20} />
          </button>
        </div>
        {/* Scope block */}
        <div className="border-b border-white/12 px-4 py-3">
          <p className="font-public text-[10.5px] font-bold uppercase tracking-[0.1em] text-white/50">Regional Control</p>
          <p className="mt-0.5 font-noto text-[13px] font-medium text-white/90">North Eastern Region · 8 states</p>
          <p className="mt-1.5 inline-flex items-center gap-1.5 font-noto text-[12px] text-white/70">
            <span className="h-2 w-2 rounded-full bg-[#5fd39a]" /> System Online
          </p>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto py-2">
          <p className="px-4 pb-1 pt-2 font-public text-[10.5px] font-bold uppercase tracking-[0.1em] text-white/40">Main Menu</p>
          {NAV.map(({ id, label, Icon }) => {
            const on = screen === id;
            return (
              <button
                key={id}
                onClick={() => go(id)}
                className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${on ? "bg-white/10" : "active:bg-white/5"}`}
              >
                {on && <span className="absolute left-0 top-1 bottom-1 w-1 rounded-r" style={{ background: GOLD }} />}
                <span className="flex shrink-0" style={on ? { color: GOLD } : undefined}>
                  <Icon size={20} className={on ? "" : "text-white/70"} strokeWidth={on ? 2.1 : 1.75} />
                </span>
                <span className={`flex-1 font-public text-[15px] ${on ? "font-bold" : "font-medium text-white/85"}`}>{label}</span>
                {id === "alerts" && alertsBadge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-critical px-1 font-public text-[11px] font-bold">{alertsBadge}</span>
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
// Data (region-wide · DEMO DATA)
// ════════════════════════════════════════════════════════════════
interface CritEvent {
  id: string;
  severity: Priority;
  title: string;
  district: string;
  routes: string;
  impact: string;
  time: string;
  cta?: string;
}
const CRITICAL: CritEvent[] = [
  { id: "INC-4471", severity: "critical", title: "Flood near NH-29", district: "Dimapur, Nagaland", routes: "NH-29", impact: "2 relief routes affected · 4 shipments held", time: "6 min ago", cta: "View Incident" },
  { id: "INC-4460", severity: "critical", title: "Landslide blocking route", district: "Kohima, Nagaland", routes: "NH-2", impact: "Corridor severed · ~900 residents cut off", time: "34 min ago", cta: "View Details" },
  { id: "INC-4455", severity: "high", title: "Logistics delay building", district: "Dimapur, Nagaland", routes: "NH-29", impact: "6 convoys slowed · avg +2h ETA", time: "12 min ago", cta: "View Logistics" },
];

interface RiskCard {
  name: string;
  score: number;
  level: string;
  trend: number;
}
const RISKS: RiskCard[] = [
  { name: "Overall risk", score: 78, level: "Critical", trend: 6 },
  { name: "Flood risk", score: 82, level: "High", trend: 4 },
  { name: "Landslide risk", score: 71, level: "High", trend: 3 },
  { name: "Route risk", score: 76, level: "Critical", trend: 5 },
  { name: "Logistics risk", score: 68, level: "High", trend: 2 },
];

interface DistrictRow {
  name: string;
  state: string;
  risk: Priority;
  score: number;
  incidents: number;
  criticals: number;
  routes: number;
  logistics: string;
  status: string;
}
const DISTRICTS: DistrictRow[] = [
  { name: "Dimapur", state: "Nagaland", risk: "critical", score: 81, incidents: 6, criticals: 3, routes: 4, logistics: "6 delayed", status: "On alert" },
  { name: "Kohima", state: "Nagaland", risk: "critical", score: 74, incidents: 3, criticals: 2, routes: 2, logistics: "2 held", status: "On alert" },
  { name: "Kamrup", state: "Assam", risk: "high", score: 58, incidents: 4, criticals: 0, routes: 1, logistics: "1 delayed", status: "Monitoring" },
  { name: "Papum Pare", state: "Arunachal Pr.", risk: "medium", score: 39, incidents: 1, criticals: 0, routes: 0, logistics: "On time", status: "Stable" },
  { name: "Imphal West", state: "Manipur", risk: "low", score: 21, incidents: 0, criticals: 0, routes: 0, logistics: "On time", status: "Stable" },
  { name: "Aizawl", state: "Mizoram", risk: "medium", score: 44, incidents: 1, criticals: 0, routes: 1, logistics: "1 delayed", status: "Monitoring" },
];

interface Veh {
  id: string;
  route: string;
  dest: string;
  status: string;
  risk: Priority;
  eta: string;
}
const FLEET: Veh[] = [
  { id: "TRK-1042", route: "NH-29", dest: "Kohima", status: "Delayed", risk: "high", eta: "+2h" },
  { id: "TRK-1088", route: "NH-2", dest: "Kohima", status: "At risk", risk: "critical", eta: "—" },
  { id: "TRK-1015", route: "NH-29", dest: "Dimapur", status: "Moving", risk: "low", eta: "16:05" },
  { id: "TRK-0994", route: "NH-39", dest: "Chumukedima", status: "Moving", risk: "low", eta: "11:20" },
];

// ════════════════════════════════════════════════════════════════
// 1 · Command Center (flagship)
// ════════════════════════════════════════════════════════════════
function CommandCenter({ go }: { go: (id: NavId) => void }) {
  const [mapOpen, setMapOpen] = useState(false);
  const [sel, setSel] = useState<CritEvent | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);

  const refresh = () => {
    setRefreshing(true);
    setJustUpdated(false);
    window.setTimeout(() => {
      setRefreshing(false);
      setJustUpdated(true);
    }, 900);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-public text-[15px] font-bold text-navy">What&apos;s happening across NER</p>
          <p className="font-noto text-[12px] text-ink/70">Live regional situation</p>
        </div>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-white px-2.5 py-1.5 font-public text-[12px] font-semibold text-navy active:bg-black/[0.03]"
        >
          <span className={refreshing ? "inline-flex" : "inline-flex"} style={refreshing ? { animation: "spinSlow 0.9s linear infinite" } : undefined}>
            {justUpdated && !refreshing ? <Check size={14} className="text-clear" /> : <RefreshCw size={14} />}
          </span>
          {refreshing ? "Updating…" : justUpdated ? "Updated just now" : "Refresh"}
        </button>
      </div>

      {/* 1 · Regional KPI strip */}
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4 pb-1">
        <KpiCard label="Active incidents" value={27} tone="navy" w />
        <KpiCard label="Critical incidents" value="06" tone="critical" w />
        <KpiCard label="Affected routes" value={14} tone="saffron" w />
        <KpiCard label="At-risk logistics" value={18} tone="saffron" w />
        <KpiCard label="Districts on alert" value="04" tone="critical" w />
        <KpiCard label="Regional access." value="68/100" tone="saffron" w />
      </div>

      {/* 2 · Regional Situation Map */}
      <SectionTitle action={<button onClick={() => setMapOpen(true)} className="font-public text-[13px] font-semibold text-navy">Expand</button>}>
        Regional situation map
      </SectionTitle>
      <Card onClick={() => setMapOpen(true)} className="overflow-hidden">
        <div className="h-[160px] w-full">
          <DistrictMap layers={{ roads: true, risk: true, incidents: true, vehicles: true, infra: false }} height={160} />
        </div>
        <div className="border-t border-hairline px-3.5 py-2 font-noto text-[12px] text-ink">
          8 states · 6 critical incidents · 18 vehicles in motion · tap to expand
        </div>
      </Card>

      {/* 3 · Critical Situation panel */}
      <SectionTitle action={<button onClick={() => go("incidents")} className="font-public text-[13px] font-semibold text-navy">View all</button>}>
        Critical situation
      </SectionTitle>
      <div className="flex flex-col gap-2.5">
        {CRITICAL.map((e) => (
          <Card key={e.id} className={`p-3.5 ${e.severity === "critical" ? "border-l-[3px] border-l-critical" : ""}`}>
            <div className="flex items-start justify-between gap-2">
              <span className="font-public text-[14px] font-bold text-navy">{e.title}</span>
              <PriorityBadge level={e.severity} />
            </div>
            <p className="mt-1 flex items-center gap-1 font-noto text-[12px] text-ink"><MapPin size={12} className="text-ink/60" /> {e.district} · {e.routes}</p>
            <p className="mt-1 font-noto text-[12.5px] text-ink">{e.impact}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-noto text-[11px] text-ink/60"><Clock size={11} className="mr-1 inline" />{e.time}</span>
              <button onClick={() => setSel(e)} className="rounded border border-navy px-3 py-1 font-public text-[12px] font-bold text-navy active:bg-navy/5">{e.cta ?? "View"}</button>
            </div>
          </Card>
        ))}
        <button onClick={() => go("incidents")} className="mt-0.5 w-full rounded-md border border-hairline bg-white py-2.5 font-public text-[13px] font-semibold text-navy active:bg-black/[0.03]">
          View All Critical Events
        </button>
      </div>

      {/* 4 · Regional Risk Intelligence */}
      <SectionTitle action={<button onClick={() => go("risk")} className="font-public text-[13px] font-semibold text-navy">Details</button>}>
        Regional risk intelligence
      </SectionTitle>
      <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
        {RISKS.map((r) => (
          <RiskMini key={r.name} r={r} />
        ))}
      </div>

      {/* 5 · District Situation */}
      <SectionTitle action={<button onClick={() => go("districts")} className="font-public text-[13px] font-semibold text-navy">All districts</button>}>
        District situation
      </SectionTitle>
      <div className="flex flex-col gap-2.5">
        {DISTRICTS.slice(0, 3).map((d) => (
          <DistrictCard key={d.name} d={d} onClick={() => go("districts")} />
        ))}
      </div>

      {/* 6 · Live Logistics */}
      <SectionTitle action={<button onClick={() => go("logistics")} className="font-public text-[13px] font-semibold text-navy">Live logistics</button>}>
        <span className="inline-flex items-center gap-2">
          Live logistics
          <span className="inline-flex items-center gap-1 font-noto text-[11px] font-normal text-critical">
            <span className="h-1.5 w-1.5 rounded-full bg-critical" /> LIVE
          </span>
        </span>
      </SectionTitle>
      <p className="-mt-1 mb-2 font-noto text-[11px] text-ink/60">Last updated: 10 sec ago</p>
      <div className="flex flex-col gap-2.5">
        {FLEET.slice(0, 3).map((v) => (
          <FleetCard key={v.id} v={v} onClick={() => go("logistics")} />
        ))}
        <button onClick={() => go("logistics")} className="mt-0.5 w-full rounded-md border border-hairline bg-white py-2.5 font-public text-[13px] font-semibold text-navy active:bg-black/[0.03]">
          View Live Logistics
        </button>
      </div>

      {/* 7 · AI Predictions */}
      <SectionTitle action={<button onClick={() => go("ai")} className="font-public text-[13px] font-semibold text-navy">All predictions</button>}>
        AI predictions
      </SectionTitle>
      <div className="flex flex-col gap-2.5">
        <AiCard kind="AI-generated prediction" confidence={87} title="Flood Risk Prediction — Dimapur">
          HIGH impact expected within the next 6 hours near Dimapur. Confidence 87%.
        </AiCard>
        <AiCard kind="AI-generated prediction" confidence={78} title="Route Disruption Prediction — NH-29">
          78% probability of disruption on NH-29 · HIGH impact on relief corridor.
        </AiCard>
        <AiCard kind="AI-generated prediction" confidence={81} title="Logistics Delay Prediction">
          2–4 hour delay projected across affected convoys. Confidence 81%.
        </AiCard>
        <button onClick={() => go("ai")} className="mt-0.5 w-full rounded-md border border-hairline bg-white py-2.5 font-public text-[13px] font-semibold text-navy active:bg-black/[0.03]">
          View All Predictions
        </button>
      </div>

      {/* 8 · Priority Actions */}
      <SectionTitle>Priority actions</SectionTitle>
      <div className="flex flex-col gap-2.5">
        <ActionRow tone="critical" title="Review flood incident" loc="Dimapur · Nagaland" time="6 min ago" onReview={() => go("incidents")} />
        <ActionRow tone="critical" title="Monitor NH-29 disruption" loc="NH-29 corridor" time="12 min ago" onReview={() => go("map")} />
        <ActionRow tone="saffron" title="Review delayed logistics" loc="TRK-1042 · NH-29" time="10 sec ago" onReview={() => go("logistics")} />
        <ActionRow tone="saffron" title="Monitor Dimapur risk escalation" loc="Dimapur · Nagaland" time="18 min ago" onReview={() => go("risk")} />
        <ActionRow tone="saffron" title="Review AI flood prediction" loc="Dimapur · 87% confidence" time="Just now" onReview={() => go("ai")} />
      </div>

      {/* 9 · Alert Summary */}
      <SectionTitle action={<button onClick={() => go("alerts")} className="font-public text-[13px] font-semibold text-navy">View alerts</button>}>
        Alert summary
      </SectionTitle>
      <Card className="flex flex-wrap items-center gap-2 p-3.5">
        <StatusChip tone="critical"><Warning size={12} /> Critical 06</StatusChip>
        <StatusChip tone="saffron"><Warning size={12} /> High 11</StatusChip>
        <StatusChip tone="navy">Moderate 18</StatusChip>
        <StatusChip tone="muted">Information 24</StatusChip>
      </Card>

      {/* 10 · Regional Accessibility */}
      <SectionTitle>Regional accessibility</SectionTitle>
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-public text-[14px] font-bold text-navy">Score 68/100</span>
          <span className="inline-flex items-center gap-1 rounded border border-critical/30 bg-critical/5 px-2 py-0.5 font-public text-[12px] font-bold text-critical">
            <Warning size={12} /> HIGH IMPACT
          </span>
        </div>
        <AccessScore score={68} />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[["Fully accessible", "62%", "text-clear"], ["Partially", "24%", "text-saffron"], ["Restricted", "14%", "text-critical"]].map(([l, v, c]) => (
            <div key={l} className="rounded border border-hairline p-2 text-center">
              <p className={`font-public text-[17px] font-bold ${c}`}>{v}</p>
              <p className="font-noto text-[10px] text-ink">{l}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 11 · Quick Actions */}
      <SectionTitle>Quick actions</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        <QuickAction Icon={Warning} label="View Critical Incidents" onClick={() => go("incidents")} />
        <QuickAction Icon={MapPin} label="Regional Map" onClick={() => go("map")} />
        <QuickAction Icon={Truck} label="Live Logistics" onClick={() => go("logistics")} />
        <QuickAction Icon={Shield} label="Risk Intelligence" onClick={() => go("risk")} />
        <QuickAction Icon={Sparkle} label="AI Predictions" onClick={() => go("ai")} />
        <QuickAction Icon={FileText} label="Generate Report" onClick={() => go("reports")} />
      </div>

      {mapOpen && <FullMap onClose={() => setMapOpen(false)} />}
      {sel && (
        <BottomSheet title={sel.title} onClose={() => setSel(null)}>
          <div className="mt-2 flex items-center justify-between">
            <span className="rounded bg-navy px-2 py-0.5 font-public text-[12px] font-bold text-white">{sel.id}</span>
            <PriorityBadge level={sel.severity} />
          </div>
          <DetailRows
            rows={[
              ["District", sel.district],
              ["Affected routes", sel.routes],
              ["Impact", sel.impact],
              ["Reported", sel.time],
            ]}
          />
          <div className="mt-3">
            <AiCard kind="AI-generated risk estimate" confidence={81} title="Escalation likely">
              Recommend regional reroute + pre-staging clearing crews at Umiam depot.
            </AiCard>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 2 · Regional Map
// ════════════════════════════════════════════════════════════════
const LAYER_LABELS: { id: Layer; label: string }[] = [
  { id: "roads", label: "Roads" },
  { id: "incidents", label: "Incidents" },
  { id: "risk", label: "Flood Risk" },
  { id: "vehicles", label: "Logistics" },
  { id: "infra", label: "Infrastructure" },
];

const MAP_ROUTES = [
  { id: "NH-27", name: "NH-27 East-West Corridor", status: "Blocked" as const, info: "Heavy Rain · Barpeta/Assam" },
  { id: "NH-2", name: "NH-2 Kohima-Imphal Corridor", status: "Restricted" as const, info: "Moderate Rain · Nagaland" },
  { id: "NH-306", name: "NH-306 Aizawl-Lunglei Highway", status: "Restricted" as const, info: "Cloudy · Mizoram" },
  { id: "NH-6", name: "NH-6 Silchar-Jiribam Corridor", status: "Restricted" as const, info: "Light Rain · Assam" },
  { id: "NH-13", name: "NH-13 Tawang Highway", status: "Closed" as const, info: "Fog+Rain · Arunachal Pradesh" },
  { id: "NH-40", name: "NH-40 Guwahati-Shillong", status: "Open" as const, info: "Partly Cloudy · Meghalaya" },
  { id: "NH-10", name: "NH-10 Siliguri-Gangtok", status: "Open" as const, info: "Clear · Sikkim" },
];

const STATUS_COLORS = {
  Blocked: { bg: "bg-critical/10", text: "text-critical", border: "border-critical/30" },
  Restricted: { bg: "bg-saffron/10", text: "text-saffron", border: "border-saffron/30" },
  Closed: { bg: "bg-critical/15", text: "text-critical", border: "border-critical/40" },
  Open: { bg: "bg-clear/10", text: "text-clear", border: "border-clear/30" },
};

function RegionalMap() {
  const [layers, setLayers] = useState<Record<Layer, boolean>>({ roads: true, risk: true, incidents: true, vehicles: true, infra: false });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [riskFilter, setRiskFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("Last 24 hours");
  const [simOpen, setSimOpen] = useState(false);
  const [simRoute, setSimRoute] = useState<string | null>(null);
  const [simDone, setSimDone] = useState(false);

  const runSim = (r: string) => {
    setSimRoute(r);
    setSimDone(false);
    setSimOpen(false);
    setTimeout(() => setSimDone(true), 900);
  };

  return (
    <div>
      {/* Page head */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-public text-[20px] font-bold leading-tight text-navy">District Map</h2>
            <p className="mt-0.5 font-noto text-[12px] text-ink/70">Geospatial intelligence — routes, incidents, logistics</p>
          </div>
          <button
            onClick={() => setSimOpen(true)}
            className="shrink-0 rounded-md bg-saffron px-3 py-2 font-public text-[12px] font-bold text-white active:opacity-80"
          >
            Simulate Route Closure
          </button>
        </div>
      </div>

      {/* Filter toggle */}
      <button
        onClick={() => setFiltersOpen((v) => !v)}
        className="mb-2.5 flex w-full items-center justify-between rounded-md border border-hairline bg-white px-3.5 py-2.5 font-public text-[13px] font-semibold text-navy active:bg-black/[0.02]"
      >
        <span className="flex items-center gap-2"><Filter size={15} /> Map Filters</span>
        <span className="font-noto text-[12px] text-ink/50">{filtersOpen ? "▲ hide" : "▼ show"}</span>
      </button>

      {filtersOpen && (
        <div className="mb-3 rounded-md border border-hairline bg-white p-4 space-y-4">
          {/* Layer checkboxes */}
          <div>
            <p className="mb-2 font-public text-[11px] font-bold uppercase tracking-wider text-ink/50">Map Layers</p>
            <div className="grid grid-cols-2 gap-2">
              {LAYER_LABELS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setLayers((s) => ({ ...s, [id]: !s[id] }))}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 font-noto text-[13px] transition-colors ${layers[id] ? "border-navy bg-navy/5 text-navy" : "border-hairline text-ink/60"}`}
                >
                  <span className={`h-3.5 w-3.5 shrink-0 rounded-sm border-2 ${layers[id] ? "border-navy bg-navy" : "border-ink/30"}`} />
                  {label}
                </button>
              ))}
              {/* Landslide Risk */}
              <button className="flex items-center gap-2 rounded-md border border-hairline px-3 py-2 font-noto text-[13px] text-ink/60">
                <span className="h-3.5 w-3.5 shrink-0 rounded-sm border-2 border-ink/30" />
                Landslide Risk
              </button>
            </div>
          </div>
          {/* Risk Level */}
          <div>
            <p className="mb-2 font-public text-[11px] font-bold uppercase tracking-wider text-ink/50">Risk Level</p>
            <div className="flex flex-wrap gap-2">
              {["Low", "Moderate", "High", "Critical"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r === riskFilter ? "All" : r)}
                  className={`rounded-full border px-3 py-1 font-public text-[12px] font-semibold ${riskFilter === r ? "border-navy bg-navy text-white" : "border-hairline bg-white text-ink"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {/* Time Range */}
          <div>
            <p className="mb-2 font-public text-[11px] font-bold uppercase tracking-wider text-ink/50">Time Range</p>
            <div className="flex flex-wrap gap-2">
              {["Last 1 hour", "Last 6 hours", "Last 24 hours", "Last 7 days"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeFilter(t)}
                  className={`rounded-full border px-3 py-1 font-public text-[12px] font-semibold ${timeFilter === t ? "border-navy bg-navy text-white" : "border-hairline bg-white text-ink"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {simDone && simRoute && (
        <div className="mb-3 rounded-md border border-saffron/40 bg-saffron/5 p-3.5">
          <p className="font-public text-[13px] font-bold text-saffron">Simulation: {simRoute} Closure</p>
          <p className="mt-1 font-noto text-[12px] text-ink">Impact: 3 convoys rerouted · +45m average delay · Alternate via NH-37 recommended.</p>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="h-[300px] w-full"><DistrictMap layers={layers} height={300} /></div>
      </Card>
      <div className="mt-3"><MapLegend /></div>

      {/* Routes list */}
      <SectionTitle>Route Status</SectionTitle>
      <div className="flex flex-col gap-2">
        {MAP_ROUTES.map((r) => {
          const c = STATUS_COLORS[r.status];
          return (
            <Card key={r.id} className="flex items-center gap-3 p-3.5">
              <span className="rounded bg-navy px-1.5 py-0.5 font-public text-[11px] font-bold text-white shrink-0">{r.id}</span>
              <div className="flex-1 min-w-0">
                <p className="font-public text-[13px] font-semibold text-navy truncate">{r.name}</p>
                <p className="font-noto text-[11px] text-ink/60 mt-0.5">{r.info}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 font-public text-[11px] font-bold ${c.bg} ${c.text} ${c.border}`}>{r.status}</span>
            </Card>
          );
        })}
      </div>

      {/* Simulate closure modal */}
      {simOpen && (
        <BottomSheet title="Simulate Route Closure" onClose={() => setSimOpen(false)}>
          <p className="mt-1 mb-3 font-noto text-[12px] text-ink/70">Select a route to model the impact of closure on logistics and accessibility.</p>
          <div className="flex flex-col gap-2">
            {MAP_ROUTES.filter((r) => r.status !== "Open").map((r) => (
              <button key={r.id} onClick={() => runSim(r.id)} className="flex items-center gap-3 rounded-md border border-hairline bg-white p-3 text-left active:bg-navy/5">
                <span className="rounded bg-navy px-1.5 py-0.5 font-public text-[11px] font-bold text-white">{r.id}</span>
                <span className="font-noto text-[13px] text-navy">{r.name}</span>
              </button>
            ))}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

function FullMap({ onClose }: { onClose: () => void }) {
  const [layers, setLayers] = useState<Record<Layer, boolean>>({ roads: true, risk: true, incidents: true, vehicles: true, infra: true });
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-paper" style={{ animation: "quietFade 200ms ease-out" }}>
      <div className="flex items-center justify-between border-b border-hairline bg-white px-4 py-3">
        <p className="font-public text-[15px] font-bold text-navy">Regional situation map</p>
        <button onClick={onClose} aria-label="Close"><XIcon size={20} className="text-ink" /></button>
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2.5">
        {LAYER_LABELS.map((l) => {
          const on = layers[l.id];
          return (
            <button
              key={l.id}
              onClick={() => setLayers((s) => ({ ...s, [l.id]: !s[l.id] }))}
              className={`shrink-0 rounded-full border px-3 py-1.5 font-public text-[12.5px] font-semibold ${on ? "border-navy bg-navy text-white" : "border-hairline bg-white text-ink"}`}
            >
              {l.label}
            </button>
          );
        })}
      </div>
      <div className="min-h-0 flex-1"><DistrictMap layers={layers} height={9999} /></div>
      <div className="border-t border-hairline bg-white p-3"><MapLegend /></div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 3 · Live Logistics
// ════════════════════════════════════════════════════════════════
interface LogRow {
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

const LOGISTICS_DATA: LogRow[] = [
  { id: "LG-102", cargo: "Medical Supplies", origin: "Guwahati", dest: "Kohima", location: "Near Dimapur", route: "NH-2", eta: "4:40 PM", delay: "+1h 15m", risk: "high", status: "At Risk" },
  { id: "LG-115", cargo: "Food Rations", origin: "Barpeta", dest: "Tezpur", location: "NH-27 Km 42", route: "NH-27", eta: "Suspended", delay: "Indefinite", risk: "critical", status: "Stopped" },
  { id: "LG-089", cargo: "Relief Materials", origin: "Sonitpur", dest: "Itanagar", location: "Sonitpur outskirts", route: "NH-13", eta: "Suspended", delay: "Indefinite", risk: "critical", status: "Stopped" },
  { id: "LG-134", cargo: "Construction Materials", origin: "Guwahati", dest: "Shillong", location: "Near Jorabat", route: "NH-40", eta: "2:15 PM", delay: "None", risk: "low", status: "On Time" },
  { id: "LG-098", cargo: "Fuel Supplies", origin: "Dibrugarh", dest: "Jorhat", location: "Dibrugarh bypass", route: "NH-37", eta: "1:45 PM", delay: "+25m", risk: "medium", status: "Delayed" },
  { id: "LG-121", cargo: "Telecom Equipment", origin: "Senapati", dest: "Kohima", location: "Mao Gate checkpoint", route: "NH-2", eta: "5:30 PM", delay: "+1h 30m", risk: "high", status: "At Risk" },
];

const AT_RISK_CONVOYS = [
  { id: "LG-102", cargo: "Medical Supplies", route: "Near Dimapur → Kohima, NH-2", eta: "4:40 PM", risk: "high" as Priority, delay: "+1h 15m" },
  { id: "LG-089", cargo: "Relief Materials", route: "Sonitpur → Itanagar, NH-13", eta: "Suspended", risk: "critical" as Priority, delay: "Indefinite" },
  { id: "LG-121", cargo: "Telecom Equipment", route: "Senapati → Kohima, NH-2", eta: "5:30 PM", risk: "high" as Priority, delay: "+1h 30m" },
];

const STATUS_CHIP_TONE: Record<string, "critical" | "saffron" | "clear" | "navy"> = {
  "At Risk": "saffron",
  "Stopped": "critical",
  "On Time": "clear",
  "Delayed": "saffron",
};

function LiveLogistics() {
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-public text-[20px] font-bold leading-tight text-navy">Logistics</h2>
          <p className="mt-0.5 font-noto text-[12px] text-ink/70">District logistics monitoring and convoy management</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 font-noto text-[11px] text-critical"><span className="h-1.5 w-1.5 rounded-full bg-critical" /> LIVE</span>
          <DemoTag />
        </div>
      </div>

      {/* KPI tiles */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <KpiTile label="Active Vehicles" value={5} tone="navy" />
        <KpiTile label="Delayed Vehicles" value={3} tone="saffron" />
        <KpiTile label="At-Risk Shipments" value={3} tone="critical" />
        <KpiTile label="Stopped" value={1} tone="critical" />
      </div>

      {/* Active Convoys map */}
      <SectionTitle>Active Convoys</SectionTitle>
      <Card className="overflow-hidden">
        <div className="h-[150px]"><DistrictMap layers={{ roads: true, risk: false, incidents: false, vehicles: true, infra: false }} height={150} /></div>
      </Card>

      {/* At-Risk Convoys */}
      <SectionTitle>At-Risk Convoys</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {AT_RISK_CONVOYS.map((c) => (
          <Card key={c.id} className={`p-3.5 ${c.risk === "critical" ? "border-l-[3px] border-l-critical" : "border-l-[3px] border-l-saffron"}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="rounded bg-navy px-1.5 py-0.5 font-public text-[11px] font-bold text-white">{c.id}</span>
                <span className="ml-2 font-public text-[13px] font-semibold text-navy">{c.cargo}</span>
              </div>
              <PriorityBadge level={c.risk} />
            </div>
            <p className="mt-1.5 font-noto text-[12px] text-ink/70">{c.route}</p>
            <div className="mt-2 flex items-center gap-4 font-noto text-[12px]">
              <span className="text-ink"><Clock size={11} className="mr-1 inline text-ink/50" />ETA {c.eta}</span>
              <span className="font-semibold text-critical">Delay {c.delay}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Logistics Table */}
      <SectionTitle>All Shipments</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {LOGISTICS_DATA.map((row) => (
          <Card key={row.id} className="p-3.5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-navy px-1.5 py-0.5 font-public text-[11px] font-bold text-white shrink-0">{row.id}</span>
                <span className="font-public text-[13px] font-semibold text-navy">{row.cargo}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <PriorityBadge level={row.risk} />
                <StatusChip tone={STATUS_CHIP_TONE[row.status] ?? "navy"}>{row.status}</StatusChip>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-noto text-[12px]">
              <span className="text-ink/60">Origin: <span className="font-medium text-navy">{row.origin}</span></span>
              <span className="text-ink/60">Dest: <span className="font-medium text-navy">{row.dest}</span></span>
              <span className="text-ink/60">Location: <span className="font-medium text-navy">{row.location}</span></span>
              <span className="text-ink/60">Route: <span className="font-medium text-navy">{row.route}</span></span>
              <span className="text-ink/60">ETA: <span className="font-medium text-navy">{row.eta}</span></span>
              <span className={`font-semibold ${row.delay === "None" ? "text-clear" : "text-critical"}`}>Delay: {row.delay}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 4 · Risk Intelligence
// ════════════════════════════════════════════════════════════════
function RiskIntelligence() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-public text-[13px] font-semibold text-ink">Regional risk model</p>
        <DemoTag />
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        {RISKS.map((r) => (
          <Card key={r.name} className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-public text-[14px] font-bold text-navy">{r.name}</span>
              <span className={`inline-flex items-center gap-0.5 font-public text-[12px] font-bold ${r.trend >= 0 ? "text-critical" : "text-clear"}`}>
                {r.trend >= 0 ? "↑ Increasing" : "↓ Easing"}
              </span>
            </div>
            <div className="mt-2"><AccessScore score={r.score} /></div>
            <p className="mt-2 font-noto text-[11px] italic text-ink/60">
              AI-generated risk estimate · {r.level}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 5 · Incidents
// ════════════════════════════════════════════════════════════════
type IncidentStatus = "Pending Verification" | "Active" | "Escalated" | "Resolved";

interface IncidentRow {
  id: string;
  type: string;
  location: string;
  state: string;
  route: string;
  severity: Priority;
  reportedBy: string;
  time: string;
  verified: "Pending" | "Verified";
  assignedTo: string;
  status: IncidentStatus;
}

const INCIDENTS: IncidentRow[] = [
  { id: "INC-2026-041", type: "Flood", location: "Barpeta", state: "Assam", route: "NH-27", severity: "critical", reportedBy: "FO-102", time: "10:32 AM", verified: "Pending", assignedTo: "—", status: "Pending Verification" },
  { id: "INC-2026-042", type: "Landslide", location: "Kohima-Imphal Highway", state: "Nagaland", route: "NH-2", severity: "high", reportedBy: "FO-118", time: "09:48 AM", verified: "Verified", assignedTo: "FO-121", status: "Active" },
  { id: "INC-2026-043", type: "Road Blockage", location: "Aizawl District", state: "Mizoram", route: "NH-306", severity: "high", reportedBy: "FO-134", time: "08:15 AM", verified: "Verified", assignedTo: "FO-109", status: "Escalated" },
  { id: "INC-2026-044", type: "Flood", location: "Silchar", state: "Assam", route: "NH-6", severity: "medium", reportedBy: "FO-107", time: "07:50 AM", verified: "Verified", assignedTo: "FO-115", status: "Active" },
  { id: "INC-2026-045", type: "Infrastructure Damage", location: "Tawang", state: "Arunachal Pradesh", route: "NH-13", severity: "critical", reportedBy: "FO-128", time: "06:30 AM", verified: "Pending", assignedTo: "—", status: "Pending Verification" },
  { id: "INC-2026-038", type: "Vehicle Breakdown", location: "Gangtok", state: "Sikkim", route: "NH-10", severity: "low", reportedBy: "FO-101", time: "Yesterday 4:15 PM", verified: "Verified", assignedTo: "FO-103", status: "Resolved" },
  { id: "INC-2026-039", type: "Accident", location: "Shillong", state: "Meghalaya", route: "NH-40", severity: "medium", reportedBy: "FO-113", time: "Yesterday 2:30 PM", verified: "Verified", assignedTo: "FO-116", status: "Resolved" },
];

type IncTab = "all" | "pending" | "active" | "escalated" | "resolved";

const INCTAB_FILTER: Record<IncTab, (r: IncidentRow) => boolean> = {
  all: () => true,
  pending: (r) => r.status === "Pending Verification",
  active: (r) => r.status === "Active",
  escalated: (r) => r.status === "Escalated",
  resolved: (r) => r.status === "Resolved",
};

const INC_STATUS_CHIP: Record<IncidentStatus, string> = {
  "Pending Verification": "border-saffron/40 bg-saffron/8 text-saffron",
  "Active": "border-navy/30 bg-navy/8 text-navy",
  "Escalated": "border-critical/40 bg-critical/8 text-critical",
  "Resolved": "border-clear/30 bg-clear/8 text-clear",
};

function IncidentsScreen() {
  const [tab, setTab] = useState<IncTab>("all");
  const [sel, setSel] = useState<IncidentRow | null>(null);
  const [verified, setVerified] = useState<string[]>([]);
  const list = INCIDENTS.filter(INCTAB_FILTER[tab]);

  return (
    <div>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h2 className="font-public text-[20px] font-bold leading-tight text-navy">Incidents</h2>
          <p className="mt-0.5 font-noto text-[12px] text-ink/70">Manage and verify incident reports across the district</p>
        </div>
        <DemoTag />
      </div>

      {/* Status tabs */}
      <ScrollTabs<IncTab>
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "all", label: "All", count: INCIDENTS.length },
          { id: "pending", label: "Pending", count: INCIDENTS.filter((r) => r.status === "Pending Verification").length },
          { id: "active", label: "Active", count: INCIDENTS.filter((r) => r.status === "Active").length },
          { id: "escalated", label: "Escalated", count: INCIDENTS.filter((r) => r.status === "Escalated").length },
          { id: "resolved", label: "Resolved", count: INCIDENTS.filter((r) => r.status === "Resolved").length },
        ]}
      />

      {/* Filters row */}
      <div className="mt-2.5 mb-3 flex gap-2">
        <select className="flex-1 rounded-md border border-hairline bg-white px-3 py-2 font-noto text-[12px] text-navy outline-none">
          <option>All Severity</option>
          <option>Critical</option><option>High</option><option>Moderate</option><option>Low</option>
        </select>
        <select className="flex-1 rounded-md border border-hairline bg-white px-3 py-2 font-noto text-[12px] text-navy outline-none">
          <option>All Types</option>
          <option>Flood</option><option>Landslide</option><option>Road Blockage</option><option>Infrastructure Damage</option>
        </select>
      </div>

      <div className="flex flex-col gap-2.5">
        {list.map((e) => {
          const isResolved = e.status === "Resolved";
          return (
            <Card
              key={e.id}
              onClick={() => setSel(e)}
              className={`p-3.5 ${e.severity === "critical" ? "border-l-[3px] border-l-critical" : e.severity === "high" ? "border-l-[3px] border-l-saffron" : ""} ${isResolved ? "opacity-70" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="rounded bg-navy px-1.5 py-0.5 font-public text-[10px] font-bold text-white shrink-0">{e.id}</span>
                    <span className="font-public text-[13px] font-semibold text-navy">{e.type}</span>
                  </div>
                  <p className="mt-0.5 font-noto text-[12px] text-ink/70">{e.location}, {e.state} · {e.route}</p>
                </div>
                <PriorityBadge level={e.severity} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 font-noto text-[11.5px] text-ink/60">
                <span>Reported: <span className="text-navy font-medium">{e.reportedBy}</span></span>
                <span>Time: <span className="text-navy font-medium">{e.time}</span></span>
                <span>Verified: <span className={verified.includes(e.id) ? "text-clear font-semibold" : e.verified === "Verified" ? "text-clear" : "text-saffron"}>{verified.includes(e.id) ? "Verified" : e.verified}</span></span>
                <span>Assigned: <span className="text-navy font-medium">{e.assignedTo}</span></span>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span className={`rounded-full border px-2 py-0.5 font-public text-[10.5px] font-semibold ${INC_STATUS_CHIP[e.status]}`}>{e.status}</span>
                <div className="flex gap-2">
                  <MiniBtn onClick={(ev: React.MouseEvent) => { ev.stopPropagation(); setSel(e); }}>View</MiniBtn>
                  {!isResolved && !verified.includes(e.id) && e.verified === "Pending" && (
                    <MiniBtn primary onClick={(ev: React.MouseEvent) => { ev.stopPropagation(); setVerified((v) => [...v, e.id]); }}>Verify</MiniBtn>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {sel && (
        <BottomSheet title={sel.type} onClose={() => setSel(null)}>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded bg-navy px-2 py-0.5 font-public text-[12px] font-bold text-white">{sel.id}</span>
            <PriorityBadge level={sel.severity} />
            <span className={`rounded-full border px-2 py-0.5 font-public text-[10.5px] font-semibold ${INC_STATUS_CHIP[sel.status]}`}>{sel.status}</span>
          </div>
          <DetailRows rows={[
            ["Location", `${sel.location}, ${sel.state}`],
            ["Route", sel.route],
            ["Reported By", sel.reportedBy],
            ["Time", sel.time],
            ["Verification", sel.verified],
            ["Assigned To", sel.assignedTo],
          ]} />
        </BottomSheet>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 6 · Districts
// ════════════════════════════════════════════════════════════════
function Districts() {
  const [sel, setSel] = useState<DistrictRow | null>(null);
  if (sel) {
    return (
      <div>
        <BackRow label="Districts" onBack={() => setSel(null)} />
        <h2 className="mt-1 font-public text-[19px] font-bold text-navy">{sel.name}</h2>
        <p className="font-noto text-[13px] text-ink">{sel.state}</p>
        <div className="mt-3"><AccessScore score={sel.score} /></div>
        <DetailRows
          rows={[
            ["Status", sel.status],
            ["Active incidents", String(sel.incidents)],
            ["Critical alerts", String(sel.criticals)],
            ["Affected routes", String(sel.routes)],
            ["Logistics", sel.logistics],
          ]}
        />
        <Card className="mt-3 overflow-hidden">
          <div className="h-[140px]"><DistrictMap layers={{ roads: true, risk: true, incidents: true, vehicles: true, infra: false }} height={140} /></div>
        </Card>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-public text-[13px] font-semibold text-ink">{DISTRICTS.length} districts · NER</p>
        <DemoTag />
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        {DISTRICTS.map((d) => <DistrictCard key={d.name} d={d} onClick={() => setSel(d)} />)}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 7 · Routes
// ════════════════════════════════════════════════════════════════
type RouteStatus = "Blocked" | "Restricted" | "Closed" | "Open";

interface RouteRow {
  id: string;
  name: string;
  state: string;
  km: number;
  score: number;
  status: RouteStatus;
  weather: string;
  eta: string;
  delay: string;
  updated: string;
}

const ROUTE_ROWS: RouteRow[] = [
  { id: "NH-27", name: "East-West Corridor", state: "Assam", km: 110, score: 82, status: "Blocked", weather: "Heavy Rain", eta: "6h 20m", delay: "+3h 40m", updated: "10:45 AM" },
  { id: "NH-2", name: "Kohima-Imphal Corridor", state: "Nagaland", km: 145, score: 48, status: "Restricted", weather: "Moderate Rain", eta: "4h 50m", delay: "+1h 15m", updated: "10:30 AM" },
  { id: "NH-306", name: "Aizawl-Lunglei Highway", state: "Mizoram", km: 95, score: 55, status: "Restricted", weather: "Cloudy", eta: "3h 10m", delay: "+45m", updated: "09:50 AM" },
  { id: "NH-6", name: "Silchar-Jiribam Corridor", state: "Assam", km: 205, score: 61, status: "Restricted", weather: "Light Rain", eta: "5h 40m", delay: "+1h 10m", updated: "10:15 AM" },
  { id: "NH-13", name: "Tawang Highway", state: "Arunachal Pradesh", km: 340, score: 78, status: "Closed", weather: "Fog+Rain", eta: "Unavailable", delay: "Indefinite", updated: "08:00 AM" },
  { id: "NH-40", name: "Guwahati-Shillong Highway", state: "Meghalaya", km: 100, score: 22, status: "Open", weather: "Partly Cloudy", eta: "2h 45m", delay: "None", updated: "10:50 AM" },
  { id: "NH-10", name: "Siliguri-Gangtok Highway", state: "Sikkim", km: 115, score: 18, status: "Open", weather: "Clear", eta: "3h 20m", delay: "+15m", updated: "10:55 AM" },
];

const ROUTE_STATUS_STYLE: Record<RouteStatus, string> = {
  Blocked: "border-critical/40 bg-critical/8 text-critical",
  Restricted: "border-saffron/40 bg-saffron/8 text-saffron",
  Closed: "border-critical/50 bg-critical/12 text-critical",
  Open: "border-clear/30 bg-clear/8 text-clear",
};

function RoutesScreen() {
  const [statusFilter, setStatusFilter] = useState<"All" | RouteStatus>("All");

  const open = ROUTE_ROWS.filter((r) => r.status === "Open").length;
  const restricted = ROUTE_ROWS.filter((r) => r.status === "Restricted").length;
  const blocked = ROUTE_ROWS.filter((r) => r.status === "Blocked").length;
  const closed = ROUTE_ROWS.filter((r) => r.status === "Closed").length;

  const filtered = statusFilter === "All" ? ROUTE_ROWS : ROUTE_ROWS.filter((r) => r.status === statusFilter);

  return (
    <div>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h2 className="font-public text-[20px] font-bold leading-tight text-navy">Routes</h2>
          <p className="mt-0.5 font-noto text-[12px] text-ink/70">Route intelligence and accessibility monitoring</p>
        </div>
        <DemoTag />
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <button onClick={() => setStatusFilter(statusFilter === "Open" ? "All" : "Open")} className={`rounded-md border p-3 text-left transition-colors ${statusFilter === "Open" ? "border-clear bg-clear/8" : "border-hairline bg-white"}`}>
          <p className="font-public text-[22px] font-bold text-clear leading-none">{open}</p>
          <p className="font-noto text-[12px] text-ink/70 mt-1">Open Routes</p>
        </button>
        <button onClick={() => setStatusFilter(statusFilter === "Restricted" ? "All" : "Restricted")} className={`rounded-md border p-3 text-left transition-colors ${statusFilter === "Restricted" ? "border-saffron bg-saffron/8" : "border-hairline bg-white"}`}>
          <p className="font-public text-[22px] font-bold text-saffron leading-none">{restricted}</p>
          <p className="font-noto text-[12px] text-ink/70 mt-1">Restricted</p>
        </button>
        <button onClick={() => setStatusFilter(statusFilter === "Blocked" ? "All" : "Blocked")} className={`rounded-md border p-3 text-left transition-colors ${statusFilter === "Blocked" ? "border-critical bg-critical/8" : "border-hairline bg-white"}`}>
          <p className="font-public text-[22px] font-bold text-critical leading-none">{blocked}</p>
          <p className="font-noto text-[12px] text-ink/70 mt-1">Blocked</p>
        </button>
        <button onClick={() => setStatusFilter(statusFilter === "Closed" ? "All" : "Closed")} className={`rounded-md border p-3 text-left transition-colors ${statusFilter === "Closed" ? "border-critical bg-critical/12" : "border-hairline bg-white"}`}>
          <p className="font-public text-[22px] font-bold text-critical leading-none">{closed}</p>
          <p className="font-noto text-[12px] text-ink/70 mt-1">Closed</p>
        </button>
      </div>

      {/* Status filter label */}
      {statusFilter !== "All" && (
        <button onClick={() => setStatusFilter("All")} className="mb-2 inline-flex items-center gap-2 rounded-full border border-navy/30 bg-navy/5 px-3 py-1 font-public text-[12px] font-semibold text-navy">
          Showing: {statusFilter} <span className="text-ink/40">× clear</span>
        </button>
      )}

      <div className="flex flex-col gap-2.5">
        {filtered.map((r) => {
          const band = accessBand(100 - r.score);
          const sc = STATUS_COLORS[r.status];
          return (
            <Card key={r.id} className="p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded bg-navy px-1.5 py-0.5 font-public text-[11px] font-bold text-white shrink-0">{r.id}</span>
                    <span className="font-public text-[13px] font-semibold text-navy">{r.name}</span>
                  </div>
                  <p className="mt-0.5 font-noto text-[11.5px] text-ink/60">{r.state} · {r.km} km</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 font-public text-[11px] font-bold ${ROUTE_STATUS_STYLE[r.status]}`}>{r.status}</span>
              </div>

              {/* Risk score bar */}
              <div className="mt-2.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-ink/10">
                  <div className={`h-full rounded-full ${band.bar}`} style={{ width: `${r.score}%` }} />
                </div>
                <span className={`font-public text-[12px] font-bold ${band.text}`}>{r.score}/100</span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 font-noto text-[11.5px]">
                <span className="text-ink/60">Weather: <span className="text-navy font-medium">{r.weather}</span></span>
                <span className="text-ink/60">ETA: <span className="text-navy font-medium">{r.eta}</span></span>
                <span className={r.delay === "None" ? "text-clear font-semibold" : "text-critical font-semibold"}>Delay: {r.delay}</span>
                <span className="text-ink/60">Updated: {r.updated}</span>
              </div>

              <div className="mt-2.5 flex justify-end">
                <button className="font-public text-[12px] font-semibold text-navy active:opacity-60">Detail →</button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 8 · AI Predictions
// ════════════════════════════════════════════════════════════════
const RISK_PREDICTIONS = [
  {
    route: "NH-27",
    pct: 94,
    window: "Next 3 hours",
    confidence: 89,
    factors: ["Active flooding", "IMD flash flood warning", "High water level", "Historical risk zone"],
  },
  {
    route: "NH-13",
    pct: 78,
    window: "Next 6 hours",
    confidence: 72,
    factors: ["Bridge structural damage", "Heavy rainfall forecast", "Remote location", "Limited access"],
  },
  {
    route: "NH-306",
    pct: 64,
    window: "Next 12 hours",
    confidence: 68,
    factors: ["Saturated soil", "Steep gradient", "Previous landslide history", "Rainfall forecast"],
  },
];

const DELAY_PREDICTIONS = [
  { route: "NH-2", prob: 82, convoys: 2, cause: "Landslide debris clearance", delay: "+1h 30m" },
  { route: "NH-27", prob: 97, convoys: 3, cause: "Active flooding / road closure", delay: "Indefinite" },
  { route: "NH-306", prob: 58, convoys: 1, cause: "Road blockage clearance", delay: "+45m" },
];

const ROUTE_RECS = [
  {
    from: "NH-27",
    to: "NH-37 via Jorhat",
    reason: "Avoid active flood zone",
    benefit: "Risk reduction 94% → 18%",
    dist: "+35 km",
  },
  {
    from: "NH-13",
    to: "Air transport via Tezpur",
    reason: "Road closed indefinitely",
    benefit: "Ensures delivery of critical supplies",
    dist: "N/A",
  },
];

interface ResourceRec { text: string; sub: string; }
const RESOURCE_RECS: ResourceRec[] = [
  { text: "Deploy 2 additional field teams to Barpeta", sub: "NH-27 situation deteriorating rapidly — immediate deployment required" },
  { text: "Pre-position NDRF team at Kohima", sub: "Potential NH-2 emergency response — bridge damage risk increasing" },
  { text: "1 logistics coordinator needed at Dimapur", sub: "Manage convoy rerouting — 3 at-risk convoys require coordination" },
];

function AiPredictions() {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [acted, setActed] = useState<number[]>([]);

  return (
    <div>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h2 className="font-public text-[20px] font-bold leading-tight text-navy">AI Insights</h2>
          <p className="mt-0.5 font-noto text-[12px] text-ink/70">AI-generated predictions and recommendations · Demo Data · Not guaranteed facts</p>
        </div>
        <DemoTag />
      </div>

      {/* Disclaimer */}
      <div className="mb-3 rounded-md border border-saffron/40 bg-saffron/8 p-3.5">
        <p className="font-public text-[12px] font-bold text-saffron mb-1">AI Predictions · Disclaimer</p>
        <p className="font-noto text-[11.5px] leading-relaxed text-ink/80">
          All predictions are AI-generated estimates based on historical data, weather patterns, and real-time incident feed. These are recommendations, not confirmed facts. District Officer discretion required.
        </p>
      </div>

      {/* Risk Predictions */}
      <SectionTitle>Risk Predictions</SectionTitle>
      <div className="flex flex-col gap-3">
        {RISK_PREDICTIONS.map((r) => {
          const pctColor = r.pct >= 80 ? "text-critical" : r.pct >= 60 ? "text-saffron" : "text-ink";
          const barColor = r.pct >= 80 ? "bg-critical" : r.pct >= 60 ? "bg-saffron" : "bg-ink/40";
          return (
            <Card key={r.route} className="p-3.5">
              <div className="flex items-start justify-between gap-2">
                <span className="rounded bg-navy px-1.5 py-0.5 font-public text-[12px] font-bold text-white">{r.route}</span>
                <span className={`font-public text-[22px] font-bold leading-none ${pctColor}`}>{r.pct}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-ink/10">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${r.pct}%` }} />
              </div>
              <div className="mt-2 flex items-center gap-3 font-noto text-[11.5px] text-ink/70">
                <span>{r.window}</span>
                <span className="flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-ink/30" />{r.confidence}% confidence</span>
              </div>
              <div className="mt-2.5">
                <p className="font-public text-[11px] font-semibold uppercase tracking-wide text-ink/50 mb-1.5">Contributing Factors</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.factors.map((f) => (
                    <span key={f} className="rounded-full border border-ink/15 bg-ink/5 px-2 py-0.5 font-noto text-[11px] text-ink/70">{f}</span>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Logistics Delay Predictions */}
      <SectionTitle>Logistics Delay Predictions</SectionTitle>
      <Card className="p-3.5">
        <p className="font-public text-[13px] font-semibold text-navy mb-3">6 logistics routes may experience delays</p>
        <div className="flex flex-col gap-3">
          {DELAY_PREDICTIONS.map((d) => (
            <div key={d.route} className="border-t border-hairline pt-3 first:border-t-0 first:pt-0">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-navy px-1.5 py-0.5 font-public text-[11px] font-bold text-white">{d.route}</span>
                <span className={`font-public text-[18px] font-bold leading-none ${d.prob >= 80 ? "text-critical" : "text-saffron"}`}>{d.prob}%</span>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 font-noto text-[12px]">
                <span className="text-ink/60">Convoys: <span className="font-medium text-navy">{d.convoys}</span></span>
                <span className="font-semibold text-critical">Delay: {d.delay}</span>
                <span className="col-span-2 text-ink/70">Cause: {d.cause}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Route Recommendations */}
      <SectionTitle>Route Recommendations</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {ROUTE_RECS.map((r) => (
          <Card key={r.from} className="p-3.5">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-public text-[13px] font-bold text-navy">{r.from} → {r.to}</p>
                <p className="mt-0.5 font-noto text-[12px] text-ink/70">{r.reason}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 font-noto text-[11.5px]">
              <span className="rounded-full border border-clear/30 bg-clear/8 px-2 py-0.5 text-clear font-semibold">{r.benefit}</span>
              <span className="rounded-full border border-hairline bg-ink/5 px-2 py-0.5 text-ink/60">Distance: {r.dist}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Resource Recommendations */}
      <SectionTitle>Resource Recommendations</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {RESOURCE_RECS.map((rec, i) => (
          !dismissed.includes(i) && (
            <Card key={i} className="p-3.5">
              <p className="font-public text-[13px] font-bold text-navy">{rec.text}</p>
              <p className="mt-1 font-noto text-[12px] leading-relaxed text-ink/70">{rec.sub}</p>
              <div className="mt-2.5 flex gap-2">
                {acted.includes(i) ? (
                  <span className="inline-flex items-center gap-1.5 rounded border border-clear/30 bg-clear/8 px-3 py-1.5 font-public text-[12px] font-semibold text-clear">
                    <Check size={12} /> Action taken
                  </span>
                ) : (
                  <button onClick={() => setActed((a) => [...a, i])} className="rounded-md bg-navy px-3 py-1.5 font-public text-[12px] font-bold text-white active:opacity-80">
                    Act on Recommendation
                  </button>
                )}
                <button onClick={() => setDismissed((d) => [...d, i])} className="rounded-md border border-hairline px-3 py-1.5 font-public text-[12px] font-semibold text-ink/60 active:bg-black/[0.03]">
                  Dismiss
                </button>
              </div>
            </Card>
          )
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 9 · Alerts
// ════════════════════════════════════════════════════════════════
interface AlertItem {
  id: string;
  severity: Priority;
  title: string;
  location: string;
  state: string;
  category: string;
  source: string;
  time: string;
  preAcked?: boolean;
}

const ALERTS: AlertItem[] = [
  { id: "AL-001", severity: "critical", title: "Flash flood warning NH-27 Barpeta", location: "Barpeta", state: "Assam", category: "Flood", source: "IMD / AI System", time: "10:40 AM" },
  { id: "AL-002", severity: "critical", title: "Bridge damage Tawang", location: "Tawang", state: "Arunachal Pradesh", category: "Infrastructure", source: "Field Officer FO-128", time: "10:22 AM" },
  { id: "AL-003", severity: "high", title: "3 convoys at risk NH-2 Zone", location: "Nagaland", state: "", category: "Logistics Delay", source: "AI Prediction System", time: "10:15 AM" },
  { id: "AL-004", severity: "medium", title: "INC-2026-043 exceeds SLA threshold", location: "Aizawl", state: "Mizoram", category: "Escalation", source: "System", time: "09:50 AM", preAcked: true },
  { id: "AL-005", severity: "medium", title: "Increased landslide probability NH-306", location: "Mizoram", state: "", category: "AI Warning", source: "AI System", time: "09:30 AM", preAcked: true },
  { id: "AL-006", severity: "high", title: "NH-13 closed indefinitely", location: "Tawang", state: "Arunachal Pradesh", category: "Route Closure", source: "Field Officer FO-128", time: "08:05 AM", preAcked: true },
];

type AlertFilter = "All" | "Critical" | "Route Closure" | "Flood" | "Landslide" | "Logistics Delay" | "Escalation" | "AI Warning";

function AlertsScreen() {
  const [filter, setFilter] = useState<AlertFilter>("All");
  const [acked, setAcked] = useState<Record<string, boolean>>({});
  const [assigned, setAssigned] = useState<Record<string, boolean>>({});

  const unacked = ALERTS.filter((a) => !a.preAcked && !acked[a.id]).length;

  const ackAll = () => {
    const newAcked: Record<string, boolean> = {};
    ALERTS.filter((a) => !a.preAcked).forEach((a) => { newAcked[a.id] = true; });
    setAcked(newAcked);
  };

  const filtered = ALERTS.filter((a) => {
    if (filter === "All") return true;
    if (filter === "Critical") return a.severity === "critical";
    return a.category === filter;
  });

  const FILTERS: AlertFilter[] = ["All", "Critical", "Route Closure", "Flood", "Landslide", "Logistics Delay", "Escalation", "AI Warning"];

  return (
    <div>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h2 className="font-public text-[20px] font-bold leading-tight text-navy">Alerts</h2>
          <p className="mt-0.5 font-noto text-[12px] text-ink/70">
            Operational notification center · {unacked} unacknowledged
          </p>
        </div>
        {unacked > 0 && (
          <button onClick={ackAll} className="shrink-0 rounded-md bg-navy px-3 py-2 font-public text-[12px] font-bold text-white active:opacity-80">
            Acknowledge All
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full border px-3 py-1.5 font-public text-[12px] font-semibold transition-colors ${filter === f ? "border-navy bg-navy text-white" : "border-hairline bg-white text-ink/70"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {filtered.map((a) => {
          const isAcked = a.preAcked || acked[a.id];
          return (
            <Card
              key={a.id}
              className={`p-3.5 ${a.severity === "critical" ? "border-l-[3px] border-l-critical" : a.severity === "high" ? "border-l-[3px] border-l-saffron" : ""} ${isAcked ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className={`font-public text-[13px] font-bold leading-snug ${isAcked ? "text-ink/70" : "text-navy"}`}>{a.title}</p>
                  <p className="mt-0.5 font-noto text-[11.5px] text-ink/60">
                    <MapPin size={11} className="mr-0.5 inline text-ink/40" />
                    {a.location}{a.state ? `, ${a.state}` : ""} · {a.category}
                  </p>
                </div>
                <PriorityBadge level={a.severity} />
              </div>
              <p className="mt-1.5 font-noto text-[11.5px] text-ink/60">
                Source: {a.source} · <Clock size={10} className="mr-0.5 inline" />{a.time}
              </p>
              {!isAcked && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <MiniBtn>View</MiniBtn>
                  <MiniBtn primary onClick={() => setAcked((s) => ({ ...s, [a.id]: true }))}>Acknowledge</MiniBtn>
                  {!assigned[a.id] ? (
                    <MiniBtn onClick={() => setAssigned((s) => ({ ...s, [a.id]: true }))}>Assign</MiniBtn>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded border border-clear/30 bg-clear/8 px-2.5 py-1.5 font-public text-[11px] font-semibold text-clear"><Check size={11} /> Assigned</span>
                  )}
                  <MiniBtn tone="critical">Escalate</MiniBtn>
                </div>
              )}
              {isAcked && (
                <p className="mt-2 inline-flex items-center gap-1.5 font-public text-[11px] font-semibold text-clear">
                  <Check size={11} /> Acknowledged
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 10 · Analytics
// ════════════════════════════════════════════════════════════════
const DISTRICT_PERF = [
  { name: "Kamrup Metro", state: "Assam", incidents: 24, response: "42m", access: "52%", delayed: "32%", unresolved: 7 },
  { name: "Kohima", state: "Nagaland", incidents: 18, response: "38m", access: "61%", delayed: "24%", unresolved: 4 },
  { name: "Aizawl", state: "Mizoram", incidents: 12, response: "55m", access: "44%", delayed: "41%", unresolved: 8 },
  { name: "East Khasi Hills", state: "Meghalaya", incidents: 8, response: "31m", access: "72%", delayed: "18%", unresolved: 2 },
  { name: "Tawang", state: "Arunachal Pradesh", incidents: 8, response: "68m", access: "28%", delayed: "72%", unresolved: 5 },
];

function AnalyticsScreen() {
  return (
    <div>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h2 className="font-public text-[20px] font-bold leading-tight text-navy">Analytics</h2>
          <p className="mt-0.5 font-noto text-[12px] text-ink/70">Decision-focused district performance analytics · Demo Data</p>
        </div>
        <DemoTag />
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="rounded-md border border-hairline bg-white p-3.5">
          <p className="font-noto text-[12px] text-ink/70">Total Incidents 7d</p>
          <p className="mt-1 font-public text-[26px] font-bold leading-none text-navy">24</p>
          <p className="mt-1 font-public text-[12px] font-semibold text-critical">▲ +14%</p>
        </div>
        <div className="rounded-md border border-hairline bg-white p-3.5">
          <p className="font-noto text-[12px] text-ink/70">Avg Response Time</p>
          <p className="mt-1 font-public text-[26px] font-bold leading-none text-navy">42m</p>
          <p className="mt-1 font-public text-[12px] font-semibold text-clear">▼ -8% week</p>
        </div>
        <div className="rounded-md border border-hairline bg-white p-3.5">
          <p className="font-noto text-[12px] text-ink/70">Route Accessibility</p>
          <p className="mt-1 font-public text-[26px] font-bold leading-none text-saffron">52%</p>
          <p className="mt-1 font-public text-[12px] font-semibold text-critical">▼ -5% week</p>
        </div>
        <div className="rounded-md border border-hairline bg-white p-3.5">
          <p className="font-noto text-[12px] text-ink/70">Logistics On-Time</p>
          <p className="mt-1 font-public text-[26px] font-bold leading-none text-clear">68%</p>
        </div>
        <div className="col-span-2 rounded-md border border-hairline bg-white p-3.5">
          <p className="font-noto text-[12px] text-ink/70">Unresolved &gt;24h</p>
          <p className="mt-1 font-public text-[26px] font-bold leading-none text-critical">7</p>
          <p className="mt-1 font-public text-[12px] font-semibold text-critical">▲ +3 this week</p>
        </div>
      </div>

      {/* Incident Trend — Mon to Today */}
      <ChartCard title="Incident Trend (Mon–Today)">
        <LineChart data={[3, 5, 8, 4, 7, 9, 24]} color="#b3261e" labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"]} />
      </ChartCard>

      {/* Route Accessibility — stacked bar */}
      <ChartCard title="Route Accessibility by Route">
        <div className="mt-1 space-y-2.5">
          {[
            { route: "NH-27", accessible: 18 },
            { route: "NH-2", accessible: 52 },
            { route: "NH-306", accessible: 45 },
            { route: "NH-6", accessible: 39 },
            { route: "NH-40", accessible: 78 },
          ].map(({ route, accessible }) => (
            <div key={route} className="flex items-center gap-2">
              <span className="w-12 shrink-0 font-public text-[11px] font-bold text-navy">{route}</span>
              <div className="flex-1 flex h-4 rounded-sm overflow-hidden">
                <div className="bg-clear" style={{ width: `${accessible}%` }} />
                <div className="flex-1 bg-saffron/30" />
              </div>
              <span className="w-8 text-right font-public text-[11px] font-bold text-clear">{accessible}%</span>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-1 font-noto text-[11px] text-ink/60">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-clear" /> Accessible</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-saffron/30" /> Restricted</span>
          </div>
        </div>
      </ChartCard>

      {/* Response Time with 35m dashed target */}
      <ChartCard title="Average Response Time (min)">
        <LineChartWithTarget data={[55, 50, 48, 45, 43, 42, 42]} target={35} color="#0e2a47" labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"]} />
        <p className="mt-1.5 font-noto text-[11px] text-ink/50">— Target: 35 min</p>
      </ChartCard>

      {/* District Risk Score Trend */}
      <ChartCard title="District Risk Score Trend">
        <LineChart data={[42, 48, 52, 55, 61, 68, 74]} color="#d97a1f" labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"]} />
        <div className="mt-2 rounded-md border border-saffron/30 bg-saffron/8 px-3 py-2.5">
          <p className="font-public text-[12px] font-bold text-saffron">Risk trend increasing</p>
          <p className="font-noto text-[11.5px] text-ink/70 mt-0.5">74/100 today vs 42/100 last Monday. Monsoon season contributing factor.</p>
        </div>
      </ChartCard>

      {/* District Performance Comparison */}
      <SectionTitle>District Performance Comparison</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {DISTRICT_PERF.map((d) => (
          <Card key={d.name} className="p-3.5">
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <div>
                <p className="font-public text-[14px] font-bold text-navy">{d.name}</p>
                <p className="font-noto text-[11.5px] text-ink/60">{d.state}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 font-noto text-[12px]">
              <span className="text-ink/60">Incidents: <span className="font-bold text-navy">{d.incidents}</span></span>
              <span className="text-ink/60">Resp. Time: <span className="font-bold text-navy">{d.response}</span></span>
              <span className="text-ink/60">Access: <span className="font-bold text-navy">{d.access}</span></span>
              <span className="text-ink/60">Delayed: <span className="font-bold text-saffron">{d.delayed}</span></span>
              <span className="col-span-2 text-ink/60">Unresolved &gt;24h: <span className={`font-bold ${d.unresolved >= 5 ? "text-critical" : "text-saffron"}`}>{d.unresolved}</span></span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 11 · Reports
// ════════════════════════════════════════════════════════════════
const REPORT_TYPES = [
  { id: "sit", name: "Regional Situation Report", desc: "24-hour NER summary" },
  { id: "logi", name: "Regional Logistics Report", desc: "Fleet, shipments, delays" },
  { id: "risk", name: "Regional Risk Report", desc: "Risk by district & route" },
  { id: "ai", name: "AI Prediction Report", desc: "Model outputs & confidence" },
];
function ReportsScreen() {
  const [preview, setPreview] = useState<string | null>(null);
  if (preview) {
    return (
      <div>
        <BackRow label="Reports" onBack={() => setPreview(null)} />
        <Card className="mt-1 p-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <p className="font-public text-[16px] font-bold text-navy">{preview}</p>
              <p className="font-noto text-[12px] text-ink">North Eastern Region · 10 Sep 2026</p>
            </div>
            <AshokaChakra size={30} color="#0e2a47" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[["Incidents", "14"], ["Districts", "8"], ["Avg resp.", "27m"]].map(([l, v]) => (
              <div key={l} className="rounded border border-hairline p-2 text-center">
                <p className="font-public text-[18px] font-bold text-navy">{v}</p>
                <p className="font-noto text-[10px] text-ink">{l}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 font-noto text-[13px] leading-snug text-ink">
            4 critical incidents across Ri Bhoi and West Jaintia Hills dominate the regional picture; NH-6 corridor closure driving logistics disruption.
          </p>
          <div className="mt-3"><AiCard kind="AI recommendation" confidence={78} title="Hold NH-6 closure until 15:00">Reassess reopening after slope inspection.</AiCard></div>
          <p className="mt-3 border-t border-hairline pt-2 font-noto text-[10px] text-ink/60">Generated by NER Logistics Platform · MDoNER · DEMO DATA</p>
        </Card>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <ActionButton primary><Download size={15} className="mr-1.5 inline" />Export PDF</ActionButton>
          <ActionButton><Download size={15} className="mr-1.5 inline" />Export CSV</ActionButton>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-public text-[13px] font-semibold text-ink">Choose a report type</p>
        <DemoTag />
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        {REPORT_TYPES.map((r) => (
          <Card key={r.id} onClick={() => setPreview(r.name)} className="flex items-center gap-3 p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-hairline"><FileText size={18} className="text-navy" /></span>
            <div className="min-w-0 flex-1">
              <p className="font-public text-[14px] font-semibold text-navy">{r.name}</p>
              <p className="truncate font-noto text-[12px] text-ink">{r.desc}</p>
            </div>
            <ChevronRight size={16} className="text-ink/50" />
          </Card>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 12 · Settings
// ════════════════════════════════════════════════════════════════
function SettingsScreen() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-public text-[13px] font-semibold text-ink">Preferences</p>
        <DemoTag />
      </div>
      <SectionTitle>Account</SectionTitle>
      <Card className="p-3.5">
        <DetailRows
          rows={[
            ["Name", "Control Officer"],
            ["Role", "Control Room"],
            ["Scope", "All NER (8 states)"],
            ["Officer ID", "NER-CR-0007"],
          ]}
        />
      </Card>
      <SectionTitle>Notifications</SectionTitle>
      <div className="flex flex-col gap-2.5">
        <ToggleRow label="Critical incidents" on />
        <ToggleRow label="AI risk warnings" on />
        <ToggleRow label="Logistics disruptions" on />
        <ToggleRow label="Daily regional digest" on={false} />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Shared building blocks
// ════════════════════════════════════════════════════════════════
function KpiCard({ label, value, tone, w }: { label: string; value: string | number; tone: "navy" | "critical" | "saffron" | "clear"; w?: boolean }) {
  const c = { navy: "text-navy", critical: "text-critical", saffron: "text-saffron", clear: "text-clear" }[tone];
  return (
    <div className={`shrink-0 rounded-md border border-hairline bg-white p-3.5 ${w ? "w-[140px]" : ""}`}>
      <p className="font-noto text-[12px] leading-tight text-ink">{label}</p>
      <p className={`mt-1.5 font-public text-[24px] font-bold leading-none ${c}`}>{value}</p>
    </div>
  );
}

function RiskMini({ r }: { r: RiskCard }) {
  const b = accessBand(r.score);
  return (
    <div className="w-[150px] shrink-0 rounded-md border border-hairline bg-white p-3.5">
      <div className="flex items-center justify-between">
        <span className="font-public text-[12.5px] font-bold text-navy">{r.name}</span>
        <span className={`inline-flex items-center gap-0.5 font-public text-[11px] font-bold ${r.trend >= 0 ? "text-critical" : "text-clear"}`}>
          {r.trend >= 0 ? "↑" : "↓"} {r.trend >= 0 ? "Increasing" : "Easing"}
        </span>
      </div>
      <p className={`mt-2 font-public text-[22px] font-bold leading-none ${b.text}`}>{r.score}<span className="text-[13px] text-ink/50">/100</span></p>
      <p className={`font-public text-[12px] font-bold ${b.text}`}>{r.level}</p>
      <p className="mt-1.5 font-noto text-[10px] italic text-ink/60">AI-generated risk estimate</p>
    </div>
  );
}

function TrendArrow({ v }: { v: number }) {
  const up = v > 0;
  const flat = v === 0;
  const color = flat ? "text-ink" : up ? "text-critical" : "text-clear";
  return (
    <span className={`inline-flex items-center gap-0.5 font-public text-[12px] font-bold ${color}`}>
      {flat ? "→" : up ? "▲" : "▼"} {v > 0 ? `+${v}` : v}
    </span>
  );
}

function DistrictCard({ d, onClick }: { d: DistrictRow; onClick?: () => void }) {
  return (
    <Card onClick={onClick} className="p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-public text-[14px] font-bold text-navy">{d.name}</p>
          <p className="font-noto text-[11px] text-ink/70">{d.state}</p>
        </div>
        <PriorityBadge level={d.risk} />
      </div>
      <div className="mt-2.5"><AccessScore score={d.score} /></div>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-noto text-[12px] text-ink/70">
        <span>{d.incidents} incidents</span>
        <span className="text-critical">{d.criticals} critical</span>
        <span>{d.routes} routes</span>
        <span>{d.logistics}</span>
        <StatusChip tone={d.status === "On alert" ? "critical" : d.status === "Monitoring" ? "saffron" : "clear"}>{d.status}</StatusChip>
      </div>
    </Card>
  );
}

function FleetCard({ v, onClick }: { v: Veh; onClick?: () => void }) {
  return (
    <Card onClick={onClick} className="p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-hairline"><Truck size={15} className="text-navy" /></span>
          <div>
            <p className="font-public text-[14px] font-semibold text-navy">{v.id}</p>
            <p className="font-noto text-[12px] text-ink">{v.route} → {v.dest}</p>
          </div>
        </div>
        <StatusChip tone={v.status === "Delayed" ? "critical" : v.status === "At risk" ? "saffron" : "clear"}>{v.status}</StatusChip>
      </div>
      <div className="mt-2 flex items-center gap-3 font-noto text-[12px] text-ink/70">
        <span className="flex items-center gap-1">Risk: <PriorityBadge level={v.risk} /></span>
        <span>ETA {v.eta}</span>
      </div>
    </Card>
  );
}

function ActionRow({ tone, title, loc, time, onReview }: { tone: "critical" | "saffron"; title: string; loc: string; time: string; onReview?: () => void }) {
  const c = tone === "critical" ? "border-critical/30 bg-critical/5 text-critical" : "border-saffron/30 bg-saffron/10 text-saffron";
  return (
    <Card className="flex items-center gap-3 p-3.5">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${c}`}><Warning size={18} /></span>
      <div className="min-w-0 flex-1">
        <p className="font-public text-[14px] font-semibold text-navy">{title}</p>
        <p className="truncate font-noto text-[12px] text-ink">{loc} · {time}</p>
      </div>
      <button onClick={onReview} className="shrink-0 rounded border border-navy px-3 py-1.5 font-public text-[12px] font-bold text-navy active:bg-navy/5">Review</button>
    </Card>
  );
}

function QuickAction({ Icon, label, onClick }: { Icon: typeof Home; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 rounded-md border border-hairline bg-white px-3.5 py-3 text-left active:bg-black/[0.02]">
      <Icon size={20} className="shrink-0 text-navy" />
      <span className="font-public text-[13px] font-semibold text-navy">{label}</span>
    </button>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="mb-3 p-3.5">
      <p className="font-public text-[13px] font-bold text-navy">{title}</p>
      <div className="mt-3">{children}</div>
    </Card>
  );
}
function LineChart({ data, color, labels }: { data: number[]; color: string; labels?: string[] }) {
  const max = Math.max(...data) * 1.15;
  const w = 300, h = 90;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - (d / max) * h}`).join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[90px] w-full">
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} y1={h * g} x2={w} y2={h * g} stroke="rgba(91,100,114,0.12)" strokeWidth={1} />)}
        <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - (d / max) * h} r={2.2} fill={color} />)}
      </svg>
      {labels && (
        <div className="flex justify-between mt-1 px-1">
          {labels.map((l, i) => <span key={i} className="font-noto text-[10px] text-ink/50">{l}</span>)}
        </div>
      )}
    </div>
  );
}
function LineChartWithTarget({ data, color, target, labels }: { data: number[]; color: string; target: number; labels?: string[] }) {
  const max = Math.max(...data, target) * 1.2;
  const w = 300, h = 90;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - (d / max) * h}`).join(" ");
  const ty = h - (target / max) * h;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[90px] w-full">
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} y1={h * g} x2={w} y2={h * g} stroke="rgba(91,100,114,0.12)" strokeWidth={1} />)}
        <line x1={0} y1={ty} x2={w} y2={ty} stroke="#1e6b45" strokeWidth={1.5} strokeDasharray="6,4" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - (d / max) * h} r={2.2} fill={color} />)}
      </svg>
      {labels && (
        <div className="flex justify-between mt-1 px-1">
          {labels.map((l, i) => <span key={i} className="font-noto text-[10px] text-ink/50">{l}</span>)}
        </div>
      )}
    </div>
  );
}
function BarChartMini({ data, labels, color = "#0e2a47" }: { data: number[]; labels: string[]; color?: string }) {
  const max = Math.max(...data, 1) * 1.15;
  return (
    <div className="flex h-[100px] items-end gap-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full flex-1 items-end"><div className="w-full rounded-t-sm" style={{ height: `${(d / max) * 100}%`, background: color }} /></div>
          <span className="font-noto text-[10px] text-ink">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function BackRow({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <button onClick={onBack} className="mb-1 flex items-center gap-1 text-navy active:opacity-60">
      <ChevronLeft size={18} strokeWidth={2} />
      <span className="font-public text-[14px] font-semibold">{label}</span>
    </button>
  );
}
function DetailRows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mt-3 overflow-hidden rounded-md border border-hairline">
      {rows.map(([label, value], i) => (
        <div key={label} className={`flex items-start justify-between gap-3 px-3.5 py-2.5 ${i > 0 ? "border-t border-hairline" : ""}`}>
          <span className="font-public text-[12px] font-semibold uppercase tracking-wide text-ink/60">{label}</span>
          <span className="text-right font-noto text-[13px] font-medium text-navy">{value}</span>
        </div>
      ))}
    </div>
  );
}
function ActionButton({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  const cls = primary ? "bg-navy text-white active:bg-navy-pressed" : "border border-navy text-navy active:bg-navy/5";
  return <button className={`rounded-md px-3 py-2.5 font-public text-[14px] font-bold ${cls}`}>{children}</button>;
}
function MiniBtn({ children, primary, tone, onClick }: { children: React.ReactNode; primary?: boolean; tone?: "critical"; onClick?: (e: React.MouseEvent) => void }) {
  let cls = "border border-hairline text-navy active:bg-black/[0.03]";
  if (primary) cls = "bg-navy text-white active:bg-navy-pressed";
  else if (tone === "critical") cls = "border border-critical/40 text-critical active:bg-critical/5";
  return <button onClick={onClick} className={`rounded px-2.5 py-1.5 font-public text-[12px] font-semibold ${cls}`}>{children}</button>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 font-public text-[12px] font-semibold uppercase tracking-wide text-ink/60">{label}</p>
      {children}
    </div>
  );
}
function ToggleRow({ label, on }: { label: string; on: boolean }) {
  const [v, setV] = useState(on);
  return (
    <Card className="flex items-center justify-between p-3.5">
      <span className="font-noto text-[14px] text-navy">{label}</span>
      <button onClick={() => setV(!v)} className={`relative h-6 w-11 rounded-full transition-colors ${v ? "bg-navy" : "bg-ink/25"}`} aria-label={label}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${v ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </Card>
  );
}
function BottomSheet({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex items-end bg-black/40" style={{ animation: "quietFade 140ms ease-out" }} onClick={onClose}>
      <div className="max-h-[82%] w-full overflow-y-auto rounded-t-2xl bg-white p-5 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[#c4c8cd]" />
        <div className="flex items-center justify-between">
          <h2 className="font-public text-[18px] font-bold text-navy">{title}</h2>
          <button onClick={onClose} aria-label="Close"><XIcon size={20} className="text-ink" /></button>
        </div>
        {children}
      </div>
    </div>
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
