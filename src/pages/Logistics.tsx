import { SeverityBadge, StatusBadge } from '@/components/StatusBadge';
import { vehicles } from '@/data/demo';
import MapViz from '@/components/MapViz';
import { routes } from '@/data/demo';

const kpis = [
  { label: 'Active Vehicles', value: vehicles.filter(v => v.status !== 'Stopped').length, color: '#2F6F7E', bg: '#E6F0F4' },
  { label: 'Delayed Vehicles', value: vehicles.filter(v => v.status === 'Delayed' || v.status === 'At Risk').length, color: '#C4861A', bg: '#FEF8E6' },
  { label: 'At-Risk Shipments', value: vehicles.filter(v => v.risk === 'CRITICAL' || v.risk === 'HIGH').length, color: '#C25A1A', bg: '#FEF1E6' },
  { label: 'Stopped', value: vehicles.filter(v => v.status === 'Stopped').length, color: '#BE2424', bg: '#FEE9E9' },
];

export default function Logistics() {
  return (
    <div className="space-y-5 max-w-screen-2xl">
      <div>
        <h1 className="font-semibold text-2xl" style={{ color: '#17212B' }}>Logistics</h1>
        <p className="text-sm mt-0.5" style={{ color: '#5A6670' }}>District logistics monitoring and convoy management</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl border p-4 shadow-sm"
            style={{ background: k.bg, borderColor: 'rgba(180,162,136,0.55)' }}>
            <div className="text-3xl font-bold" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs font-medium mt-1" style={{ color: k.color }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 rounded-xl border shadow-sm overflow-hidden"
          style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(180,162,136,0.55)' }}>
            <h2 className="font-semibold text-base" style={{ color: '#17212B' }}>Active Convoys — District Map</h2>
          </div>
          <MapViz incidents={[]} routes={routes} vehicles={vehicles} height={340} showLegend={false} />
        </div>

        <div className="rounded-xl border shadow-sm" style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(180,162,136,0.55)' }}>
            <h2 className="font-semibold text-base" style={{ color: '#17212B' }}>At-Risk Convoys</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(238,228,210,0.88)' }}>
            {vehicles.filter(v => v.risk === 'CRITICAL' || v.risk === 'HIGH').map(v => (
              <div key={v.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold" style={{ color: '#2F6F7E' }}>{v.id}</span>
                  <SeverityBadge severity={v.risk} />
                </div>
                <div className="text-xs font-medium mb-0.5" style={{ color: '#17212B' }}>{v.cargo}</div>
                <div className="text-xs mb-1" style={{ color: '#5A6670' }}>{v.currentLocation} → {v.destination}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#8A9098' }}>{v.route} · ETA {v.eta}</span>
                  <span className="text-xs font-semibold" style={{ color: '#BE2424' }}>{v.delay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border shadow-sm overflow-hidden" style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(180,162,136,0.55)', background: 'rgba(238,228,210,0.88)' }}>
          <h2 className="font-semibold text-base" style={{ color: '#17212B' }}>Logistics Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(243,235,220,0.55)' }}>
                {['Vehicle ID', 'Cargo', 'Origin', 'Destination', 'Current Location', 'Route', 'ETA', 'Delay', 'Risk', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: '#5A6670' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v, i) => (
                <tr key={v.id} style={{ background: i % 2 === 0 ? 'rgba(250,247,240,0.82)' : 'rgba(243,235,220,0.55)' }}>
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold" style={{ color: '#2F6F7E' }}>{v.id}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#17212B' }}>{v.cargo}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#5A6670' }}>{v.origin}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#5A6670' }}>{v.destination}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#17212B' }}>{v.currentLocation}</td>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#2F6F7E' }}>{v.route}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#17212B' }}>{v.eta}</td>
                  <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: v.delay === 'None' || v.delay === '+15m' ? '#2D6B4F' : '#C25A1A' }}>{v.delay}</td>
                  <td className="px-4 py-2.5"><SeverityBadge severity={v.risk} /></td>
                  <td className="px-4 py-2.5"><StatusBadge status={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
