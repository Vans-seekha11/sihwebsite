import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clock, Pin, Warning, WifiOff, XIcon } from "./icons";
import { RiskBadge } from "./shared";
import { HomeMap } from "./maps";

type HomeView = "home" | "tasks";
type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";
type TaskPriority = "critical" | "high" | "medium" | "low";

// ── Static data ────────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { id: "flood",    label: "Flood",      emoji: "🌊", color: "bg-[#1e6b45]/10 border-[#1e6b45]/30 text-[#1e6b45]" },
  { id: "blockage", label: "Road Block", emoji: "🚧", color: "bg-saffron/10 border-saffron/30 text-saffron" },
  { id: "slide",   label: "Landslide",  emoji: "⛰️", color: "bg-critical/5 border-critical/30 text-critical" },
  { id: "accident",label: "Accident",   emoji: "🚗", color: "bg-navy/5 border-navy/20 text-navy" },
  { id: "infra",   label: "Infra",      emoji: "🏗️", color: "bg-ink/5 border-hairline text-ink" },
];

const PRIORITY_TASKS = [
  { id: "TSK-001", title: "Inspect NH-6 Km 22–26 slope damage", location: "NH-6, Km 22–26",    priority: "critical" as TaskPriority, due: "10:30", status: "in_progress" as TaskStatus },
  { id: "TSK-002", title: "Coordinate medical convoy LOG-4471",  location: "NH-6, Km 18",        priority: "high"     as TaskPriority, due: "11:00", status: "pending"     as TaskStatus },
  { id: "TSK-005", title: "Verify road clearing at Km 31",       location: "SH-5, Km 31",        priority: "critical" as TaskPriority, due: "09:00", status: "overdue"     as TaskStatus },
];

const INCIDENTS = [
  { id: "INC-2291", title: "NH-6 Km 31–34 landslide risk",  risk: "critical" as const, dist: "5 km",  time: "09:41" },
  { id: "INC-2287", title: "SH-5 Km 31 blockage — lorry",   risk: "critical" as const, dist: "6 km",  time: "09:28" },
  { id: "INC-2280", title: "Umiam flood alert — level 4.8m", risk: "caution"  as const, dist: "12 km", time: "09:15" },
  { id: "INC-2274", title: "NH-6 Km 22 wet slope advisory",  risk: "caution"  as const, dist: "4 km",  time: "08:52" },
];

const PRIO_BADGE: Record<TaskPriority, string> = {
  critical: "bg-critical text-white",
  high:     "bg-saffron text-white",
  medium:   "bg-navy/10 text-navy",
  low:      "bg-ink/10 text-ink",
};

const STATUS_CFG: Record<TaskStatus, { label: string; cls: string }> = {
  pending:     { label: "Pending",     cls: "border-saffron/50 bg-saffron/10 text-saffron" },
  in_progress: { label: "In Progress", cls: "border-navy/40 bg-navy/5 text-navy" },
  overdue:     { label: "Overdue",     cls: "border-critical/50 bg-critical/5 text-critical" },
  completed:   { label: "Completed",   cls: "border-clear/40 bg-clear/5 text-clear" },
};

// ── Main HomeScreen ────────────────────────────────────────────────────────────

export default function HomeScreen({
  offline,
  onToggleOffline,
  onAlertTap,
  onViewAllAlerts,
  onSignOut,
}: {
  offline: boolean;
  onToggleOffline: () => void;
  onAlertTap: () => void;
  onViewAllAlerts: () => void;
  onSignOut: () => void;
}) {
  const [view, setView] = useState<HomeView>("home");
  const [mapExpanded, setMapExpanded] = useState(false);
  const [quickToast, setQuickToast] = useState<string | null>(null);

  const showQuickToast = (label: string) => {
    setQuickToast(`Drafting ${label} report…`);
    setTimeout(() => setQuickToast(null), 2000);
  };

  if (view === "tasks") return <MyTasksSubScreen onBack={() => setView("home")} />;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-paper">
      {/* Offline strip */}
      {offline && (
        <div className="flex shrink-0 items-center gap-2 bg-[#7a4310]/90 px-4 py-2.5">
          <WifiOff size={16} className="shrink-0 text-white" />
          <p className="flex-1 font-noto text-[13px] text-white">
            You&apos;re offline. Reports will send when you&apos;re back online.
          </p>
          <button onClick={onToggleOffline} className="text-white/60 active:text-white">
            <XIcon size={16} />
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Map */}
        <div className="relative overflow-hidden bg-[#d8e4d4]" style={{ height: mapExpanded ? 300 : 170 }}>
          <HomeMap />
          <button
            onClick={() => setMapExpanded((v) => !v)}
            className="absolute bottom-3 right-3 rounded border border-hairline bg-white/90 px-2.5 py-1.5 font-public text-[12px] font-semibold text-navy backdrop-blur-sm"
          >
            {mapExpanded ? "Collapse" : "Expand map"}
          </button>
          {/* Risk legend */}
          <div className="absolute left-3 top-3 rounded border border-hairline bg-white/90 px-2.5 py-2 backdrop-blur-sm">
            <p className="mb-1 font-public text-[10px] font-bold text-navy uppercase tracking-wide">Risk</p>
            {[{ color: "#1e6b45", label: "Clear" }, { color: "#d97a1f", label: "Caution" }, { color: "#b3261e", label: "High" }].map((r) => (
              <div key={r.label} className="mt-0.5 flex items-center gap-1.5">
                <span className="h-[3px] w-4 rounded-full" style={{ background: r.color }} />
                <span className="font-noto text-[11px] text-ink">{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KPI row — 2×2 */}
        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Assigned Tasks",   value: "08", sub: "total today",      valueColor: "text-navy" },
              { label: "Pending",          value: "03", sub: "need attention",    valueColor: "text-saffron" },
              { label: "Active Incidents", value: "05", sub: "in your area",      valueColor: "text-critical" },
              { label: "Critical Alerts",  value: "02", sub: "unacknowledged",    valueColor: "text-critical" },
            ].map((k) => (
              <button
                key={k.label}
                onClick={k.label.includes("Alert") || k.label.includes("Incident") ? onViewAllAlerts : undefined}
                className="rounded-md border border-hairline bg-white px-3.5 py-3 text-left active:bg-navy/5"
              >
                <p className={`font-public text-[30px] font-bold leading-none ${k.valueColor}`}>{k.value}</p>
                <p className="mt-1 font-public text-[13px] font-semibold text-navy">{k.label}</p>
                <p className="font-noto text-[11px] text-ink/55">{k.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Area Situation card */}
        <div className="mx-4 mt-4 rounded-md border border-hairline bg-white px-4 py-3.5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-public text-[10px] font-bold uppercase tracking-wider text-ink/50">Current Area Situation</p>
              <p className="mt-1 font-public text-[16px] font-bold text-navy">Ri Bhoi District</p>
            </div>
            <RiskBadge level="caution" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="font-noto text-[13px] text-ink">Accessibility score</span>
              <span className="font-public text-[20px] font-bold text-saffron">72<span className="font-public text-[13px] font-medium text-ink/50">/100</span></span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-saffron" style={{ width: "72%", transition: "width 600ms ease-out" }} />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <p className="font-noto text-[12px] text-ink/55">Nearby incidents</p>
              <p className="font-public text-[15px] font-semibold text-navy">4 active</p>
            </div>
            <div>
              <p className="font-noto text-[12px] text-ink/55">Last updated</p>
              <p className="font-public text-[15px] font-semibold text-navy">09:41</p>
            </div>
          </div>
        </div>

        {/* Priority Tasks */}
        <div className="mx-4 mt-4">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="font-public text-[15px] font-bold text-navy">My Priority Tasks</p>
            <button onClick={() => setView("tasks")} className="flex items-center gap-0.5 font-public text-[13px] font-semibold text-navy/60 active:text-navy">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {PRIORITY_TASKS.map((t) => (
              <div key={t.id} className="rounded-md border border-hairline bg-white px-3.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-noto text-[12px] text-ink/50">{t.id}</span>
                  <span className={`rounded-full px-2 py-0.5 font-public text-[10px] font-bold ${PRIO_BADGE[t.priority]}`}>{t.priority}</span>
                </div>
                <p className="mt-1 font-public text-[15px] font-semibold leading-snug text-navy">{t.title}</p>
                <div className="mt-1.5 flex items-center gap-1 font-noto text-[13px] text-ink/55">
                  <Pin size={13} /> {t.location}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-noto text-[12px] text-ink/55">
                    <Clock size={12} /> Due {t.due}
                  </span>
                  <span className={`rounded border px-2 py-0.5 font-public text-[11px] font-semibold ${STATUS_CFG[t.status].cls}`}>
                    {STATUS_CFG[t.status].label}
                  </span>
                </div>
                <button className="mt-2.5 w-full rounded bg-navy py-2 font-public text-[13px] font-bold text-white active:bg-[#1b3f63]">
                  Start task
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Incidents */}
        <div className="mx-4 mt-4">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="font-public text-[15px] font-bold text-navy">Nearby Incidents</p>
            <button onClick={onViewAllAlerts} className="flex items-center gap-0.5 font-public text-[13px] font-semibold text-navy/60 active:text-navy">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="overflow-hidden rounded-md border border-hairline bg-white">
            {INCIDENTS.map((inc, i) => (
              <button
                key={inc.id}
                onClick={onAlertTap}
                className={`flex w-full items-center gap-3 px-3.5 py-3 text-left active:bg-navy/5 ${i < INCIDENTS.length - 1 ? "border-b border-hairline" : ""}`}
              >
                <Warning size={17} className={`shrink-0 ${inc.risk === "critical" ? "text-critical" : "text-saffron"}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-public text-[14px] font-semibold text-navy">{inc.title}</p>
                  <p className="font-noto text-[12px] text-ink/55">{inc.dist} · {inc.time}</p>
                </div>
                <RiskBadge level={inc.risk} />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Report */}
        <div className="mx-4 mt-4 mb-4">
          <p className="mb-2.5 font-public text-[15px] font-bold text-navy">Quick Report</p>
          <div className="grid grid-cols-5 gap-2">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.id}
                onClick={() => showQuickToast(a.label)}
                className={`flex flex-col items-center gap-1.5 rounded-md border py-3 font-public text-[10px] font-semibold active:scale-95 transition-transform duration-100 ${a.color}`}
              >
                <span className="text-[20px] leading-none">{a.emoji}</span>
                <span className="text-center leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Demo / dev controls */}
        <div className="mx-4 mb-6 flex gap-2 border-t border-hairline pt-4">
          <button onClick={onToggleOffline} className="flex-1 rounded-md border border-ink/20 py-2 font-public text-[13px] font-semibold text-ink active:bg-ink/5">
            {offline ? "Go online" : "Simulate offline"}
          </button>
          <button onClick={onSignOut} className="flex-1 rounded-md border border-critical/30 py-2 font-public text-[13px] font-semibold text-critical active:bg-critical/5">
            Sign out
          </button>
        </div>
      </div>

      {/* Quick action toast */}
      {quickToast && (
        <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-md bg-navy px-4 py-2.5 font-public text-[14px] font-medium text-white" style={{ animation: "quietFade 180ms ease-out" }}>
          {quickToast}
        </div>
      )}
    </div>
  );
}

// ── My Tasks sub-screen (inline push navigation) ───────────────────────────────

interface Task {
  id: string;
  title: string;
  location: string;
  priority: TaskPriority;
  due: string;
  created: string;
  status: TaskStatus;
}

const ALL_TASKS: Task[] = [
  { id: "TSK-001", title: "Inspect NH-6 Km 22–26 slope damage",    location: "NH-6, Km 22–26",    priority: "critical", due: "10:30", created: "07:00", status: "in_progress" },
  { id: "TSK-002", title: "Coordinate medical convoy LOG-4471",     location: "NH-6, Km 18",        priority: "high",     due: "11:00", created: "08:00", status: "pending" },
  { id: "TSK-003", title: "Report bridge condition — Lubha",        location: "Lubha bridge, Km 26",priority: "high",     due: "12:00", created: "06:00", status: "pending" },
  { id: "TSK-004", title: "Daily area situation report",            location: "Ri Bhoi district HQ",priority: "medium",   due: "17:00", created: "07:00", status: "completed" },
  { id: "TSK-005", title: "Verify road clearing at Km 31",         location: "SH-5, Km 31",        priority: "critical", due: "09:00", created: "06:30", status: "overdue" },
  { id: "TSK-006", title: "Check Umiam checkpoint logbook",         location: "Umiam checkpoint",   priority: "medium",   due: "14:00", created: "08:30", status: "pending" },
  { id: "TSK-007", title: "Submit logistics delay report",          location: "Field / mobile",     priority: "high",     due: "13:00", created: "09:00", status: "in_progress" },
  { id: "TSK-008", title: "Community liaison — Jorabat",            location: "Jorabat village",    priority: "low",      due: "16:00", created: "08:00", status: "completed" },
];

type TabId = "all" | TaskStatus;
const TASK_TABS: { id: TabId; label: string }[] = [
  { id: "all",         label: "All" },
  { id: "pending",     label: "Pending" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed",   label: "Completed" },
  { id: "overdue",     label: "Overdue" },
];

function MyTasksSubScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<TabId>("all");
  const [overrides, setOverrides] = useState<Record<string, TaskStatus>>({});

  const getStatus = (t: Task) => overrides[t.id] ?? t.status;

  const filtered = ALL_TASKS.filter((t) => tab === "all" || getStatus(t) === tab);

  const advance = (id: string, cur: TaskStatus) => {
    const nxt: Partial<Record<TaskStatus, TaskStatus>> = { pending: "in_progress", in_progress: "completed", overdue: "in_progress" };
    if (nxt[cur]) setOverrides((m) => ({ ...m, [id]: nxt[cur]! }));
  };

  const tabCount = (id: TabId) =>
    id === "all" ? ALL_TASKS.length : ALL_TASKS.filter((t) => getStatus(t) === id).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-paper">
      {/* Back + header */}
      <div className="shrink-0 border-b border-hairline bg-white px-4 py-3">
        <button onClick={onBack} className="flex items-center gap-1.5 font-public text-[14px] font-semibold text-navy/70 active:text-navy">
          <ChevronLeft size={18} /> Home
        </button>
        <h2 className="mt-2 font-public text-[20px] font-bold text-navy">My Tasks</h2>
        <p className="font-noto text-[13px] text-ink/60">Ri Bhoi district · today</p>
      </div>

      {/* Tab strip */}
      <div className="shrink-0 overflow-x-auto border-b border-hairline bg-white px-4">
        <div className="flex whitespace-nowrap">
          {TASK_TABS.map((t) => {
            const cnt = tabCount(t.id);
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-1.5 px-3 pb-2.5 pt-2 font-public text-[13px] font-semibold transition-colors duration-150 ${active ? "text-navy" : "text-ink"}`}
              >
                {t.label}
                {cnt > 0 && (
                  <span className={`inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${active ? "bg-navy text-white" : "bg-ink/10 text-ink"}`}>
                    {cnt}
                  </span>
                )}
                {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-navy" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Check size={36} className="text-ink/30" />
            <p className="mt-3 font-public text-[16px] font-semibold text-ink/50">No tasks in this view</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((task) => {
              const s = getStatus(task);
              const sCfg = STATUS_CFG[s];
              return (
                <div key={task.id} className="rounded-md border border-hairline bg-white px-3.5 py-3 transition-all duration-150">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-noto text-[12px] text-ink/50">{task.id}</span>
                    <span className={`rounded-full px-2 py-0.5 font-public text-[10px] font-bold ${PRIO_BADGE[task.priority]}`}>{task.priority}</span>
                  </div>
                  <p className="mt-1 font-public text-[15px] font-semibold leading-snug text-navy">{task.title}</p>
                  <div className="mt-1.5 flex items-center gap-1 font-noto text-[13px] text-ink/55">
                    <Pin size={13} /> {task.location}
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 font-noto text-[12px] text-ink/50">
                    <span className="flex items-center gap-1"><Clock size={12} /> Due {task.due}</span>
                    <span>Created {task.created}</span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className={`rounded border px-2 py-0.5 font-public text-[11px] font-semibold ${sCfg.cls}`}>{sCfg.label}</span>
                    <div>
                      {s === "pending" && (
                        <button onClick={() => advance(task.id, s)} className="rounded border border-navy px-3 py-1.5 font-public text-[13px] font-semibold text-navy active:bg-navy/5">Accept</button>
                      )}
                      {s === "in_progress" && (
                        <button onClick={() => advance(task.id, s)} className="rounded bg-navy px-3 py-1.5 font-public text-[13px] font-bold text-white active:bg-[#1b3f63]">Mark Complete</button>
                      )}
                      {s === "overdue" && (
                        <button onClick={() => advance(task.id, s)} className="rounded bg-critical px-3 py-1.5 font-public text-[13px] font-bold text-white active:bg-[#8f1e17]">Accept &amp; Start</button>
                      )}
                      {s === "completed" && (
                        <span className="flex items-center gap-1 font-public text-[12px] font-semibold text-clear">
                          <Check size={14} /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
