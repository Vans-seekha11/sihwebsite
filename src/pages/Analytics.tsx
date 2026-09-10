const incidentTrend = [14, 18, 22, 19, 16, 24, 21, 27, 24];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Today'];
const routeAccessibility = [
  { name: 'NH-27', accessible: 18, restricted: 82 },
  { name: 'NH-2', accessible: 52, restricted: 48 },
  { name: 'NH-306', accessible: 45, restricted: 55 },
  { name: 'NH-6', accessible: 39, restricted: 61 },
  { name: 'NH-40', accessible: 78, restricted: 22 },
];
const responseTime = [55, 48, 62, 44, 38, 52, 42, 45, 42];
const riskTrend = [42, 48, 55, 62, 58, 65, 72, 68, 74];

function LineChart({ data, color, height = 80, label }: { data: number[]; color: string; height?: number; label?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 400; const h = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 8) - 4}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - ((v - min) / range) * (h - 8) - 4} r="3" fill={color} />
      ))}
    </svg>
  );
}

function BarChart({ data, colors }: { data: { name: string; accessible: number; restricted: number }[]; colors: string[] }) {
  return (
    <div className="space-y-2">
      {data.map(d => (
        <div key={d.name}>
          <div className="flex justify-between text-xs mb-0.5" style={{ color: '#5A6670' }}>
            <span className="font-medium" style={{ color: '#17212B' }}>{d.name}</span>
            <span>{d.accessible}% accessible</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex" style={{ background: 'rgba(180,162,136,0.55)' }}>
            <div style={{ width: `${d.accessible}%`, background: colors[0] }} className="h-full" />
            <div style={{ width: `${d.restricted}%`, background: colors[1] }} className="h-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border shadow-sm p-4" style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
      <h3 className="font-semibold text-sm mb-0.5" style={{ color: '#17212B' }}>{title}</h3>
      {subtitle && <p className="text-xs mb-3" style={{ color: '#8A9098' }}>{subtitle}</p>}
      {children}
    </div>
  );
}

export default function Analytics() {
  return (
    <div className="space-y-5 max-w-screen-2xl">
      <div>
        <h1 className="font-semibold text-2xl" style={{ color: '#17212B' }}>Analytics</h1>
        <p className="text-sm mt-0.5" style={{ color: '#5A6670' }}>Decision-focused district performance analytics — DEMO DATA</p>
      </div>

      {/* Performance summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Incidents (7d)', value: '24', delta: '+14%', up: true },
          { label: 'Avg Response Time', value: '42m', delta: '+8m target', up: true },
          { label: 'Route Accessibility', value: '52%', delta: '-8% week', up: true },
          { label: 'Logistics On-Time', value: '68%', delta: '-5% week', up: true },
          { label: 'Unresolved >24h', value: '7', delta: '+3 week', up: true },
        ].map(k => (
          <div key={k.label} className="rounded-xl border p-3 shadow-sm" style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
            <div className="text-2xl font-bold" style={{ color: '#17212B' }}>{k.value}</div>
            <div className="text-xs font-medium mt-0.5" style={{ color: '#5A6670' }}>{k.label}</div>
            <div className="text-xs mt-1" style={{ color: '#C25A1A' }}>▲ {k.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Incident Trend" subtitle="Incidents reported over the last 9 days">
          <LineChart data={incidentTrend} color="#17324D" />
          <div className="flex justify-between mt-1">
            {days.map((d, i) => (
              <span key={i} className="text-xs" style={{ color: '#8A9098' }}>{d}</span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Route Accessibility" subtitle="Accessible vs restricted by route">
          <BarChart
            data={routeAccessibility}
            colors={['#2D6B4F', '#E07840']}
          />
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#5A6670' }}>
              <div className="w-3 h-3 rounded-sm" style={{ background: '#2D6B4F' }} />Accessible
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#5A6670' }}>
              <div className="w-3 h-3 rounded-sm" style={{ background: '#E07840' }} />Restricted
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Average Response Time (minutes)" subtitle="Target: 35 minutes">
          <div className="relative">
            <LineChart data={responseTime} color="#2F6F7E" />
            <div className="absolute inset-0 flex items-center pointer-events-none">
              <div className="w-full border-dashed border-t-2" style={{ borderColor: '#D7A73A', opacity: 0.6 }} />
            </div>
          </div>
          <div className="flex justify-between mt-1">
            {days.map((d, i) => (
              <span key={i} className="text-xs" style={{ color: '#8A9098' }}>{d}</span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs mt-2" style={{ color: '#8A9098' }}>
            <div className="w-6 border-dashed border-t-2" style={{ borderColor: '#D7A73A' }} />
            35-minute target
          </div>
        </ChartCard>

        <ChartCard title="District Risk Score Trend" subtitle="Composite risk score over time">
          <LineChart data={riskTrend} color="#BE2424" />
          <div className="flex justify-between mt-1">
            {days.map((d, i) => (
              <span key={i} className="text-xs" style={{ color: '#8A9098' }}>{d}</span>
            ))}
          </div>
          <div className="mt-3 rounded p-2 text-xs" style={{ background: '#FEE9E9', color: '#BE2424' }}>
            ▲ Risk trend increasing — 74/100 today vs 42/100 last Monday. Monsoon season contributing factor.
          </div>
        </ChartCard>
      </div>

      {/* District performance table */}
      <div className="rounded-xl border shadow-sm overflow-hidden" style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(180,162,136,0.55)', background: 'rgba(238,228,210,0.88)' }}>
          <h2 className="font-semibold text-base" style={{ color: '#17212B' }}>District Performance Comparison — DEMO DATA</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(243,235,220,0.55)' }}>
                {['District', 'State', 'Incidents', 'Avg Response', 'Route Access', 'Logistics Delays', 'Unresolved'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#5A6670' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { district: 'Kamrup Metro', state: 'Assam', incidents: 24, response: '42m', access: '52%', delays: '32%', unresolved: 7 },
                { district: 'Kohima', state: 'Nagaland', incidents: 18, response: '38m', access: '61%', delays: '24%', unresolved: 4 },
                { district: 'Aizawl', state: 'Mizoram', incidents: 12, response: '55m', access: '44%', delays: '41%', unresolved: 6 },
                { district: 'East Khasi Hills', state: 'Meghalaya', incidents: 8, response: '31m', access: '72%', delays: '18%', unresolved: 2 },
                { district: 'Tawang', state: 'Arunachal Pradesh', incidents: 6, response: '68m', access: '28%', delays: '72%', unresolved: 5 },
              ].map((row, i) => (
                <tr key={row.district} style={{ background: i % 2 === 0 ? 'rgba(250,247,240,0.82)' : 'rgba(243,235,220,0.55)' }}>
                  <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: '#17212B' }}>{row.district}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#5A6670' }}>{row.state}</td>
                  <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: row.incidents > 20 ? '#BE2424' : '#17212B' }}>{row.incidents}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: parseInt(row.response) > 45 ? '#BE2424' : '#2D6B4F' }}>{row.response}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: parseInt(row.access) < 50 ? '#C25A1A' : '#2D6B4F' }}>{row.access}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: parseInt(row.delays) > 40 ? '#BE2424' : '#17212B' }}>{row.delays}</td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-center" style={{ color: row.unresolved > 5 ? '#BE2424' : '#17212B' }}>{row.unresolved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
