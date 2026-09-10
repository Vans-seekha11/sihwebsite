import { SeverityBadge, StatusBadge } from '@/components/StatusBadge';
import { vehicles } from '@/data/demo';
import { Card, PageHeader, BORDER, SURFACE, SURFACE_2, TEAL } from './ui';

export default function Logistics() {
  return (
    <div className="space-y-6 max-w-screen-2xl">
      <PageHeader title="Logistics" sub="Shipments and vehicles moving through your assigned area" />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: SURFACE_2 }}>
                {['Vehicle', 'Cargo', 'Origin', 'Destination', 'Current Location', 'Route', 'Status', 'Risk', 'ETA'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A6670' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v, i) => (
                <tr key={v.id} className="transition-colors" style={{ background: i % 2 === 0 ? SURFACE : 'rgba(243,235,220,0.55)' }}>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: TEAL }}>{v.id}</td>
                  <td className="px-4 py-2.5 text-xs font-medium" style={{ color: '#17212B' }}>{v.cargo}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#5A6670' }}>{v.origin}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#5A6670' }}>{v.destination}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#5A6670' }}>{v.currentLocation}</td>
                  <td className="px-4 py-2.5 text-xs font-mono" style={{ color: '#5A6670' }}>{v.route}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-2.5"><SeverityBadge severity={v.risk} /></td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#17212B' }}>{v.eta} <span style={{ color: '#8A9098' }}>({v.delay})</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
