import { useState } from 'react';
import { SeverityBadge, StatusBadge } from '@/components/StatusBadge';
import type { Severity } from '@/data/demo';
import { Card, PageHeader, BORDER, SURFACE, SURFACE_2, TEAL } from './ui';

type Life = 'Assigned' | 'Accepted' | 'In Progress' | 'Completed' | 'Verified';

interface FOTask {
  id: string; title: string; location: string; priority: Severity;
  assigned: string; due: string; status: Life;
}

const SEED: FOTask[] = [
  { id: 'FO-1024', title: 'Inspect flooded road section', location: 'Dimapur–Kohima Route (NH-29)', priority: 'CRITICAL', assigned: 'Today, 10:05 AM', due: 'Today, 4:30 PM', status: 'Assigned' },
  { id: 'FO-1021', title: 'Verify landslide clearance progress', location: 'Zubza Ghat, Km 34', priority: 'HIGH', assigned: 'Today, 08:40 AM', due: 'Today, 6:00 PM', status: 'In Progress' },
  { id: 'FO-1019', title: 'Confirm bridge load capacity', location: 'Chumukedima Bypass', priority: 'MODERATE', assigned: 'Today, 07:15 AM', due: 'Tomorrow, 10:00 AM', status: 'Accepted' },
  { id: 'FO-1015', title: 'Monitor water level markers', location: 'Dhansiri River crossing', priority: 'HIGH', assigned: 'Yesterday, 5:00 PM', due: 'Yesterday, 8:00 PM', status: 'Completed' },
  { id: 'FO-1012', title: 'Photograph culvert damage', location: 'Local Route 04', priority: 'MODERATE', assigned: 'Yesterday, 2:00 PM', due: 'Yesterday, 4:00 PM', status: 'Verified' },
  { id: 'FO-1009', title: 'Road condition survey — NH-29 Km 12', location: 'NH-29, Km 12', priority: 'LOW', assigned: '2 days ago', due: 'Yesterday, 12:00 PM', status: 'Assigned' },
];

const TABS = ['All', 'Pending', 'In Progress', 'Completed', 'Overdue'] as const;
const NEXT: Record<Life, Life | null> = { Assigned: 'Accepted', Accepted: 'In Progress', 'In Progress': 'Completed', Completed: 'Verified', Verified: null };
const ACTION_LABEL: Record<Life, string> = { Assigned: 'Accept Task', Accepted: 'Start Task', 'In Progress': 'Complete Task', Completed: 'Awaiting Verification', Verified: 'Verified' };

export default function MyTasks() {
  const [tab, setTab] = useState<typeof TABS[number]>('All');
  const [tasks, setTasks] = useState(SEED);
  const [busy, setBusy] = useState<string | null>(null);

  const advance = (id: string) => {
    const t = tasks.find(x => x.id === id);
    if (!t || !NEXT[t.status]) return;
    setBusy(id);
    setTimeout(() => {
      setTasks(ts => ts.map(x => x.id === id ? { ...x, status: NEXT[x.status]! } : x));
      setBusy(null);
    }, 800);
  };

  const filtered = tasks.filter(t => {
    if (tab === 'All') return true;
    if (tab === 'Pending') return t.status === 'Assigned' || t.status === 'Accepted';
    if (tab === 'In Progress') return t.status === 'In Progress';
    if (tab === 'Completed') return t.status === 'Completed' || t.status === 'Verified';
    if (tab === 'Overdue') return t.due.startsWith('Yesterday') && t.status !== 'Completed' && t.status !== 'Verified';
    return true;
  });

  return (
    <div className="space-y-6 max-w-screen-2xl">
      <PageHeader title="My Tasks" sub="Field tasks assigned to you · Ravi Kumar · Dimapur District" />

      {/* Tabs */}
      <div className="flex gap-1 border-b overflow-x-auto" style={{ borderColor: BORDER }}>
        {TABS.map(t => {
          const active = tab === t;
          const count = t === 'All' ? tasks.length : tasks.filter(x =>
            t === 'Pending' ? (x.status === 'Assigned' || x.status === 'Accepted') :
            t === 'In Progress' ? x.status === 'In Progress' :
            t === 'Completed' ? (x.status === 'Completed' || x.status === 'Verified') :
            x.due.startsWith('Yesterday') && x.status !== 'Completed' && x.status !== 'Verified'
          ).length;
          return (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 text-sm font-medium transition-all whitespace-nowrap"
              style={{
                color: active ? '#17212B' : '#8A9098',
                borderBottom: `2px solid ${active ? TEAL : 'transparent'}`,
                marginBottom: -1,
              }}>
              {t} <span className="text-xs" style={{ color: '#8A9098' }}>({count})</span>
            </button>
          );
        })}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: SURFACE_2 }}>
                {['Task ID', 'Task', 'Location', 'Priority', 'Assigned', 'Due', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A6670' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} className="transition-colors" style={{ background: i % 2 === 0 ? SURFACE : 'rgba(243,235,220,0.55)' }}>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: TEAL }}>#{t.id}</td>
                  <td className="px-4 py-2.5 text-xs font-medium" style={{ color: '#17212B' }}>{t.title}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#5A6670' }}>{t.location}</td>
                  <td className="px-4 py-2.5"><SeverityBadge severity={t.priority} /></td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#8A9098' }}>{t.assigned}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#8A9098' }}>{t.due}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-2.5">
                    {NEXT[t.status] ? (
                      <button onClick={() => advance(t.id)} disabled={busy === t.id}
                        className="text-xs font-medium px-2.5 py-1 rounded border transition-all disabled:opacity-60"
                        style={{ borderColor: BORDER, color: TEAL, minHeight: 32 }}>
                        {busy === t.id ? 'Updating…' : ACTION_LABEL[t.status]}
                      </button>
                    ) : (
                      <span className="text-xs" style={{ color: '#2D6B4F' }}>✓ {ACTION_LABEL[t.status]}</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm" style={{ color: '#8A9098' }}>No tasks in this view.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
