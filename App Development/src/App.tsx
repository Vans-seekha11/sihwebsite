import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  Doc,
  Home,
  Layers,
  MapPin,
  Menu,
  Package,
  Pin,
  RouteNodes,
  Spinner,
  TurnLeft,
  TurnRight,
  Warning,
  WifiOff,
} from "./components/icons";
import { ConfirmedMap, IdleMap, RiskMap } from "./components/maps";
import { Card, KpiTile, PriorityBadge, SectionTitle, StatusChip, type Priority } from "./components/district/DistrictShared";
import { RiskBadge } from "./components/shared";
import LoginScreen, { type Role } from "./components/LoginScreen";
import SplashScreen from "./components/SplashScreen";
import SplashTransition, { type WipeOrigin } from "./components/SplashTransition";
import MyTasksScreen from "./components/MyTasksScreen";
import ReportScreen, { type IncidentType } from "./components/ReportScreen";
import ReportsScreen from "./components/ReportsScreen";
import AlertsScreen from "./components/AlertsScreen";
import RouteStatusScreen from "./components/RouteStatusScreen";
import LogisticsScreen from "./components/LogisticsScreen";
import ProfileScreen from "./components/ProfileScreen";
import DistrictOfficerApp from "./components/district/DistrictOfficerApp";
import ControlRoomApp from "./components/district/ControlRoomApp";
import { useAuth } from "./lib/useAuth";

type Phase = "active" | "interrupt" | "calculating" | "rerouted";
// Field Officer drawer destinations. "trip" is the live active-trip machine.
type FieldNav = "dashboard" | "trip" | "tasks" | "report" | "route" | "logistics" | "alerts" | "reports";

// ── Field Officer identity + trip constants (single source of truth) ──
const TRIP = { id: "TRP-2291", consignment: "P1 medical", destination: "Sonapur" };
const OFFICER = { name: "A. Sangma", role: "Field Officer", area: "Dimapur District, Nagaland" };
// Amber/gold role-identity accent — distinct from the saffron caution token.
const GOLD = "#d9a441";

// Slow, deliberate wipe — colours sweep across before the screens swap.
const WIPE_DURATION = 1600; // ms — must match .ner-wipe-disc in index.css
const WIPE_SWAP = 640; // ms — screen content swaps once the disc has covered

export default function App() {
  const { loading: authLoading, user, role: dbRole, signOut, refreshProfile } = useAuth();

  const [splashDone, setSplashDone] = useState(false);
  const [loginInitialMode, setLoginInitialMode] = useState<"signin" | "create">("signin");
  const [sharedLang] = useState("en");

  // UI-selected role: starts from what LoginScreen picks, then overridden by
  // the DB role once the session loads. DB role is authoritative.
  const [uiRole, setUiRole] = useState<Role>("field");
  const activeRole: Role = dbRole ?? uiRole;

  // authed = we have a live Supabase session
  const authed = !!user && !authLoading;

  // Active tricolor wipe (splash ↔ Login/Create only). null when idle.
  const [wipe, setWipe] = useState<WipeOrigin | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const swapTimer = useRef<number | undefined>(undefined);
  const clearTimer = useRef<number | undefined>(undefined);

  // When a session is restored from localStorage, skip the splash.
  useEffect(() => {
    if (!authLoading && user) {
      setSplashDone(true);
    }
  }, [authLoading, user]);

  const handleSignOut = async () => {
    await signOut();
    setSplashDone(false);
  };

  // Compute the tap origin (disc centre + emblem arc delta) from the click.
  const originFrom = useCallback((e: React.MouseEvent): WipeOrigin => {
    const rect = screenRef.current?.getBoundingClientRect();
    if (!rect) return { xPct: 50, yPct: 88, dx: 0, dy: 300 };
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    return {
      xPct: (px / rect.width) * 100,
      yPct: (py / rect.height) * 100,
      dx: px - rect.width / 2,
      dy: py - rect.height * 0.44,
    };
  }, []);

  const runWipe = useCallback((origin: WipeOrigin, swap: () => void) => {
    window.clearTimeout(swapTimer.current);
    window.clearTimeout(clearTimer.current);
    setWipe(origin);
    swapTimer.current = window.setTimeout(swap, WIPE_SWAP);
    clearTimer.current = window.setTimeout(() => setWipe(null), WIPE_DURATION + 60);
  }, []);

  const toLogin = (mode: "signin" | "create", e: React.MouseEvent) => {
    setLoginInitialMode(mode);
    runWipe(originFrom(e), () => setSplashDone(true));
  };

  const toSplash = (e: React.MouseEvent) => {
    runWipe(originFrom(e), () => setSplashDone(false));
  };

  useEffect(() => () => {
    window.clearTimeout(swapTimer.current);
    window.clearTimeout(clearTimer.current);
  }, []);

  // Show a minimal spinner while the SDK checks localStorage for a session.
  if (authLoading) {
    return (
      <div className="flex min-h-full w-full items-center justify-center bg-[#d9d9d3]">
        <Spinner size={32} className="animate-spin text-navy/40" />
      </div>
    );
  }

  return (
    <div className="flex min-h-full w-full items-center justify-center bg-[#d9d9d3] p-4 sm:p-8">
      <PhoneFrame screenRef={screenRef}>
        {!splashDone ? (
          <SplashScreen
            onLogIn={(e) => toLogin("signin", e)}
            onCreateAccount={(e) => toLogin("create", e)}
          />
        ) : !authed ? (
          <LoginScreen
            initialMode={loginInitialMode}
            initialLang={sharedLang}
            entering={wipe !== null}
            onBack={toSplash}
            onAuthed={(r) => {
              setUiRole(r);
              // authed state is driven by useAuth's user — no manual setAuthed needed
            }}
          />
        ) : activeRole === "control" ? (
          <ControlRoomApp onSignOut={handleSignOut} onProfileUpdated={refreshProfile} />
        ) : activeRole === "district" ? (
          <DistrictOfficerApp role={activeRole} onSignOut={handleSignOut} onProfileUpdated={refreshProfile} />
        ) : (
          <FieldOfficerApp onSignOut={handleSignOut} onProfileUpdated={refreshProfile} />
        )}

        {wipe && <SplashTransition {...wipe} />}
      </PhoneFrame>
    </div>
  );
}

// ── Field Officer app: drawer nav + dashboard + live active-trip machine ──
function FieldOfficerApp({ onSignOut, onProfileUpdated }: { onSignOut: () => void; onProfileUpdated: () => Promise<void> }) {
  const [nav, setNav] = useState<FieldNav>("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reportType, setReportType] = useState<IncidentType | undefined>(undefined);

  const [phase, setPhase] = useState<Phase>("active");
  const [postReroute, setPostReroute] = useState(false);
  const [riskUpgraded, setRiskUpgraded] = useState(false);
  const [alertsBadge, setAlertsBadge] = useState(0);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const idleTimer = useRef<number | null>(null);
  const rerouted = postReroute;

  const go = (dest: FieldNav) => {
    setNav(dest);
    setDrawerOpen(false);
  };

  const triggerRisk = useCallback(() => {
    setNav("trip");
    setPhase((p) => (p === "active" && !postReroute ? "interrupt" : p));
    if (!postReroute) {
      setAlertsBadge(1);
      setProgress(0);
    }
  }, [postReroute]);

  // Auto-fire the risk event after ~8s on the live trip (jury-safe demo cue).
  useEffect(() => {
    if (phase === "active" && !postReroute && nav === "trip") {
      idleTimer.current = window.setTimeout(() => {
        setPhase("interrupt");
        setAlertsBadge(1);
        setProgress(0);
      }, 8000);
      return () => {
        if (idleTimer.current) window.clearTimeout(idleTimer.current);
      };
    }
  }, [phase, postReroute, nav]);

  // Hero reroute: fill progress 0→100 over ~1.5s, then advance to Screen 3.
  useEffect(() => {
    if (phase !== "calculating") return;
    setProgress(0);
    const start = performance.now();
    const dur = 1500;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(100, ((t - start) / dur) * 100);
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(step);
      else {
        setPhase("rerouted");
        setAlertsBadge(0);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const showToast = (m: string) => setToast(m);
  const openReport = (t?: IncidentType) => {
    setReportType(t);
    go("report");
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-paper font-noto">
      <FieldHeader
        nav={nav}
        phase={phase}
        rerouted={rerouted}
        alertsCount={alertsBadge}
        offline={offline}
        onMenu={() => setDrawerOpen(true)}
        onSecretTrigger={triggerRisk}
        onBell={() => go("alerts")}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {/* ── Body ── */}
      {nav === "dashboard" ? (
        <FieldDashboard
          offline={offline}
          onToggleOffline={() => setOffline((o) => !o)}
          onStartTask={() => go("trip")}
          onReportType={openReport}
          onViewIncidents={() => go("alerts")}
          onOpenTasks={() => go("tasks")}
        />
      ) : nav === "trip" ? (
        <RouteScreen
          phase={phase}
          rerouted={rerouted}
          riskUpgraded={riskUpgraded}
          progress={progress}
          expanded={expanded}
          setExpanded={setExpanded}
          onNotNow={() => { setPhase("active"); setRiskUpgraded(true); }}
          onViewSafer={() => setPhase("calculating")}
          onFollowNew={() => {
            setPostReroute(true);
            setPhase("active");
            setRiskUpgraded(false);
            showToast("Following new route via Lumshnong bypass");
          }}
          onCompare={() => setCompareOpen(true)}
          onReport={() => showToast("Condition report drafted")}
        />
      ) : nav === "tasks" ? (
        <MyTasksScreen onBack={() => go("dashboard")} />
      ) : nav === "report" ? (
        <ReportScreen initialType={reportType} />
      ) : nav === "route" ? (
        <RouteStatusScreen />
      ) : nav === "logistics" ? (
        <LogisticsScreen />
      ) : nav === "alerts" ? (
        <AlertsScreen onCriticalTap={triggerRisk} />
      ) : (
        <ReportsScreen />
      )}

      <FieldDrawer
        open={drawerOpen}
        nav={nav}
        alertsCount={alertsBadge}
        onClose={() => setDrawerOpen(false)}
        onNavigate={go}
      />

      {profileOpen && <ProfileScreen profileRole="field" onClose={() => setProfileOpen(false)} onSignOut={onSignOut} onUpdated={() => void onProfileUpdated()} />}
      {compareOpen && <CompareModal onClose={() => setCompareOpen(false)} />}

      {toast && (
        <div
          className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-md bg-navy px-4 py-2.5 text-[14px] font-medium text-white shadow-lg"
          style={{ animation: "quietFade 180ms ease-out" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Phone frame (390×844) ──
function PhoneFrame({
  children,
  screenRef,
}: {
  children: React.ReactNode;
  screenRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div className="relative h-[844px] w-[390px] max-w-full overflow-hidden rounded-[44px] border border-[#c9cbc4] bg-black shadow-2xl">
      <div
        ref={screenRef}
        className="absolute inset-[6px] overflow-hidden rounded-[38px] bg-paper"
      >
        {children}
      </div>
    </div>
  );
}

// ── Field header (navy chrome + gold role identity) ──
const FIELD_TITLES: Record<FieldNav, { title: string; sub: string }> = {
  dashboard: { title: "Field Officer Dashboard", sub: `${OFFICER.name} · Dimapur, Nagaland` },
  trip: { title: "Active trip", sub: `${TRIP.id} · Consignment ${TRIP.consignment}` },
  tasks: { title: "My Tasks", sub: "Assigned to you · Dimapur" },
  report: { title: "Report Incident", sub: "GPS-tagged · saves offline first" },
  route: { title: "Route Status", sub: "4 routes · Dimapur district" },
  logistics: { title: "Logistics", sub: "Active shipments · Dimapur" },
  alerts: { title: "Alerts", sub: "3 active today · newest first" },
  reports: { title: "My Reports", sub: "Dimapur district · all reports" },
};

function FieldHeader({
  nav,
  phase,
  rerouted,
  alertsCount,
  offline,
  onMenu,
  onSecretTrigger,
  onBell,
  onOpenProfile,
}: {
  nav: FieldNav;
  phase: Phase;
  rerouted: boolean;
  alertsCount: number;
  offline: boolean;
  onMenu: () => void;
  onSecretTrigger: () => void;
  onBell: () => void;
  onOpenProfile: () => void;
}) {
  const onTrip = nav === "trip";
  const time = onTrip && (rerouted || phase === "rerouted") ? "09:43" : "09:41";

  let { title, sub } = FIELD_TITLES[nav];
  if (onTrip) {
    if (phase === "interrupt" || phase === "calculating") sub = `${TRIP.id} · risk update received`;
    else if (phase === "rerouted" || rerouted) {
      title = "Active trip · rerouted";
      sub = `${TRIP.id} · control room notified`;
    }
  }

  return (
    <div className="relative z-20 bg-navy px-4 pt-3 pb-3.5 text-white">
      {/* status bar */}
      <div className="flex items-center justify-between">
        <span className="font-public text-[15px] font-bold tracking-tight">{time}</span>
        <div className="flex items-center gap-1.5">
          <SignalGlyph />
          {offline ? <WifiOff size={17} className="text-white/60" /> : <WifiGlyph />}
          <BatteryGlyph />
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <button
          onClick={onMenu}
          className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white active:bg-white/10"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-public text-[20px] font-bold leading-tight">{title}</h1>
          <p
            className="mt-0.5 select-none truncate font-noto text-[13px] text-white/70"
            onDoubleClick={onTrip ? onSecretTrigger : undefined}
            title={onTrip ? "Simulate risk event" : undefined}
          >
            {sub}
          </p>
        </div>
        <button
          onClick={onBell}
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white active:bg-white/10"
          aria-label="Alerts"
        >
          <Bell size={21} />
          {alertsCount > 0 && (
            <span
              className="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-1 font-public text-[10px] font-bold text-navy"
              style={{ background: GOLD }}
            >
              {alertsCount}
            </span>
          )}
        </button>
        <button
          onClick={onOpenProfile}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-public text-[13px] font-bold text-navy"
          style={{ background: GOLD }}
          aria-label="Profile"
        >
          FO
        </button>
      </div>
    </div>
  );
}

// ── Slide-out drawer (navy sidebar → mobile drawer) ──
const DRAWER_ITEMS: { id: FieldNav; label: string; Icon: typeof Home; badge?: boolean }[] = [
  { id: "dashboard", label: "Dashboard", Icon: Home },
  { id: "tasks", label: "My Tasks", Icon: Check },
  { id: "report", label: "Report Incident", Icon: Doc },
  { id: "route", label: "Route Status", Icon: RouteNodes },
  { id: "logistics", label: "Logistics", Icon: Package },
  { id: "alerts", label: "Alerts", Icon: Bell, badge: true },
];

function FieldDrawer({
  open,
  nav,
  alertsCount,
  onClose,
  onNavigate,
}: {
  open: boolean;
  nav: FieldNav;
  alertsCount: number;
  onClose: () => void;
  onNavigate: (dest: FieldNav) => void;
}) {
  if (!open) return null;

  const Row = ({ id, label, Icon, badge }: (typeof DRAWER_ITEMS)[number]) => {
    const active = nav === id;
    return (
      <button
        onClick={() => onNavigate(id)}
        className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
          active ? "bg-white/10" : "active:bg-white/5"
        }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full" style={{ background: GOLD }} />
        )}
        <span className="flex shrink-0" style={active ? { color: GOLD } : undefined}>
          <Icon size={20} strokeWidth={active ? 2.1 : 1.75} className={active ? "" : "text-white/70"} />
        </span>
        <span className={`flex-1 font-public text-[15px] ${active ? "font-bold text-white" : "font-medium text-white/70"}`}>
          {label}
        </span>
        {badge && alertsCount > 0 && (
          <span
            className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full px-1 font-public text-[11px] font-bold text-navy"
            style={{ background: GOLD }}
          >
            {alertsCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="absolute inset-0 z-40 flex" style={{ animation: "quietFade 150ms ease-out" }}>
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        className="relative flex h-full w-[300px] max-w-[82%] flex-col bg-navy text-white"
        style={{ animation: "slideRight 220ms cubic-bezier(0.22,1,0.36,1)" }}
      >
        {/* Identity block */}
        <div className="border-b border-white/10 px-5 pt-8 pb-5">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-public text-[17px] font-bold text-navy"
              style={{ background: GOLD }}
            >
              FO
            </span>
            <div>
              <p className="font-public text-[16px] font-bold leading-tight">{OFFICER.role}</p>
              <p className="font-noto text-[12px] text-white/60">NER Field Operations</p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-white/[0.06] px-3.5 py-3">
            <p className="font-public text-[10px] font-bold uppercase tracking-[0.1em] text-white/45">Assigned area</p>
            <p className="mt-1 font-public text-[14px] font-bold text-white">{OFFICER.area}</p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 font-noto text-[12px] text-[#5fd39a]">
              <span className="h-2 w-2 rounded-full bg-[#5fd39a]" /> System Online
            </p>
          </div>
        </div>

        {/* Main menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 font-public text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">Main menu</p>
          <nav className="flex flex-col gap-0.5">
            {DRAWER_ITEMS.map((it) => (
              <Row key={it.id} {...it} />
            ))}
          </nav>

          <div className="my-3 h-px bg-white/10" />
          <nav className="flex flex-col gap-0.5">
            <Row id="reports" label="Reports" Icon={FileTextRow} />
          </nav>
        </div>
      </div>
    </div>
  );
}
// Doc icon alias for the "Reports" drawer row (distinct from Report Incident).
const FileTextRow = Doc;

// ── Field Officer dashboard ──
type FieldTask = { id: string; title: string; place: string; due: string; priority: Priority };
const PRIORITY_TASKS: FieldTask[] = [
  { id: "TSK-4471", title: "Escort P1 medical consignment", place: "Depot → Sonapur · TRP-2291", due: "Due 14:30", priority: "critical" },
  { id: "TSK-4468", title: "Verify Lubha bridge load rating", place: "NH-6 · Km 26 junction", due: "Due today", priority: "high" },
  { id: "TSK-4462", title: "Photo-survey flood mark, Km 22", place: "Dhansiri sector", due: "Due tomorrow", priority: "medium" },
];

type NearbyIncident = { title: string; place: string; dist: string; level: "clear" | "caution" | "critical" };
const NEARBY: NearbyIncident[] = [
  { title: "Landslide predicted, NH-6", place: "Km 31–34 · 5 km ahead", dist: "5.0 km", level: "critical" },
  { title: "Waterlogging on approach road", place: "Dhansiri · Km 22", dist: "2.3 km", level: "caution" },
  { title: "Culvert cleared, traffic resumed", place: "Medziphema link", dist: "8.1 km", level: "clear" },
];

const QUICK_ACTIONS: { label: string; type: IncidentType; emoji: string }[] = [
  { label: "Flood", type: "Flood", emoji: "🌊" },
  { label: "Road Blockage", type: "Road Blockage", emoji: "🚧" },
  { label: "Landslide", type: "Landslide", emoji: "⛰️" },
  { label: "Accident", type: "Accident", emoji: "🚗" },
  { label: "Infrastructure Damage", type: "Infra Damage", emoji: "🏗️" },
];

function FieldDashboard({
  offline,
  onToggleOffline,
  onStartTask,
  onReportType,
  onViewIncidents,
  onOpenTasks,
}: {
  offline: boolean;
  onToggleOffline: () => void;
  onStartTask: () => void;
  onReportType: (t: IncidentType) => void;
  onViewIncidents: () => void;
  onOpenTasks: () => void;
}) {
  const score = 72; // Area accessibility (higher = better; field convention)
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {/* Offline / online indicator strip */}
      <button
        onClick={onToggleOffline}
        className={`flex w-full items-center gap-2 px-4 py-2 font-public text-[12px] font-semibold ${
          offline ? "bg-saffron/15 text-[#7a4310]" : "bg-clear/10 text-clear"
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${offline ? "bg-saffron" : "bg-clear"}`} />
        {offline ? "Offline — data will sync automatically" : "Online — all data current"}
        <span className="ml-auto font-noto text-[11px] font-medium opacity-70">Tap to toggle · demo</span>
      </button>

      <div className="px-4 pb-8 pt-4">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-2.5">
          <KpiTile label="Assigned Tasks" value={8} tone="navy" onClick={onOpenTasks} />
          <KpiTile label="Pending Tasks" value={3} tone="saffron" onClick={onOpenTasks} />
          <KpiTile label="Active Incidents" value={2} tone="navy" onClick={onViewIncidents} />
          <KpiTile label="Critical Alerts" value={1} tone="critical" onClick={onViewIncidents} />
        </div>

        {/* Current Area Situation */}
        <SectionTitle>Current Area Situation</SectionTitle>
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 font-public text-[14px] font-bold text-navy">
                <MapPin size={15} className="text-ink" /> {OFFICER.area}
              </p>
              <p className="mt-0.5 font-noto text-[12px] text-ink/70">Monitored sector · NER-DIM-04</p>
            </div>
            <RiskBadge level="critical" />
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="font-public text-[12px] font-semibold text-ink">Accessibility Score</span>
              <span className="font-public text-[13px] font-bold text-saffron">{score}/100 · Fair</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-saffron" style={{ width: `${score}%` }} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-hairline pt-3">
            <div>
              <p className="font-noto text-[12px] text-ink">Risk level</p>
              <p className="font-public text-[15px] font-bold text-critical">High</p>
            </div>
            <div>
              <p className="font-noto text-[12px] text-ink">Nearby incidents</p>
              <p className="font-public text-[15px] font-bold text-navy">2 within 5 km</p>
            </div>
          </div>
          <p className="mt-3 font-noto text-[11px] italic text-ink/60">Last updated 2 min ago · DEMO DATA</p>
        </Card>

        {/* My Priority Tasks */}
        <SectionTitle
          action={
            <button onClick={onOpenTasks} className="font-public text-[13px] font-semibold text-navy active:opacity-70">
              View all
            </button>
          }
        >
          My Priority Tasks
        </SectionTitle>
        <div className="flex flex-col gap-2.5">
          {PRIORITY_TASKS.map((t) => (
            <Card key={t.id} className="p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-public text-[11px] font-semibold text-ink/70">{t.id}</p>
                  <p className="mt-0.5 font-public text-[15px] font-bold leading-snug text-navy">{t.title}</p>
                </div>
                <PriorityBadge level={t.priority} />
              </div>
              <p className="mt-1.5 inline-flex items-center gap-1.5 font-noto text-[13px] text-ink">
                <MapPin size={14} className="shrink-0 text-ink/70" /> {t.place}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <StatusChip tone="muted">{t.due}</StatusChip>
                <button
                  onClick={onStartTask}
                  className="rounded-md bg-navy px-4 py-2 font-public text-[14px] font-bold text-white active:bg-navy-pressed"
                >
                  Start Task
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Nearby Incidents */}
        <SectionTitle
          action={
            <button onClick={onViewIncidents} className="font-public text-[13px] font-semibold text-navy active:opacity-70">
              View All Incidents
            </button>
          }
        >
          Nearby Incidents
        </SectionTitle>
        <Card>
          {NEARBY.map((n, i) => {
            const tone = n.level === "critical" ? "text-critical" : n.level === "caution" ? "text-saffron" : "text-clear";
            return (
              <div key={n.title} className={`flex items-start gap-3 px-3.5 py-3 ${i > 0 ? "border-t border-hairline" : ""}`}>
                <span className={`mt-0.5 shrink-0 ${tone}`}>
                  {n.level === "clear" ? <Check size={18} /> : <Warning size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-public text-[14px] font-semibold leading-snug text-navy">{n.title}</p>
                  <p className="mt-0.5 font-noto text-[12px] text-ink">{n.place}</p>
                </div>
                <span className="shrink-0 font-public text-[12px] font-bold text-ink/70">{n.dist}</span>
              </div>
            );
          })}
        </Card>

        {/* Quick Actions */}
        <SectionTitle>Quick Actions</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {QUICK_ACTIONS.map((q, i) => (
            <button
              key={q.type}
              onClick={() => onReportType(q.type)}
              className={`flex items-center gap-2.5 rounded-md border border-hairline bg-white px-3.5 py-3 text-left active:bg-black/[0.02] ${
                i === QUICK_ACTIONS.length - 1 ? "col-span-2" : ""
              }`}
            >
              <span className="text-[20px] leading-none">{q.emoji}</span>
              <span className="font-public text-[13px] font-semibold text-navy">Report {q.label}</span>
              <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full" style={{ background: `${GOLD}22`, color: GOLD }}>
                +
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Route screen (drives screens 1/2/3 from state) ──
function RouteScreen({
  phase,
  rerouted,
  riskUpgraded,
  progress,
  expanded,
  setExpanded,
  onNotNow,
  onViewSafer,
  onFollowNew,
  onCompare,
  onReport,
}: {
  phase: Phase;
  rerouted: boolean;
  riskUpgraded: boolean;
  progress: number;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  onNotNow: () => void;
  onViewSafer: () => void;
  onFollowNew: () => void;
  onCompare: () => void;
  onReport: () => void;
}) {
  const risky = phase === "interrupt" || phase === "calculating";

  return (
    <>
      {/* Map region */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {phase === "rerouted" ? (
          <ConfirmedMap draw />
        ) : risky ? (
          <RiskMap />
        ) : (
          <IdleMap />
        )}

        {/* Risk legend — required whenever the map shows risk coloring */}
        {phase === "rerouted" && <MapLegend />}

        {/* floating map controls */}
        {phase !== "rerouted" && (
          <div className="absolute bottom-4 right-4 flex flex-col overflow-hidden rounded-lg border border-hairline bg-white">
            <button className="p-2.5 text-navy hover:bg-black/5">
              <Pin size={22} />
            </button>
            <div className="h-px bg-hairline" />
            <button className="p-2.5 text-navy hover:bg-black/5">
              <Layers size={22} />
            </button>
          </div>
        )}

        {/* Critical alert card (Screen 2) */}
        {phase === "interrupt" && (
          <AlertCard onNotNow={onNotNow} onViewSafer={onViewSafer} />
        )}
      </div>

      {/* Bottom sheet */}
      {phase === "rerouted" ? (
        <ReroutedSheet
          expanded={expanded}
          setExpanded={setExpanded}
          onCompare={onCompare}
          onFollowNew={onFollowNew}
        />
      ) : risky ? (
        <CalculatingSheet progress={progress} expanded={expanded} setExpanded={setExpanded} />
      ) : (
        <ActiveSheet
          rerouted={rerouted}
          riskUpgraded={riskUpgraded}
          expanded={expanded}
          setExpanded={setExpanded}
          onReport={onReport}
        />
      )}
    </>
  );
}

// Drag handle + tap-to-snap between partial and expanded detents.
function Sheet({
  expanded,
  setExpanded,
  children,
}: {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const startY = useRef<number | null>(null);
  return (
    <div
      className="relative z-10 shrink-0 border-t border-hairline bg-white"
      style={{
        maxHeight: expanded ? "78%" : undefined,
        overflowY: expanded ? "auto" : "visible",
      }}
    >
      <button
        className="flex w-full cursor-grab justify-center pt-2.5 pb-1 active:cursor-grabbing"
        onClick={() => setExpanded(!expanded)}
        onPointerDown={(e) => (startY.current = e.clientY)}
        onPointerUp={(e) => {
          if (startY.current == null) return;
          const dy = e.clientY - startY.current;
          if (dy < -24) setExpanded(true);
          else if (dy > 24) setExpanded(false);
          startY.current = null;
        }}
        aria-label="Toggle sheet"
      >
        <span className="h-1 w-9 rounded-full bg-[#c4c8cd]" />
      </button>
      <div className="px-5 pb-4 pt-1">{children}</div>
    </div>
  );
}

function ActiveSheet({
  rerouted,
  riskUpgraded,
  expanded,
  setExpanded,
  onReport,
}: {
  rerouted: boolean;
  riskUpgraded: boolean;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  onReport: () => void;
}) {
  return (
    <Sheet expanded={expanded} setExpanded={setExpanded}>
      <NextTurnRow
        km={rerouted ? "3.4 km" : "1.2 km"}
        main={rerouted ? "Right onto Lumshnong bypass" : "Left onto NH-6 spur"}
        sub={rerouted ? "then 21 km" : "at Km 26 junction, Lubha bridge"}
        icon={rerouted ? "right" : "left"}
      />
      <Divider />
      <StatPair
        left={{ label: "ETA range", value: rerouted ? "14:38 – 15:10" : "14:20 – 14:50" }}
        right={{ label: "Remaining", value: rerouted ? "40 km · Sonapur" : "48 km · Sonapur" }}
      />

      {!rerouted &&
        (riskUpgraded ? (
          <Banner tone="critical" label="High risk" text="Km 31–34 flagged ahead · reroute advised" />
        ) : (
          <Banner tone="caution" label="Caution" text="Km 22–26 wet slope, reduce speed" />
        ))}

      <div className="mt-3.5 flex gap-3">
        <OutlineButton className="flex-1">Route detail</OutlineButton>
        <SolidButton className="flex-1" onClick={onReport}>
          Report condition
        </SolidButton>
      </div>
    </Sheet>
  );
}

function CalculatingSheet({
  progress,
  expanded,
  setExpanded,
}: {
  progress: number;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}) {
  return (
    <Sheet expanded={expanded} setExpanded={setExpanded}>
      <div className="flex items-start gap-2.5 rounded-md border border-critical/30 bg-critical/5 px-3.5 py-3">
        <Warning size={20} className="mt-0.5 shrink-0 text-critical" />
        <p className="font-noto text-[15px] leading-snug text-[#3a2725]">
          <span className="font-bold text-critical">High risk ahead</span> · Km 31–34 flagged on current route
        </p>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-hairline">
          <span style={{ animation: "spinSlow 1.1s linear infinite" }} className="flex">
            <Spinner size={22} className="text-navy" />
          </span>
        </span>
        <p className="font-public text-[16px] font-semibold text-navy">Calculating alternate route…</p>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#e6e7e2]">
        <div
          className="h-full rounded-full bg-navy transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Divider />
      <StatPair
        left={{ label: "ETA range — on hold", value: "14:20 – 14:50", strike: true }}
        right={{ label: "Candidate bypass", value: "Lumshnong, +18 km" }}
      />
    </Sheet>
  );
}

function ReroutedSheet({
  expanded,
  setExpanded,
  onCompare,
  onFollowNew,
}: {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  onCompare: () => void;
  onFollowNew: () => void;
}) {
  return (
    <Sheet expanded={expanded} setExpanded={setExpanded}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-clear/40 bg-clear/5">
          <Check size={20} className="text-clear" />
        </span>
        <div>
          <h2 className="font-public text-[19px] font-bold leading-tight text-navy">
            Rerouted via Lumshnong bypass
          </h2>
          <p className="mt-1 font-noto text-[14px] leading-snug text-ink">
            Avoids Km 31–34. Two lanes, PMGSY surface, clear at 09:40.
          </p>
        </div>
      </div>

      <Divider />
      <StatPair
        left={{
          label: "New ETA range",
          value: "14:38 – 15:10",
          note: "+18 min vs. original",
          noteTone: "saffron",
        }}
        right={{
          label: "Risk exposure",
          value: "Low · 1 caution",
          note: "was High · 1 blocked",
          noteTone: "muted",
        }}
      />

      <div className="mt-3.5 flex items-start gap-2.5 rounded-md bg-[#f0f1ec] px-3.5 py-3">
        <TurnRight size={20} className="mt-0.5 shrink-0 text-ink" />
        <p className="font-noto text-[15px] leading-snug text-navy">
          <span className="font-semibold">Next turn · 3.4 km</span>
          <br />
          Right onto Lumshnong bypass, then 21 km
        </p>
      </div>

      <div className="mt-3.5 flex gap-3">
        <OutlineButton className="flex-1" onClick={onCompare}>
          Compare
        </OutlineButton>
        <SolidButton className="flex-[1.6]" onClick={onFollowNew}>
          Follow new route
        </SolidButton>
      </div>
    </Sheet>
  );
}

// Risk-on-segments legend (Screen 3). Color + icon + text — never color alone.
function MapLegend() {
  const rows: { color: string; icon: React.ReactNode; label: string; dashed?: boolean }[] = [
    { color: "#1e6b45", icon: <Check size={13} className="text-clear" />, label: "Clear" },
    { color: "#d97a1f", icon: <Warning size={13} className="text-saffron" />, label: "Caution" },
    {
      color: "#b3261e",
      icon: (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-[1.5px] border-critical">
          <span className="h-1 w-1 rounded-full bg-critical" />
        </span>
      ),
      label: "High risk",
    },
    { color: "#9aa0a8", icon: null, label: "Avoided route", dashed: true },
  ];
  return (
    <div
      className="absolute left-3 top-3 z-10 rounded-md border border-hairline bg-white/95 px-3 py-2.5 backdrop-blur-sm"
      style={{ animation: "quietFade 200ms ease-out" }}
    >
      <p className="mb-1.5 font-public text-[13px] font-bold text-navy">Risk on segments</p>
      <div className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span
              className="h-[3px] w-5 shrink-0 rounded-full"
              style={
                r.dashed
                  ? { backgroundImage: `repeating-linear-gradient(90deg, ${r.color} 0 4px, transparent 4px 7px)` }
                  : { background: r.color }
              }
            />
            <span className="flex w-3.5 justify-center">{r.icon}</span>
            <span className="font-noto text-[13px] text-ink">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertCard({
  onNotNow,
  onViewSafer,
}: {
  onNotNow: () => void;
  onViewSafer: () => void;
}) {
  return (
    <div
      className="absolute inset-x-3 top-3 z-20 overflow-hidden rounded-md border border-critical bg-white"
      style={{ animation: "slideDown 200ms ease-out" }}
    >
      <div className="flex items-center justify-between bg-critical px-4 py-3 text-white">
        <span className="inline-flex items-center gap-2 font-public text-[16px] font-bold">
          <Warning size={18} /> Critical risk alert
        </span>
        <span className="font-noto text-[14px] text-white/85">now</span>
      </div>
      <div className="px-4 py-3.5">
        <p className="font-public text-[18px] font-bold leading-tight text-navy">
          NH-6 Km 31–34 is now high risk
        </p>
        <p className="mt-1.5 font-noto text-[15px] leading-snug text-ink">
          Predicted landslide, 78% confidence · 5 km ahead, reaches you in 11 min.
        </p>
        <div className="mt-3.5 flex gap-3">
          <OutlineButton onClick={onNotNow}>Not now</OutlineButton>
          <button
            onClick={onViewSafer}
            className="flex-1 rounded-md bg-critical px-4 py-3 font-public text-[16px] font-bold text-white active:bg-[#8f1e17]"
          >
            View safer route
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reusable pieces ──
function NextTurnRow({
  km,
  main,
  sub,
  icon,
}: {
  km: string;
  main: string;
  sub: string;
  icon: "left" | "right";
}) {
  const Icon = icon === "left" ? TurnLeft : TurnRight;
  return (
    <div className="flex items-start gap-3.5">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-hairline">
        <Icon size={30} className="text-navy" />
      </span>
      <div className="pt-0.5">
        <p className="font-noto text-[15px] text-ink">Next turn · {km}</p>
        <p className="font-public text-[22px] font-bold leading-tight text-navy">{main}</p>
        <p className="mt-0.5 font-noto text-[15px] text-ink">{sub}</p>
      </div>
    </div>
  );
}

function StatPair({
  left,
  right,
}: {
  left: StatCol;
  right: StatCol;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
      <StatColView {...left} />
      <div className="w-px bg-hairline" />
      <StatColView {...right} />
    </div>
  );
}

type StatCol = {
  label: string;
  value: string;
  strike?: boolean;
  note?: string;
  noteTone?: "saffron" | "muted";
};
function StatColView({ label, value, strike, note, noteTone }: StatCol) {
  return (
    <div>
      <p className="font-noto text-[14px] text-ink">{label}</p>
      <p
        className={`font-public text-[20px] font-bold leading-tight text-navy ${
          strike ? "text-ink line-through decoration-ink/70" : ""
        }`}
      >
        {value}
      </p>
      {note && (
        <p
          className={`mt-0.5 font-noto text-[14px] font-medium ${
            noteTone === "saffron" ? "text-saffron" : "text-ink/70"
          }`}
        >
          {note}
        </p>
      )}
    </div>
  );
}

function Banner({
  tone,
  label,
  text,
}: {
  tone: "caution" | "critical";
  label: string;
  text: string;
}) {
  const c =
    tone === "caution"
      ? { border: "border-saffron/40", bg: "bg-saffron/10", icon: "text-saffron", label: "text-[#7a4310]" }
      : { border: "border-critical/40", bg: "bg-critical/5", icon: "text-critical", label: "text-critical" };
  return (
    <div className={`mt-3.5 flex items-center gap-2.5 rounded-md border ${c.border} ${c.bg} px-3.5 py-3`}>
      <Warning size={20} className={`shrink-0 ${c.icon}`} />
      <p className="font-noto text-[15px] leading-snug text-navy">
        <span className={`font-bold ${c.label}`}>{label}</span> · {text}
      </p>
    </div>
  );
}

function Divider() {
  return <div className="my-3.5 h-px w-full bg-hairline" />;
}

function OutlineButton({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border border-navy px-4 py-3 font-public text-[16px] font-bold text-navy active:bg-navy/5 ${className}`}
    >
      {children}
    </button>
  );
}

function SolidButton({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md bg-navy px-4 py-3 font-public text-[16px] font-bold text-white active:bg-navy-pressed ${className}`}
    >
      {children}
    </button>
  );
}

function CompareModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-end bg-black/40"
      style={{ animation: "quietFade 160ms ease-out" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl bg-white p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-[#c4c8cd]" />
        <h2 className="font-public text-[20px] font-bold text-navy">Compare routes</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <CompareCol
            title="Original"
            tone="critical"
            eta="14:20 – 14:50"
            risk="High · 1 blocked"
            note="Km 31–34 landslide risk"
          />
          <CompareCol
            title="Rerouted"
            tone="clear"
            eta="14:38 – 15:10"
            risk="Low · 1 caution"
            note="+18 min · via Lumshnong"
          />
        </div>
        <SolidButton className="mt-5 w-full" onClick={onClose}>
          Close
        </SolidButton>
      </div>
    </div>
  );
}

function CompareCol({
  title,
  tone,
  eta,
  risk,
  note,
}: {
  title: string;
  tone: "critical" | "clear";
  eta: string;
  risk: string;
  note: string;
}) {
  const accent = tone === "critical" ? "text-critical" : "text-clear";
  return (
    <div className="rounded-md border border-hairline p-3.5">
      <p className={`font-public text-[15px] font-bold ${accent}`}>{title}</p>
      <p className="mt-3 font-noto text-[13px] text-ink">ETA</p>
      <p className="font-public text-[17px] font-bold text-navy">{eta}</p>
      <p className="mt-2.5 font-noto text-[13px] text-ink">Risk exposure</p>
      <p className="font-public text-[16px] font-bold text-navy">{risk}</p>
      <p className="mt-2 font-noto text-[13px] text-ink">{note}</p>
    </div>
  );
}

// ── Static status-bar glyphs ──
function SignalGlyph() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" className="text-white">
      <rect x="0" y="8" width="3" height="4" rx="0.5" />
      <rect x="5" y="5" width="3" height="7" rx="0.5" />
      <rect x="10" y="2.5" width="3" height="9.5" rx="0.5" />
      <rect x="15" y="0" width="3" height="12" rx="0.5" />
    </svg>
  );
}
function WifiGlyph() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-white">
      <path d="M1 4.2C3.4 2 5.8 1 8.5 1S13.6 2 16 4.2" strokeLinecap="round" />
      <path d="M3.6 7C5.1 5.7 6.7 5 8.5 5s3.4.7 4.9 2" strokeLinecap="round" />
      <path d="M6.2 9.7c.7-.6 1.5-.9 2.3-.9s1.6.3 2.3.9" strokeLinecap="round" />
      <circle cx="8.5" cy="11.4" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
function BatteryGlyph() {
  return (
    <svg width="26" height="13" viewBox="0 0 26 13" fill="none" className="text-white">
      <rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke="currentColor" opacity="0.5" />
      <rect x="2" y="2" width="18" height="9" rx="1.5" fill="currentColor" />
      <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
