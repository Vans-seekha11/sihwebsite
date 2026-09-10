import { useState } from 'react';
import { SeverityBadge } from '@/components/StatusBadge';
import { alerts as ALL } from '@/data/demo';
import type { Severity } from '@/data/demo';
import { Card, PageHeader, BORDER, SURFACE_2, NAVY, TEAL } from './ui';

const TABS: { key: string; sev?: Severity }[] = [
  { key: 'Critical', sev: 'CRITICAL' },
  { key: 'High', sev: 'HIGH' },
  { key: 'Moderate', sev: 'MODERATE' },
  { key: 'Information', sev: 'LOW' },
];

const REC: Record<string, string> = {
  Flood: 'Avoid affected section and inspect alternate access route.',
  Infrastructure: 'Do not permit heavy vehicles. Await structural assessment.',
  'Logistics Delay': 'Notify convoys and coordinate rerouting where possible.',
  Escalation: 'Report current on-site status to the District Officer.',
  'AI Warning': 'Increase monitoring frequency on the flagged section.',
  'Route Closure': 'Redirect any inbound field movement to alternate routes.',
};

export default function Alerts() {
  const [tab, setTab] = useState('Critical');
  const [ack, setAck] = useState<Record<string, 'busy' | 'done'>>({});

  const acknowledge = (id: string) => {
    setAck(a => ({ ...a, [id]: 'busy' }));
    setTimeout(() => setAck(a => ({ ...a, [id]: 'done' })), 900);
  };

  const sev = TABS.find(t => t.key === tab)?.sev;
  const list = ALL.filter(a => a.severity === sev);

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Alerts" sub="Operational alerts for your assigned area" />

      <div className="flex gap-1 border-b overflow-x-auto" style={{ borderColor: BORDER }}>
        {TABS.map(t => {
          const n = ALL.filter(a => a.severity === t.sev).length;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-4 py-2 text-sm font-medium whitespace-nowrap transition-all"
              style={{ color: active ? '#17212B' : '#8A9098', borderBottom: `2px solid ${active ? TEAL : 'transparent'}`, marginBottom: -1 }}>
              {t.key} <span className="text-xs" style={{ color: '#8A9098' }}>({n})</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {list.map(a => {
          const state = ack[a.id];
          const critical = a.severity === 'CRITICAL';
          return (
            <Card key={a.id} className="p-4" style={critical ? { borderColor: '#F5B8B8', borderLeftWidth: 4, borderLeftColor: '#BE2424' } : undefined}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <SeverityBadge severity={a.severity} />
                    <span className="text-xs" style={{ color: '#8A9098' }}>{a.category} · {a.time}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: '#17212B' }}>{a.title}</h3>
                  <div className="text-xs mb-2" style={{ color: '#5A6670' }}>{a.location} · {a.description}</div>
                  <div className="rounded-lg border p-2.5 mb-3" style={{ background: SURFACE_2, borderColor: BORDER }}>
                    <span className="text-xs font-semibold" style={{ color: '#C4861A' }}>Recommended Action: </span>
                    <span className="text-xs" style={{ color: '#5A6670' }}>{REC[a.category] ?? 'Review and respond per field protocol.'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs font-medium px-3 py-2 rounded border" style={{ borderColor: BORDER, color: TEAL, minHeight: 40 }}>View Incident</button>
                    <button onClick={() => acknowledge(a.id)} disabled={!!state}
                      className="text-xs font-medium px-3 py-2 rounded transition-all disabled:opacity-70"
                      style={{ background: state === 'done' ? '#EAF4EE' : NAVY, color: state === 'done' ? '#2D6B4F' : 'white', minHeight: 40 }}>
                      {state === 'busy' ? 'Acknowledging…' : state === 'done' ? 'Acknowledged ✓' : 'Acknowledge'}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {list.length === 0 && (
          <Card className="p-10 text-center"><span className="text-sm" style={{ color: '#8A9098' }}>No {tab.toLowerCase()} alerts.</span></Card>
        )}
      </div>
    </div>
  );
}
