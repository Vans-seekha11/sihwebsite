import { useState } from 'react';
import { Card, CardHeader, PageHeader, BORDER, SURFACE_2, NAVY, TEAL } from './ui';

const REPORTS = [
  { id: 'RPT-2041', type: 'Incident Report', title: 'Flood — NH-29 Dimapur section', date: 'Today, 12:10 PM', status: 'Submitted' },
  { id: 'RPT-2038', type: 'Route Inspection', title: 'Zubza Ghat landslide clearance check', date: 'Today, 09:20 AM', status: 'Submitted' },
  { id: 'RPT-2035', type: 'Task Completion', title: 'Water level monitoring — Dhansiri', date: 'Yesterday, 8:05 PM', status: 'Verified' },
  { id: 'RPT-2030', type: 'Logistics Observation', title: 'Convoy LG-102 delay note — NH-2', date: 'Yesterday, 3:40 PM', status: 'Verified' },
  { id: 'RPT-2026', type: 'Daily Activity', title: 'Field activity report — 08 Sep', date: '2 days ago', status: 'Verified' },
];

const SUMMARY = [
  { l: 'Incident Reports', v: '12' },
  { l: 'Tasks Completed', v: '38' },
  { l: 'Route Inspections', v: '21' },
  { l: 'Logistics Observations', v: '09' },
];

export default function Reports() {
  const [gen, setGen] = useState<'idle' | 'busy' | 'done'>('idle');
  const generate = () => { setGen('busy'); setTimeout(() => setGen('done'), 1300); };

  return (
    <div className="space-y-6 max-w-screen-2xl">
      <PageHeader title="Reports" sub="Your field reporting activity"
        right={
          <button onClick={generate} disabled={gen === 'busy'}
            className="text-xs font-medium px-3 py-2 rounded transition-all disabled:opacity-70"
            style={{ background: NAVY, color: 'white', minHeight: 44 }}>
            {gen === 'busy' ? 'Generating…' : gen === 'done' ? 'Daily Report Ready ✓' : '+ Generate Report'}
          </button>
        } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY.map(s => (
          <Card key={s.l} className="p-4">
            <div className="text-3xl font-bold leading-none mb-1" style={{ color: '#17212B' }}>{s.v}</div>
            <div className="text-xs font-medium" style={{ color: '#5A6670' }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Recent Reports" sub="View or download submitted field reports" />
        <div className="divide-y" style={{ borderColor: SURFACE_2 }}>
          {REPORTS.map(r => (
            <div key={r.id} className="px-4 py-3 flex items-center gap-4 transition-colors hover:bg-black/[0.02]">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: SURFACE_2, color: NAVY }}>⊡</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: '#17212B' }}>{r.title}</div>
                <div className="text-xs" style={{ color: '#8A9098' }}>
                  <span className="font-mono">{r.id}</span> · {r.type} · {r.date}
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded border" style={{ background: '#EAF4EE', borderColor: '#A8D4B8', color: '#2D6B4F' }}>{r.status}</span>
              <button className="text-xs font-medium" style={{ color: TEAL }}>View</button>
              <button className="text-xs font-medium" style={{ color: TEAL }}>Download ↓</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
