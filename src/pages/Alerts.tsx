import { useState } from 'react';
import { alerts as initialAlerts } from '@/data/demo';
import { SeverityBadge } from '@/components/StatusBadge';

const categories = ['All', 'Critical', 'Route Closure', 'Flood', 'Landslide', 'Logistics Delay', 'Escalation', 'AI Warning'];

export default function Alerts() {
  const [alertList, setAlertList] = useState(initialAlerts);
  const [category, setCategory] = useState('All');

  const filtered = alertList.filter(a => category === 'All' || a.severity === category.toUpperCase() || a.category === category);

  const acknowledge = (id: string) => {
    setAlertList(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const unacknowledgedCount = alertList.filter(a => !a.acknowledged).length;

  return (
    <div className="space-y-5 max-w-screen-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-semibold text-2xl" style={{ color: '#17212B' }}>Alerts</h1>
          <p className="text-sm mt-0.5" style={{ color: '#5A6670' }}>
            Operational notification center — {unacknowledgedCount} unacknowledged
          </p>
        </div>
        <button className="text-xs font-medium px-3 py-2 rounded border"
          style={{ borderColor: 'rgba(180,162,136,0.55)', color: '#5A6670' }}
          onClick={() => setAlertList(prev => prev.map(a => ({ ...a, acknowledged: true })))}>
          Acknowledge All
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className="text-xs px-3 py-1.5 rounded-full border transition-colors"
            style={{
              background: category === c ? '#17324D' : 'rgba(250,247,240,0.82)',
              color: category === c ? 'white' : '#5A6670',
              borderColor: category === c ? '#17324D' : 'rgba(180,162,136,0.55)',
            }}>
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(alert => (
          <div key={alert.id}
            className="rounded-xl border shadow-sm p-4 transition-opacity"
            style={{
              background: alert.acknowledged ? 'rgba(243,235,220,0.55)' : 'rgba(250,247,240,0.82)',
              borderColor: alert.acknowledged ? 'rgba(180,162,136,0.55)' : (
                alert.severity === 'CRITICAL' ? '#F5B8B8' :
                alert.severity === 'HIGH' ? '#F5CDA8' : 'rgba(180,162,136,0.55)'
              ),
              opacity: alert.acknowledged ? 0.7 : 1,
              borderLeftWidth: 3,
              borderLeftColor: alert.severity === 'CRITICAL' ? '#BE2424' : alert.severity === 'HIGH' ? '#E07840' : alert.severity === 'MODERATE' ? '#C4861A' : '#2D6B4F',
            }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <SeverityBadge severity={alert.severity} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm" style={{ color: '#17212B' }}>{alert.title}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs" style={{ color: '#8A9098' }}>{alert.time}</span>
                    {alert.acknowledged && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(238,228,210,0.88)', color: '#8A9098' }}>
                        Acknowledged
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs mt-0.5 mb-2" style={{ color: '#8A9098' }}>
                  <span>◉ {alert.location}</span>
                  <span>· {alert.category}</span>
                  <span>· Source: {alert.source}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#5A6670' }}>{alert.description}</p>
                {!alert.acknowledged && (
                  <div className="flex gap-2 mt-3">
                    <button className="text-xs font-medium px-3 py-1.5 rounded border"
                      style={{ background: '#17324D', color: 'white', borderColor: '#17324D' }}>
                      View
                    </button>
                    <button onClick={() => acknowledge(alert.id)}
                      className="text-xs font-medium px-3 py-1.5 rounded border"
                      style={{ borderColor: 'rgba(180,162,136,0.55)', color: '#5A6670' }}>
                      Acknowledge
                    </button>
                    <button className="text-xs font-medium px-3 py-1.5 rounded border"
                      style={{ borderColor: 'rgba(180,162,136,0.55)', color: '#5A6670' }}>
                      Assign
                    </button>
                    {alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? (
                      <button className="text-xs font-medium px-3 py-1.5 rounded border"
                        style={{ borderColor: '#F5B8B8', color: '#BE2424', background: '#FEE9E9' }}>
                        Escalate
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
