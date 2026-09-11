import { useEffect, useState } from "react";
import { ChevronLeft, Pin, Clock, Check } from "./icons";
import { supabase } from "../lib/supabase";
import type { Task as DbTask } from "../lib/database.types";

type Priority = "critical" | "high" | "medium" | "low";
type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";

interface Task {
  id: string;
  title: string;
  location: string;
  priority: Priority;
  due: string;
  created: string;
  status: TaskStatus;
  accepted: string | null;
}

const INITIAL_TASKS: Task[] = [
  { id: "TSK-001", title: "Inspect NH-6 Km 22-26 slope damage", location: "NH-6, Km 22–26", priority: "critical", due: "10:30", created: "07:00", status: "in_progress", accepted: "07:45" },
  { id: "TSK-002", title: "Coordinate medical convoy LOG-4471", location: "NH-6, Km 18", priority: "high", due: "11:00", created: "08:00", status: "pending", accepted: null },
  { id: "TSK-003", title: "Report bridge condition — Lubha", location: "Lubha bridge, Km 26", priority: "high", due: "12:00", created: "06:00", status: "pending", accepted: null },
  { id: "TSK-004", title: "Daily area situation report", location: "Ri Bhoi district HQ", priority: "medium", due: "17:00", created: "07:00", status: "completed", accepted: "07:30" },
  { id: "TSK-005", title: "Verify road clearing at Km 31", location: "SH-5, Km 31", priority: "critical", due: "09:00", created: "06:30", status: "overdue", accepted: null },
  { id: "TSK-006", title: "Check Umiam checkpoint logbook", location: "Umiam checkpoint", priority: "medium", due: "14:00", created: "08:30", status: "pending", accepted: null },
  { id: "TSK-007", title: "Submit logistics delay report", location: "Field / mobile", priority: "high", due: "13:00", created: "09:00", status: "in_progress", accepted: "09:10" },
  { id: "TSK-008", title: "Community liaison — Jorabat", location: "Jorabat village", priority: "low", due: "16:00", created: "08:00", status: "completed", accepted: "08:15" },
];

type TabKey = "all" | "pending" | "in_progress" | "completed" | "overdue";

const TABS: { key: TabKey; label: string; count: number }[] = [
  { key: "all", label: "All", count: 8 },
  { key: "pending", label: "Pending", count: 3 },
  { key: "in_progress", label: "In Progress", count: 2 },
  { key: "completed", label: "Completed", count: 2 },
  { key: "overdue", label: "Overdue", count: 1 },
];

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg: Record<Priority, { label: string; cls: string }> = {
    critical: { label: "Critical", cls: "bg-critical/10 border-critical/30 text-critical" },
    high: { label: "High", cls: "bg-saffron/10 border-saffron/30 text-saffron" },
    medium: { label: "Medium", cls: "bg-navy/10 border-navy/20 text-navy" },
    low: { label: "Low", cls: "bg-ink/10 border-ink/20 text-ink" },
  };
  const { label, cls } = cfg[priority];
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 font-noto text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

function StatusChip({ status }: { status: TaskStatus }) {
  const cfg: Record<TaskStatus, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-saffron/10 border-saffron/40 text-saffron" },
    in_progress: { label: "In Progress", cls: "bg-navy/5 border-navy text-navy" },
    completed: { label: "Completed", cls: "bg-clear/5 border-clear/40 text-clear" },
    overdue: { label: "Overdue", cls: "bg-critical/10 border-critical text-critical" },
  };
  const { label, cls } = cfg[status];
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 font-noto text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function TaskCard({ task, onAccept, onComplete }: { task: Task; onAccept: (id: string) => void; onComplete: (id: string) => void }) {
  return (
    <div className="rounded-md border border-hairline bg-white p-4 transition-all duration-150">
      {/* Header row */}
      <div className="mb-2 flex items-center gap-2">
        <span className="font-noto text-[12px] text-ink">{task.id}</span>
        <PriorityBadge priority={task.priority} />
        <div className="ml-auto">
          <StatusChip status={task.status} />
        </div>
      </div>

      {/* Title */}
      <p className="mb-1.5 font-public text-[16px] font-semibold leading-snug text-navy">
        {task.title}
      </p>

      {/* Location */}
      <div className="mb-1.5 flex items-center gap-1.5 text-ink">
        <Pin size={13} strokeWidth={1.75} className="shrink-0" />
        <span className="font-noto text-[14px]">{task.location}</span>
      </div>

      {/* Times */}
      <div className="mb-3 flex items-center gap-3 text-ink/70">
        <div className="flex items-center gap-1">
          <Clock size={12} strokeWidth={1.75} />
          <span className="font-noto text-[13px]">Due {task.due}</span>
        </div>
        <span className="font-noto text-[13px]">·</span>
        <span className="font-noto text-[13px]">Created {task.created}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {task.status === "pending" && (
          <button
            onClick={() => onAccept(task.id)}
            className="rounded-md border border-navy px-4 py-1.5 font-public text-[13px] font-semibold text-navy transition-all duration-150 active:bg-navy/10"
          >
            Accept
          </button>
        )}
        {task.status === "in_progress" && (
          <button
            onClick={() => onComplete(task.id)}
            className="rounded-md bg-navy px-4 py-1.5 font-public text-[13px] font-semibold text-white transition-all duration-150 active:bg-navy-pressed"
          >
            Mark Complete
          </button>
        )}
        {task.status === "completed" && (
          <span className="inline-flex items-center gap-1 rounded border border-clear/30 bg-clear/5 px-2.5 py-1 font-noto text-[12px] font-semibold text-clear">
            <Check size={12} strokeWidth={2.2} />
            Verified
          </span>
        )}
        {task.status === "overdue" && (
          <button
            onClick={() => onAccept(task.id)}
            className="rounded-md bg-critical px-4 py-1.5 font-public text-[13px] font-semibold text-white transition-all duration-150 active:opacity-80"
          >
            Accept &amp; Start
          </button>
        )}
      </div>
    </div>
  );
}

// Map a DB task row to the local Task shape used by the UI.
function dbTaskToUi(t: DbTask): Task {
  const formatTime = (iso: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };
  return {
    id: t.task_ref ?? t.id.slice(0, 8).toUpperCase(),
    title: t.title,
    location: t.location_text ?? "—",
    priority: (t.priority === "moderate" ? "medium" : t.priority) as Priority,
    due: formatTime(t.deadline),
    created: formatTime(t.created_at),
    status: (t.status === "new" ? "pending" : t.status) as TaskStatus,
    accepted: t.accepted_at ? formatTime(t.accepted_at) : null,
  };
}

export default function MyTasksScreen({ onBack }: { onBack: () => void }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  // Fetch tasks assigned to the logged-in user.
  useEffect(() => {
    let cancelled = false;
    async function fetchTasks() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoading(false); return; } // not authed — keep mock data

        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("assigned_to", session.user.id)
          .order("created_at", { ascending: false });

        if (!cancelled && !error && data && data.length > 0) {
          setTasks(data.map(dbTaskToUi));
        }
        // If no rows (e.g. different demo user), keep INITIAL_TASKS as fallback.
      } catch {
        // Network error — keep mock data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTasks();
    return () => { cancelled = true; };
  }, []);

  const handleAccept = async (id: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "in_progress" as TaskStatus, accepted: "now" } : t))
    );
    // Persist: find the real UUID from task_ref
    const { data: row } = await supabase
      .from("tasks")
      .select("id")
      .eq("task_ref", id)
      .maybeSingle();
    if (row) {
      await supabase
        .from("tasks")
        .update({ status: "in_progress", accepted_at: new Date().toISOString() })
        .eq("id", row.id);
    }
  };

  const handleComplete = async (id: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "completed" as TaskStatus } : t))
    );
    const { data: row } = await supabase
      .from("tasks")
      .select("id")
      .eq("task_ref", id)
      .maybeSingle();
    if (row) {
      await supabase
        .from("tasks")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", row.id);
    }
  };

  const filtered = activeTab === "all" ? tasks : tasks.filter((t) => t.status === activeTab);

  return (
    <div className="flex h-full flex-col bg-paper">
      {/* Back row */}
      <div className="flex items-center gap-1 px-4 pt-4 pb-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-navy transition-opacity duration-150 active:opacity-60"
        >
          <ChevronLeft size={20} strokeWidth={2} />
          <span className="font-public text-[14px] font-semibold">Home</span>
        </button>
      </div>

      {/* Heading */}
      <div className="px-4 pt-2 pb-4">
        <h1 className="font-public text-[22px] font-bold text-navy">My Tasks</h1>
        <p className="font-noto text-[13px] text-ink">Ri Bhoi district · today</p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-hairline">
        <div className="flex overflow-x-auto px-4" style={{ scrollbarWidth: "none" }}>
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 border-b-2 pb-2 pr-5 font-public text-[14px] font-semibold transition-colors duration-150 ${
                  isActive ? "border-navy text-navy" : "border-transparent text-ink"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 font-noto text-[11px] ${
                    isActive ? "bg-navy text-white" : "bg-ink/10 text-ink"
                  }`}
                >
                  {tab.key === "all" ? tasks.length : tasks.filter((t) => t.status === tab.key).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="py-12 text-center font-noto text-[14px] text-ink/50">Loading tasks…</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center font-noto text-[14px] text-ink/50">No tasks in this category.</div>
          ) : (
            filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onAccept={handleAccept}
                onComplete={handleComplete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
