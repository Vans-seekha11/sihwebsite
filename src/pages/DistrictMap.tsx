import { useState } from 'react';
import MapViz from '@/components/MapViz';
import { SeverityBadge, AccessibilityBadge } from '@/components/StatusBadge';
import { incidents, routes, vehicles } from '@/data/demo';

const layerOptions = ['ROADS', 'INCIDENTS', 'FLOOD RISK', 'LANDSLIDE RISK', 'LOGISTICS', 'INFRASTRUCTURE'];
const riskFilters = ['Low', 'Moderate', 'High', 'Critical'];
const timeFilters = ['Last 1 hour', 'Last 6 hours', 'Last 24 hours', 'Last 7 days'];

export default function DistrictMap() {
  const [activeLayers, setActiveLayers] = useState(new Set(['ROADS', 'INCIDENTS', 'LOGISTICS']));
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('Last 24 hours');
  const [showSim, setShowSim] = useState(false);
  const [simRoute, setSimRoute] = useState('NH-27');

  const toggleLayer = (l: string) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      next.has(l) ? next.delete(l) : next.add(l);
      return next;
    });
  };

  const route = routes.find(r => r.id === selectedRoute);

  return (
    <div className="space-y-4 h-full flex flex-col max-w-screen-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl" style={{ color: '#17212B' }}>District Map</h1>
          <p className="text-sm mt-0.5" style={{ color: '#5A6670' }}>Geospatial intelligence — routes, incidents, logistics</p>
        </div>
        <button
          onClick={() => setShowSim(!showSim)}
          className="text-xs font-medium px-3 py-2 rounded border transition-colors"
          style={{ background: showSim ? '#17324D' : 'rgba(250,247,240,0.82)', color: showSim ? 'white' : '#17324D', borderColor: '#17324D' }}>
          ◎ Simulate Route Closure
        </button>
      </div>

      {/* Simulation panel */}
      {showSim && (
        <div className="rounded-xl border p-4" style={{ background: '#FEF8E6', borderColor: '#F5DFA8' }}>
          <div className="flex items-center gap-2 mb-3">
            <span style={{ color: '#D7A73A' }}>✦</span>
            <h3 className="font-semibold text-sm" style={{ color: '#17212B' }}>Route Closure Simulation — DEMO</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5A6670' }}>Select Route</label>
              <select value={simRoute} onChange={e => setSimRoute(e.target.value)}
                className="text-sm px-3 py-1.5 rounded border w-full"
                style={{ borderColor: 'rgba(180,162,136,0.55)', background: 'rgba(250,247,240,0.82)' }}>
                {routes.map(r => <option key={r.id}>{r.id}</option>)}
              </select>
            </div>
            {[
              { label: 'Affected Districts', value: '3' },
              { label: 'Logistics Movements', value: '17' },
              { label: 'Add. Delay', value: '+1h 24m' },
            ].map(item => (
              <div key={item.label} className="rounded-lg p-3 border" style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
                <div className="text-xl font-bold" style={{ color: '#17212B' }}>{item.value}</div>
                <div className="text-xs" style={{ color: '#5A6670' }}>{item.label}</div>
              </div>
            ))}
          </div>
          <div className="text-xs rounded p-2" style={{ background: '#FEE9E9', color: '#BE2424' }}>
            ◆ Recommended: Deploy 2 field teams · Alternative routes: NH-37 (via Jorhat), NH-40 (via Shillong)
          </div>
        </div>
      )}

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left controls */}
        <div className="w-56 flex-shrink-0 space-y-4">
          {/* Layers */}
          <div className="rounded-xl border p-3" style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#5A6670' }}>Map Layers</h3>
            <div className="space-y-1.5">
              {layerOptions.map(l => (
                <label key={l} className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#17212B' }}>
                  <input type="checkbox" checked={activeLayers.has(l)} onChange={() => toggleLayer(l)}
                    className="rounded" />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {/* Risk filter */}
          <div className="rounded-xl border p-3" style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#5A6670' }}>Risk Level</h3>
            <div className="flex flex-col gap-1">
              {riskFilters.map(f => (
                <button key={f} className="text-left text-xs px-2 py-1.5 rounded"
                  style={{ background: 'rgba(238,228,210,0.88)', color: '#17212B' }}>{f}</button>
              ))}
            </div>
          </div>

          {/* Time filter */}
          <div className="rounded-xl border p-3" style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#5A6670' }}>Time Range</h3>
            {timeFilters.map(f => (
              <button key={f} onClick={() => setTimeFilter(f)}
                className="w-full text-left text-xs px-2 py-1.5 rounded mb-0.5 transition-colors"
                style={{
                  background: timeFilter === f ? '#17324D' : 'rgba(238,228,210,0.88)',
                  color: timeFilter === f ? 'white' : '#17212B',
                }}>
                {f}
              </button>
            ))}
          </div>

          {/* Routes list */}
          <div className="rounded-xl border p-3" style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#5A6670' }}>Routes</h3>
            <div className="space-y-1">
              {routes.map(r => (
                <button key={r.id} onClick={() => setSelectedRoute(selectedRoute === r.id ? null : r.id)}
                  className="w-full text-left px-2 py-1.5 rounded text-xs transition-colors"
                  style={{
                    background: selectedRoute === r.id ? 'rgba(238,228,210,0.88)' : 'transparent',
                    color: '#17212B',
                    borderLeft: selectedRoute === r.id ? '2px solid #D7A73A' : '2px solid transparent',
                  }}>
                  <span className="font-medium">{r.id}</span>
                  <span className="ml-2" style={{
                    color: r.status === 'Open' ? '#2D6B4F' : r.status === 'Restricted' ? '#C4861A' : '#BE2424'
                  }}>● {r.status}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <MapViz incidents={incidents} routes={routes} vehicles={vehicles} height={520} showLegend />

          {/* Route detail panel */}
          {route && (
            <div className="rounded-xl border p-4" style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-base" style={{ color: '#17212B' }}>Route {route.id}</h3>
                  <p className="text-xs" style={{ color: '#5A6670' }}>{route.name} · {route.distance}</p>
                </div>
                <div className="flex gap-2">
                  <SeverityBadge severity={route.riskScore > 75 ? 'CRITICAL' : route.riskScore > 50 ? 'HIGH' : route.riskScore > 25 ? 'MODERATE' : 'LOW'} />
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { label: 'Accessibility', value: <AccessibilityBadge score={route.accessibilityScore} /> },
                  { label: 'Risk Score', value: `${route.riskScore}/100` },
                  { label: 'Status', value: route.status },
                  { label: 'Weather', value: route.weather },
                  { label: 'Flood Risk', value: route.floodRisk },
                  { label: 'ETA', value: route.eta },
                ].map(item => (
                  <div key={item.label} className="rounded p-2" style={{ background: 'rgba(238,228,210,0.88)' }}>
                    <div className="text-xs mb-0.5" style={{ color: '#8A9098' }}>{item.label}</div>
                    <div className="text-xs font-semibold" style={{ color: '#17212B' }}>
                      {typeof item.value === 'string' ? item.value : item.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded p-2.5 flex items-center gap-2"
                style={{ background: '#FEF8E6', border: '1px solid #F5DFA8' }}>
                <span style={{ color: '#D7A73A' }}>✦</span>
                <span className="text-xs" style={{ color: '#5A6670' }}>
                  <strong style={{ color: '#17212B' }}>AI Recommendation:</strong> Consider rerouting via NH-40 to reduce disruption risk. Confidence: {route.riskScore > 70 ? '82%' : '65%'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
