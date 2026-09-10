import { useState } from 'react';
import { SeverityBadge, StatusBadge, AccessibilityBadge } from '@/components/StatusBadge';
import { routes } from '@/data/demo';
import { Card, CardHeader, PageHeader, BORDER, SURFACE_2, NAVY, TEAL } from './ui';

export default function RouteStatus() {
  const [open, setOpen] = useState<string | null>(null);
  const active = routes.find(r => r.id === open);

  return (
    <div className="space-y-6 max-w-screen-2xl">
      <PageHeader title="Route Status" sub="Accessibility and risk for routes in your assigned area" />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {routes.map(r => (
          <Card key={r.id} className="p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md" style={{}}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold text-sm" style={{ color: '#17212B' }}>{r.id}</div>
                <div className="text-xs" style={{ color: '#8A9098' }}>{r.name}</div>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div className="flex items-center justify-between my-3">
              <AccessibilityBadge score={r.accessibilityScore} />
              <SeverityBadge severity={r.floodRisk} />
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: BORDER }}>
              <div className="h-full rounded-full" style={{ width: `${r.accessibilityScore}%`,
                background: r.accessibilityScore > 75 ? '#BE2424' : r.accessibilityScore > 50 ? '#C25A1A' : r.accessibilityScore > 25 ? '#C4861A' : '#2D6B4F' }} />
            </div>
            <div className="flex items-center justify-between text-xs" style={{ color: '#8A9098' }}>
              <span>{r.weather} · {r.incidents} incident(s)</span>
              <button onClick={() => setOpen(r.id)} className="font-medium" style={{ color: TEAL }}>Details →</button>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail drawer */}
      {active && (
        <div className="fixed inset-0 z-40 flex justify-end" style={{ background: 'rgba(23,33,43,0.35)' }} onClick={() => setOpen(null)}>
          <div className="h-full w-full max-w-md overflow-y-auto shadow-xl animate-[slideIn_.25s_ease]"
            style={{ background: 'rgba(250,247,240,0.97)', backdropFilter: 'blur(12px)' }} onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: BORDER }}>
              <div>
                <div className="font-semibold text-base" style={{ color: '#17212B' }}>{active.id}</div>
                <div className="text-xs" style={{ color: '#8A9098' }}>{active.name}</div>
              </div>
              <button onClick={() => setOpen(null)} className="w-8 h-8 rounded" style={{ color: '#5A6670' }}>✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-lg border overflow-hidden" style={{ borderColor: BORDER, height: 140,
                background: 'linear-gradient(135deg,#D0956A,#DFCBA8 45%,#BFD0C0)' }}>
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(250,247,240,0.85)', color: NAVY }}>◉ Route map — {active.distance}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Accessibility', <AccessibilityBadge score={active.accessibilityScore} />],
                  ['Condition', <StatusBadge status={active.status} />],
                  ['Flood Risk', <SeverityBadge severity={active.floodRisk} />],
                  ['Landslide Risk', <SeverityBadge severity={active.landslideRisk} />],
                ].map(([k, v], i) => (
                  <div key={i} className="rounded-lg border p-3" style={{ background: SURFACE_2, borderColor: BORDER }}>
                    <div className="text-xs mb-1.5" style={{ color: '#8A9098' }}>{k as string}</div>{v}
                  </div>
                ))}
              </div>
              <div className="rounded-lg border p-3 text-sm" style={{ background: SURFACE_2, borderColor: BORDER }}>
                <div className="text-xs mb-1" style={{ color: '#8A9098' }}>Weather · ETA · Delay</div>
                <div style={{ color: '#17212B' }}>{active.weather} · {active.eta} · {active.delay}</div>
              </div>
              <div className="rounded-lg border p-3" style={{ background: '#FEF8E6', borderColor: '#F5DFA8' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: '#C4861A' }}>✦ Recommended Action</div>
                <p className="text-xs" style={{ color: '#5A6670' }}>
                  {active.accessibilityScore > 60 ? 'Inspect the affected section and identify an alternate access route before advising convoys.' : 'Route currently viable — continue routine monitoring and report any change.'}
                </p>
              </div>
              <div className="text-xs" style={{ color: '#8A9098' }}>Last updated: {active.lastUpdated}</div>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes slideIn{from{transform:translateX(20px);opacity:.6}to{transform:translateX(0);opacity:1}}`}</style>
    </div>
  );
}
