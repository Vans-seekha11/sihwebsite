import MapViz from '@/components/MapViz';
import { SeverityBadge, StatusBadge } from '@/components/StatusBadge';
import { incidents, routes, vehicles, alerts, aiInsights } from '@/data/demo';

const kpis = [
  { label: 'Active Incidents', value: '24', icon: '◆', change: '+3 vs yesterday', changeUp: true, color: '#BE2424' },
  { label: 'Blocked Routes', value: '07', icon: '→', change: '+2 today', changeUp: true, color: '#C25A1A' },
  { label: 'High-Risk Routes', value: '12', icon: '▲', change: 'Same as yesterday', changeUp: false, color: '#C4861A' },
  { label: 'Active Logistics', value: '86', icon: '⊟', change: '-4 vs yesterday', changeUp: false, color: '#2F6F7E' },
  { label: 'Pending Reports', value: '18', icon: '⊡', change: '+6 new', changeUp: true, color: '#17324D' },
  { label: 'Avg Response Time', value: '42m', icon: '◷', change: '+8m vs target', changeUp: true, color: '#C4861A' },
];

export default function Dashboard({ setPage }: { setPage: (p: string) => void }) {
  const pendingIncidents = incidents.filter(i => i.status === 'PENDING_VERIFICATION');
  const activeIncidents = incidents.filter(i => i.status === 'ACTIVE' || i.status === 'ESCALATED');
  const criticalAlerts = alerts.filter(a => !a.acknowledged && a.severity === 'CRITICAL');
  const highAlerts = alerts.filter(a => !a.acknowledged && a.severity === 'HIGH');

  return (
    <div className="space-y-6 max-w-screen-2xl">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-semibold text-2xl" style={{ color: '#17212B' }}>District Operations</h1>
          <p className="text-sm mt-0.5" style={{ color: '#5A6670' }}>
            Real-time district connectivity, logistics and incident intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border"
            style={{ background: '#EAF4EE', borderColor: '#A8D4B8', color: '#2D6B4F' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
            DEMO DATA — Live Monitoring Active
          </span>
          <button className="text-xs px-3 py-1.5 rounded border font-medium transition-colors"
            style={{ background: '#17324D', color: 'white', borderColor: '#17324D' }}>
            Generate Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="rounded-xl border p-4 shadow-sm"
            style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg" style={{ color: kpi.color }}>{kpi.icon}</span>
              <span className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: kpi.color + '18', color: kpi.color }}>
                {kpi.changeUp ? '▲' : '▼'}
              </span>
            </div>
            <div className="text-3xl font-bold leading-none mb-1" style={{ color: '#17212B' }}>{kpi.value}</div>
            <div className="text-xs font-medium mb-1" style={{ color: '#5A6670' }}>{kpi.label}</div>
            <div className="text-xs" style={{ color: '#8A9098' }}>{kpi.change}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Map — spans 2 cols */}
        <div className="xl:col-span-2 rounded-xl border shadow-sm overflow-hidden"
          style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
          <div className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(180,162,136,0.55)' }}>
            <div>
              <h2 className="font-semibold text-base" style={{ color: '#17212B' }}>District Map</h2>
              <p className="text-xs" style={{ color: '#8A9098' }}>Live incident and route status</p>
            </div>
            <button onClick={() => setPage('map')}
              className="text-xs font-medium px-3 py-1.5 rounded border transition-colors"
              style={{ borderColor: 'rgba(180,162,136,0.55)', color: '#2F6F7E' }}>
              Full Map →
            </button>
          </div>
          <MapViz incidents={incidents} routes={routes} vehicles={vehicles} height={380} />
        </div>

        {/* Critical Alerts panel */}
        <div className="rounded-xl border shadow-sm flex flex-col"
          style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
          <div className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(180,162,136,0.55)' }}>
            <div>
              <h2 className="font-semibold text-base" style={{ color: '#17212B' }}>Critical Alerts</h2>
              <p className="text-xs" style={{ color: '#8A9098' }}>{criticalAlerts.length + highAlerts.length} unacknowledged</p>
            </div>
            <button onClick={() => setPage('alerts')}
              className="text-xs font-medium px-3 py-1.5 rounded border transition-colors"
              style={{ borderColor: 'rgba(180,162,136,0.55)', color: '#2F6F7E' }}>
              View All
            </button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: 'rgba(238,228,210,0.88)' }}>
            {alerts.filter(a => !a.acknowledged).map(alert => (
              <div key={alert.id} className="px-4 py-3">
                <div className="flex items-start gap-2 mb-1">
                  <SeverityBadge severity={alert.severity} />
                  <span className="text-xs font-medium flex-1" style={{ color: '#17212B' }}>{alert.title}</span>
                </div>
                <div className="text-xs mb-1" style={{ color: '#5A6670' }}>{alert.location}</div>
                <div className="text-xs" style={{ color: '#8A9098' }}>{alert.time} · {alert.source}</div>
                <div className="flex gap-2 mt-2">
                  <button className="text-xs px-2 py-1 rounded border"
                    style={{ borderColor: 'rgba(180,162,136,0.55)', color: '#2F6F7E' }}>View</button>
                  <button className="text-xs px-2 py-1 rounded border"
                    style={{ borderColor: 'rgba(180,162,136,0.55)', color: '#5A6670' }}>Acknowledge</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Incident Queue */}
        <div className="lg:col-span-2 rounded-xl border shadow-sm"
          style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
          <div className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(180,162,136,0.55)' }}>
            <h2 className="font-semibold text-base" style={{ color: '#17212B' }}>Incident Queue</h2>
            <button onClick={() => setPage('incidents')}
              className="text-xs font-medium px-3 py-1.5 rounded border"
              style={{ borderColor: 'rgba(180,162,136,0.55)', color: '#2F6F7E' }}>
              Manage All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(238,228,210,0.88)' }}>
                  {['ID', 'Type', 'Location', 'Severity', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#5A6670' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incidents.slice(0, 5).map((inc, i) => (
                  <tr key={inc.id} style={{ background: i % 2 === 0 ? 'rgba(250,247,240,0.82)' : 'rgba(243,235,220,0.55)' }}>
                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#2F6F7E' }}>{inc.id}</td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: '#17212B' }}>{inc.type}</td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: '#5A6670' }}>{inc.location}</td>
                    <td className="px-4 py-2.5"><SeverityBadge severity={inc.severity} /></td>
                    <td className="px-4 py-2.5"><StatusBadge status={inc.status} /></td>
                    <td className="px-4 py-2.5">
                      <button className="text-xs font-medium" style={{ color: '#2F6F7E' }}>View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights snapshot */}
        <div className="rounded-xl border shadow-sm flex flex-col"
          style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
          <div className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(180,162,136,0.55)' }}>
            <div className="flex items-center gap-2">
              <span style={{ color: '#D7A73A' }}>✦</span>
              <h2 className="font-semibold text-base" style={{ color: '#17212B' }}>AI Insights</h2>
            </div>
            <button onClick={() => setPage('ai')} className="text-xs" style={{ color: '#2F6F7E' }}>View All →</button>
          </div>
          <div className="p-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#8A9098' }}>
              Risk Predictions
            </div>
            {aiInsights.riskPredictions.map(p => (
              <div key={p.route} className="rounded-lg p-3"
                style={{ background: 'rgba(238,228,210,0.88)', border: '1px solid rgba(180,162,136,0.55)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs" style={{ color: '#17212B' }}>{p.route}</span>
                  <span className="text-xs font-bold" style={{ color: '#BE2424' }}>{p.probability}%</span>
                </div>
                <div className="text-xs" style={{ color: '#5A6670' }}>
                  Disruption probability · {p.window}
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(180,162,136,0.55)' }}>
                  <div className="h-full rounded-full" style={{ width: `${p.probability}%`, background: p.probability > 80 ? '#BE2424' : p.probability > 60 ? '#E07840' : '#C4861A' }} />
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span style={{ color: '#D7A73A' }}>✦</span>
                  <span className="text-xs" style={{ color: '#8A9098' }}>AI-generated estimate · Confidence: {p.confidence}%</span>
                </div>
              </div>
            ))}
            {aiInsights.resourceRecommendations.slice(0, 1).map((rec, i) => (
              <div key={i} className="rounded-lg p-3 border" style={{ background: '#FEF8E6', borderColor: '#F5DFA8' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span style={{ color: '#D7A73A' }}>✦</span>
                  <span className="text-xs font-semibold" style={{ color: '#C4861A' }}>Resource Recommendation</span>
                </div>
                <p className="text-xs" style={{ color: '#5A6670' }}>{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
