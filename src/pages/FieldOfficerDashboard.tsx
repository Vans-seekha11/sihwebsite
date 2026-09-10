import { useState } from 'react';
import { SeverityBadge, StatusBadge, AccessibilityBadge } from '@/components/StatusBadge';
import type { Severity } from '@/data/demo';

/* ────────────────────────────────────────────────────────────────
   Field Officer Dashboard
   Reuses the exact District Officer design system:
   – peach→sage gradient shows through semi-transparent cream cards
   – warm earthy borders rgba(180,162,136,0.55)
   – navy / teal / gold accents, shared badge + score components
   Only the information architecture is field-operations oriented.
──────────────────────────────────────────────────────────────── */

const SURFACE = 'rgba(250,247,240,0.82)';
const BORDER = 'rgba(180,162,136,0.55)';
const SURFACE_2 = 'rgba(238,228,210,0.88)';

const kpis = [
  { label: 'Assigned Tasks', value: '08', icon: '☑', color: '#17324D', sub: 'This shift' },
  { label: 'Pending Tasks', value: '03', icon: '◷', color: '#C4861A', sub: 'Awaiting start' },
  { label: 'Active Incidents', value: '05', icon: '◆', color: '#C25A1A', sub: 'Within 10 km' },
  { label: 'Critical Alerts', value: '02', icon: '◬', color: '#BE2424', sub: 'Needs action' },
];

interface FOTask {
  id: string;
  title: string;
  location: string;
  priority: Severity;
  due: string;
  status: string;
}

const priorityTasks: FOTask[] = [
  { id: 'FO-1024', title: 'Inspect flooded road section', location: 'Dimapur–Kohima Route (NH-29)', priority: 'CRITICAL', due: 'Today, 4:30 PM', status: 'Pending' },
  { id: 'FO-1021', title: 'Verify landslide clearance progress', location: 'Zubza Ghat, Km 34', priority: 'HIGH', due: 'Today, 6:00 PM', status: 'In Progress' },
  { id: 'FO-1019', title: 'Confirm bridge load capacity', location: 'Chumukedima Bypass', priority: 'MODERATE', due: 'Tomorrow, 10:00 AM', status: 'Accepted' },
];

interface NearbyIncident {
  type: string;
  icon: string;
  distance: string;
  location: string;
  severity: Severity;
  time: string;
  status: string;
}

const nearbyIncidents: NearbyIncident[] = [
  { type: 'Flood', icon: '≈', distance: '2.4 km away', location: 'NH-29', severity: 'CRITICAL', time: '12 min ago', status: 'ACTIVE' },
  { type: 'Road Blockage', icon: '⊗', distance: '5.1 km away', location: 'Local Route 04', severity: 'HIGH', time: '28 min ago', status: 'ACTIVE' },
  { type: 'Landslide', icon: '⛰', distance: '7.8 km away', location: 'Zubza Ghat', severity: 'MODERATE', time: '1 hr ago', status: 'UNDER_REVIEW' },
  { type: 'Accident', icon: '⊙', distance: '9.2 km away', location: 'Chumukedima Bypass', severity: 'HIGH', time: '2 hr ago', status: 'RESOLVED' },
];

const quickActions = [
  { label: 'Report Flood', icon: '≈', color: '#2F6F7E' },
  { label: 'Report Road Blockage', icon: '⊗', color: '#C25A1A' },
  { label: 'Report Landslide', icon: '⛰', color: '#8A6A3A' },
  { label: 'Report Accident', icon: '⊙', color: '#BE2424' },
  { label: 'Report Infrastructure Damage', icon: '⌂', color: '#17324D' },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border shadow-sm ${className}`} style={{ background: SURFACE, borderColor: BORDER }}>
      {children}
    </div>
  );
}

export default function FieldOfficerDashboard({ setPage }: { setPage?: (p: string) => void }) {
  const [startedTasks, setStartedTasks] = useState<Record<string, string>>({});

  const startTask = (id: string) => {
    setStartedTasks(s => ({ ...s, [id]: 'starting' }));
    setTimeout(() => setStartedTasks(s => ({ ...s, [id]: 'started' })), 900);
  };

  return (
    <div className="space-y-6 max-w-screen-2xl">

      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-semibold text-2xl" style={{ color: '#17212B' }}>Field Officer Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: '#5A6670' }}>
            Ravi Kumar · Assigned Area: <span style={{ color: '#2F6F7E', fontWeight: 500 }}>Dimapur District, Nagaland</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border"
            style={{ background: '#EAF4EE', borderColor: '#A8D4B8', color: '#2D6B4F' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Online · Field data synced
          </span>
          <button onClick={() => setPage?.('fo-report')}
            className="text-xs px-3 py-1.5 rounded border font-medium transition-colors"
            style={{ background: '#17324D', color: 'white', borderColor: '#17324D' }}>
            + Report Incident
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg" style={{ color: kpi.color }}>{kpi.icon}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: kpi.color + '18', color: kpi.color }}>
                {kpi.sub}
              </span>
            </div>
            <div className="text-3xl font-bold leading-none mb-1" style={{ color: '#17212B' }}>{kpi.value}</div>
            <div className="text-xs font-medium" style={{ color: '#5A6670' }}>{kpi.label}</div>
          </Card>
        ))}
      </div>

      {/* Row: Area situation + Nearby incidents */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Current Area Situation */}
        <Card className="xl:col-span-1">
          <div className="px-4 py-3 border-b" style={{ borderColor: BORDER }}>
            <div className="text-xs uppercase tracking-widest" style={{ color: '#8A9098', fontSize: 10 }}>Area Status</div>
            <h2 className="font-semibold text-base" style={{ color: '#17212B' }}>Dimapur District</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs mb-1" style={{ color: '#8A9098' }}>Accessibility Score</div>
                <AccessibilityBadge score={72} />
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: '#8A9098' }}>Risk Level</div>
                <SeverityBadge severity="HIGH" />
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: '#8A9098' }}>Nearby Incidents</div>
                <div className="text-xl font-bold" style={{ color: '#17212B' }}>04</div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: '#8A9098' }}>Weather</div>
                <div className="text-sm font-medium" style={{ color: '#17212B' }}>Heavy Rain ☂</div>
              </div>
            </div>

            {/* Accessibility bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1" style={{ color: '#5A6670' }}>
                <span>Route accessibility</span><span className="font-semibold">72 / 100</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: BORDER }}>
                <div className="h-full rounded-full" style={{ width: '72%', background: '#C25A1A' }} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs" style={{ color: '#8A9098' }}>
              <span>Last updated: 2 min ago</span>
              <button className="font-medium" style={{ color: '#2F6F7E' }}>Refresh ↻</button>
            </div>
          </div>
        </Card>

        {/* Nearby Incidents */}
        <Card className="xl:col-span-2 flex flex-col">
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: BORDER }}>
            <div>
              <h2 className="font-semibold text-base" style={{ color: '#17212B' }}>Nearby Incidents</h2>
              <p className="text-xs" style={{ color: '#8A9098' }}>Within your assigned area</p>
            </div>
            <button onClick={() => setPage?.('fo-alerts')}
              className="text-xs font-medium px-3 py-1.5 rounded border transition-colors"
              style={{ borderColor: BORDER, color: '#2F6F7E' }}>
              View All Incidents →
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: SURFACE_2 }}>
            {nearbyIncidents.map((inc, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-4 transition-colors hover:bg-black/[0.02]">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: SURFACE_2, color: '#17324D' }}>
                  {inc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: '#17212B' }}>{inc.type}</span>
                    <span className="text-xs" style={{ color: '#8A9098' }}>· {inc.distance}</span>
                  </div>
                  <div className="text-xs" style={{ color: '#5A6670' }}>{inc.location} · {inc.time}</div>
                </div>
                <SeverityBadge severity={inc.severity} />
                <StatusBadge status={inc.status} />
                <button className="text-xs font-medium" style={{ color: '#2F6F7E' }}>View →</button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* My Priority Tasks */}
      <Card>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: BORDER }}>
          <div>
            <h2 className="font-semibold text-base" style={{ color: '#17212B' }}>My Priority Tasks</h2>
            <p className="text-xs" style={{ color: '#8A9098' }}>Sorted by priority and due time</p>
          </div>
          <button onClick={() => setPage?.('fo-tasks')}
            className="text-xs font-medium px-3 py-1.5 rounded border transition-colors"
            style={{ borderColor: BORDER, color: '#2F6F7E' }}>
            View My Tasks →
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          {priorityTasks.map(task => {
            const state = startedTasks[task.id];
            return (
              <div key={task.id} className="rounded-lg border p-4 flex flex-col transition-all"
                style={{ background: SURFACE_2, borderColor: BORDER }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold" style={{ color: '#2F6F7E' }}>#{task.id}</span>
                  <SeverityBadge severity={task.priority} />
                </div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: '#17212B' }}>{task.title}</h3>
                <div className="space-y-1 text-xs mb-3 flex-1" style={{ color: '#5A6670' }}>
                  <div><span style={{ color: '#8A9098' }}>Location:</span> {task.location}</div>
                  <div><span style={{ color: '#8A9098' }}>Due:</span> {task.due}</div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span style={{ color: '#8A9098' }}>Status:</span>
                    <StatusBadge status={task.status} />
                  </div>
                </div>
                <button
                  onClick={() => startTask(task.id)}
                  disabled={!!state}
                  className="w-full text-xs font-medium px-3 py-2 rounded transition-all"
                  style={{
                    background: state === 'started' ? '#EAF4EE' : '#17324D',
                    color: state === 'started' ? '#2D6B4F' : 'white',
                    minHeight: 44,
                  }}>
                  {state === 'starting' ? 'Starting…' : state === 'started' ? 'Task Started ✓' : 'Start Task'}
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: BORDER }}>
          <div>
            <h2 className="font-semibold text-base" style={{ color: '#17212B' }}>Quick Actions</h2>
            <p className="text-xs" style={{ color: '#8A9098' }}>Report a field incident directly</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded border" style={{ borderColor: '#F5CDA8', background: '#FEF1E6', color: '#C25A1A' }}>
            Primary Operation
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
          {quickActions.map(action => (
            <button key={action.label} onClick={() => setPage?.('fo-report')}
              className="rounded-lg border p-4 flex flex-col items-center gap-2 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: SURFACE_2, borderColor: BORDER, minHeight: 44 }}>
              <span className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                style={{ background: action.color + '18', color: action.color }}>
                {action.icon}
              </span>
              <span className="text-xs font-medium" style={{ color: '#17212B' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
