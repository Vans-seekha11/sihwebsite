import { useState } from 'react';

const reportTypes = [
  'Daily Situation Report', 'District Logistics Report', 'Route Risk Report',
  'Incident Report', 'Disruption Report', 'AI Risk Report',
];

export default function Reports() {
  const [reportType, setReportType] = useState(reportTypes[0]);
  const [generated, setGenerated] = useState(false);
  const today = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });

  return (
    <div className="space-y-5 max-w-screen-2xl">
      <div>
        <h1 className="font-semibold text-2xl" style={{ color: '#17212B' }}>Reports</h1>
        <p className="text-sm mt-0.5" style={{ color: '#5A6670' }}>Generate and export operational reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Report builder */}
        <div className="rounded-xl border shadow-sm p-4 space-y-4"
          style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
          <h2 className="font-semibold text-base" style={{ color: '#17212B' }}>Report Configuration</h2>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: '#5A6670' }}>Report Type</label>
            <select value={reportType} onChange={e => { setReportType(e.target.value); setGenerated(false); }}
              className="w-full text-sm px-3 py-2 rounded border"
              style={{ borderColor: 'rgba(180,162,136,0.55)', background: 'rgba(238,228,210,0.88)', color: '#17212B' }}>
              {reportTypes.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          {[
            { label: 'Date', type: 'date', defaultValue: new Date().toISOString().split('T')[0] },
            { label: 'District', type: 'text', defaultValue: 'Kamrup Metro, Assam' },
          ].map(field => (
            <div key={field.label}>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5A6670' }}>{field.label}</label>
              <input type={field.type} defaultValue={field.defaultValue}
                className="w-full text-sm px-3 py-2 rounded border"
                style={{ borderColor: 'rgba(180,162,136,0.55)', background: 'rgba(238,228,210,0.88)', color: '#17212B' }} />
            </div>
          ))}

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: '#5A6670' }}>Incident Type</label>
            <select className="w-full text-sm px-3 py-2 rounded border"
              style={{ borderColor: 'rgba(180,162,136,0.55)', background: 'rgba(238,228,210,0.88)', color: '#17212B' }}>
              <option>All Types</option>
              <option>Flood</option>
              <option>Landslide</option>
              <option>Road Blockage</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: '#5A6670' }}>Severity Filter</label>
            <select className="w-full text-sm px-3 py-2 rounded border"
              style={{ borderColor: 'rgba(180,162,136,0.55)', background: 'rgba(238,228,210,0.88)', color: '#17212B' }}>
              <option>All Severity Levels</option>
              <option>Critical</option>
              <option>High</option>
              <option>Moderate</option>
            </select>
          </div>

          <button onClick={() => setGenerated(true)}
            className="w-full text-sm font-semibold py-2.5 rounded border transition-colors"
            style={{ background: '#17324D', color: 'white', borderColor: '#17324D' }}>
            Generate Report
          </button>

          {generated && (
            <div className="flex gap-2">
              <button className="flex-1 text-xs font-medium py-2 rounded border"
                style={{ borderColor: 'rgba(180,162,136,0.55)', color: '#2F6F7E' }}>
                ↓ Export PDF
              </button>
              <button className="flex-1 text-xs font-medium py-2 rounded border"
                style={{ borderColor: 'rgba(180,162,136,0.55)', color: '#2F6F7E' }}>
                ↓ Export CSV
              </button>
            </div>
          )}
        </div>

        {/* Report preview */}
        <div className="lg:col-span-2 rounded-xl border shadow-sm overflow-hidden"
          style={{ background: 'rgba(250,247,240,0.82)', borderColor: 'rgba(180,162,136,0.55)' }}>
          {generated ? (
            <>
              <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(180,162,136,0.55)', background: 'rgba(238,228,210,0.88)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-base" style={{ color: '#17212B' }}>{reportType}</h2>
                    <p className="text-xs" style={{ color: '#8A9098' }}>DEMO DATA · {today} · Kamrup Metro, Assam</p>
                  </div>
                  <div className="text-xs px-2 py-1 rounded border" style={{ borderColor: 'rgba(180,162,136,0.55)', color: '#8A9098' }}>
                    DRAFT
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-5">
                {/* KPI summary */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Active Incidents', value: '24' },
                    { label: 'Blocked Routes', value: '7' },
                    { label: 'Delayed Convoys', value: '4' },
                  ].map(k => (
                    <div key={k.label} className="rounded-lg p-3 text-center border" style={{ background: 'rgba(238,228,210,0.88)', borderColor: 'rgba(180,162,136,0.55)' }}>
                      <div className="text-2xl font-bold" style={{ color: '#17212B' }}>{k.value}</div>
                      <div className="text-xs" style={{ color: '#5A6670' }}>{k.label}</div>
                    </div>
                  ))}
                </div>
                {/* Sections */}
                {['Incident Summary', 'Route Status', 'Logistics Status', 'Risk Overview', 'AI Recommendations'].map(section => (
                  <div key={section}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 pb-1 border-b"
                      style={{ color: '#5A6670', borderColor: 'rgba(180,162,136,0.55)' }}>{section}</h3>
                    <div className="h-8 rounded" style={{ background: 'rgba(238,228,210,0.88)' }} />
                  </div>
                ))}
                <div className="text-xs text-center pt-4 border-t" style={{ borderColor: 'rgba(180,162,136,0.55)', color: '#8A9098' }}>
                  Ministry of Development of North Eastern Region · Government of India · DEMO DATA
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-80" style={{ color: '#8A9098' }}>
              <div className="text-4xl mb-3">⊟</div>
              <div className="text-sm font-medium" style={{ color: '#5A6670' }}>Configure and generate a report</div>
              <div className="text-xs mt-1">Select report type and parameters on the left</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
