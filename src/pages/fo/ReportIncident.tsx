import { useState, useEffect } from 'react';
import { SeverityBadge } from '@/components/StatusBadge';
import type { Severity } from '@/data/demo';
import { Card, PageHeader, BORDER, SURFACE_2, NAVY, TEAL, GOLD } from './ui';

const STEPS = ['Incident Type', 'Location', 'Evidence', 'Details', 'Review', 'Submit'];

const TYPES = [
  { key: 'Road Blockage', icon: '⊗', color: '#C25A1A' },
  { key: 'Flood', icon: '≈', color: '#2F6F7E' },
  { key: 'Landslide', icon: '⛰', color: '#8A6A3A' },
  { key: 'Accident', icon: '⊙', color: '#BE2424' },
  { key: 'Infrastructure Damage', icon: '⌂', color: '#17324D' },
  { key: 'Other', icon: '?', color: '#5A6670' },
];

const field = {
  background: 'rgba(245,236,220,0.6)',
  border: '1px solid rgba(180,162,136,0.5)',
  color: '#17212B',
};

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium mb-1" style={{ color: '#5A6670' }}>{children}</label>;
}

export default function ReportIncident({ setPage, presetType }: { setPage?: (p: string) => void; presetType?: string }) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<string | null>(presetType ?? null);
  const [severity, setSeverity] = useState<Severity>('HIGH');
  const [desc, setDesc] = useState('');
  const [route, setRoute] = useState('NH-29');
  const [locName, setLocName] = useState('Dimapur–Kohima Route');
  const [gps, setGps] = useState<string | null>(null);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [aiState, setAiState] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [submit, setSubmit] = useState<'idle' | 'submitting' | 'done'>('idle');
  const incidentId = 'INC-2026-' + (1000 + Math.floor(Math.random() * 8999));

  // Run the AI assessment when arriving at the Details step with enough info.
  useEffect(() => {
    if (step === 3 && aiState === 'idle') {
      setAiState('analyzing');
      const t = setTimeout(() => setAiState('done'), 1800);
      return () => clearTimeout(t);
    }
  }, [step, aiState]);

  const captureGps = () => {
    setGpsBusy(true);
    setTimeout(() => { setGps('25.9091° N, 93.7266° E'); setGpsBusy(false); }, 1100);
  };

  const doSubmit = () => {
    setSubmit('submitting');
    setTimeout(() => { setSubmit('done'); setStep(5); }, 1600);
  };

  const canNext =
    step === 0 ? !!type :
    step === 1 ? !!gps :
    true;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Report Incident"
        sub="Field incident reporting · optimized for on-site capture" />

      {/* Stepper */}
      <Card className="p-4">
        <div className="flex items-center overflow-x-auto">
          {STEPS.map((s, i) => {
            const done = i < step, active = i === step;
            return (
              <div key={s} className="flex items-center flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      background: done ? '#2D6B4F' : active ? NAVY : SURFACE_2,
                      color: done || active ? 'white' : '#8A9098',
                    }}>
                    {done ? '✓' : String(i + 1).padStart(2, '0')}
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap"
                    style={{ color: active ? '#17212B' : '#8A9098' }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <span className="mx-3 text-xs" style={{ color: BORDER }}>→</span>}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        {/* STEP 1 — Type */}
        {step === 0 && (
          <div>
            <h3 className="font-semibold text-base mb-1" style={{ color: '#17212B' }}>Select Incident Type</h3>
            <p className="text-xs mb-4" style={{ color: '#8A9098' }}>Choose the category that best matches what you observe.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TYPES.map(t => {
                const sel = type === t.key;
                return (
                  <button key={t.key} onClick={() => setType(t.key)}
                    className="rounded-lg border p-4 flex flex-col items-center gap-2 text-center transition-all hover:-translate-y-0.5"
                    style={{ background: sel ? t.color + '14' : SURFACE_2, borderColor: sel ? t.color : BORDER, minHeight: 44 }}>
                    <span className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                      style={{ background: t.color + '18', color: t.color }}>{t.icon}</span>
                    <span className="text-xs font-medium" style={{ color: '#17212B' }}>{t.key}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2 — Location */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-base" style={{ color: '#17212B' }}>Location</h3>
            <div className="rounded-lg border p-4" style={{ background: SURFACE_2, borderColor: BORDER }}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs font-medium" style={{ color: '#5A6670' }}>GPS Coordinates</div>
                  <div className="text-sm font-mono mt-0.5" style={{ color: gps ? '#17212B' : '#8A9098' }}>
                    {gps ?? 'Not captured'}
                  </div>
                </div>
                <button onClick={captureGps} disabled={gpsBusy}
                  className="text-xs font-medium px-3 py-2 rounded transition-all disabled:opacity-70"
                  style={{ background: gps ? '#EAF4EE' : NAVY, color: gps ? '#2D6B4F' : 'white', minHeight: 44 }}>
                  {gpsBusy ? '◉ Locating…' : gps ? '✓ GPS Captured — Re-detect' : '◉ Auto-detect GPS'}
                </button>
              </div>
            </div>
            {/* Map placeholder in existing warm style */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: BORDER, height: 160,
              background: 'linear-gradient(135deg, #D0956A 0%, #DFCBA8 45%, #BFD0C0 100%)' }}>
              <div className="w-full h-full flex items-center justify-center">
                {gps
                  ? <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(250,247,240,0.85)', color: NAVY }}>◉ Pin dropped at current location</span>
                  : <span className="text-xs" style={{ color: 'rgba(23,33,43,0.5)' }}>Capture GPS to place pin</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Location Name</Label>
                <input value={locName} onChange={e => setLocName(e.target.value)} className="w-full rounded px-3 py-2 text-sm outline-none" style={field} /></div>
              <div><Label>Route Name</Label>
                <input value={route} onChange={e => setRoute(e.target.value)} className="w-full rounded px-3 py-2 text-sm outline-none" style={field} /></div>
              <div className="col-span-2"><Label>Nearby Landmark</Label>
                <input placeholder="e.g. Dhansiri River bridge, Km 34" className="w-full rounded px-3 py-2 text-sm outline-none" style={field} /></div>
            </div>
          </div>
        )}

        {/* STEP 3 — Evidence */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-base" style={{ color: '#17212B' }}>Evidence</h3>
            <button onClick={() => setEvidence(e => [...e, `IMG_${1000 + e.length}.jpg`])}
              className="w-full rounded-lg border border-dashed p-6 flex flex-col items-center gap-2 transition-colors"
              style={{ borderColor: BORDER, background: SURFACE_2, minHeight: 44 }}>
              <span className="text-2xl" style={{ color: TEAL }}>⊕</span>
              <span className="text-sm font-medium" style={{ color: '#17212B' }}>Capture / Upload Image</span>
              <span className="text-xs" style={{ color: '#8A9098' }}>Multiple images and a short video are supported. Timestamp &amp; GPS metadata are attached automatically.</span>
            </button>
            {evidence.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {evidence.map((e, i) => (
                  <div key={i} className="rounded-lg border overflow-hidden" style={{ borderColor: BORDER }}>
                    <div className="h-20 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#DFCBA8,#BFD0C0)' }}>
                      <span className="text-lg" style={{ color: NAVY }}>▤</span>
                    </div>
                    <div className="px-2 py-1.5">
                      <div className="text-xs font-mono truncate" style={{ color: '#17212B' }}>{e}</div>
                      <div style={{ fontSize: 10, color: '#8A9098' }}>◷ 12:04 · ◉ GPS tagged</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — Details + AI Assessment */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-base" style={{ color: '#17212B' }}>Incident Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Severity</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as Severity[]).map(s => (
                    <button key={s} onClick={() => setSeverity(s)}
                      className="rounded transition-all" style={{ outline: severity === s ? `2px solid ${NAVY}` : 'none', borderRadius: 6 }}>
                      <SeverityBadge severity={s} />
                    </button>
                  ))}
                </div>
              </div>
              <div><Label>Road Condition</Label>
                <select className="w-full rounded px-3 py-2 text-sm outline-none" style={field}>
                  <option>Partially Accessible</option><option>Fully Blocked</option><option>Passable with caution</option>
                </select></div>
              <div><Label>Vehicles Affected</Label>
                <input type="number" defaultValue={12} className="w-full rounded px-3 py-2 text-sm outline-none" style={field} /></div>
              <div><Label>Estimated Blockage</Label>
                <input defaultValue="4–6 hours" className="w-full rounded px-3 py-2 text-sm outline-none" style={field} /></div>
              <div className="col-span-2"><Label>Description</Label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
                  placeholder="Describe conditions, accessibility and any immediate action required…"
                  className="w-full rounded px-3 py-2 text-sm outline-none resize-none" style={field} /></div>
            </div>

            {/* AI assessment */}
            <div className="rounded-lg border p-4" style={{ background: '#FEF8E6', borderColor: '#F5DFA8' }}>
              <div className="flex items-center gap-1.5 mb-3">
                <span style={{ color: GOLD }}>✦</span>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#C4861A' }}>AI Incident Assessment</span>
                <span className="text-xs ml-auto px-1.5 py-0.5 rounded" style={{ background: '#F5DFA8', color: '#7A6D2A' }}>AI-generated estimate</span>
              </div>
              {aiState === 'analyzing' ? (
                <div className="flex items-center gap-2 py-3">
                  <span className="inline-block animate-spin" style={{ color: GOLD }}>✦</span>
                  <span className="text-sm" style={{ color: '#5A6670' }}>Analyzing incident conditions…</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { l: 'Risk Level', v: 'HIGH', c: '#C25A1A' },
                    { l: 'Priority', v: '82/100', c: '#17212B' },
                    { l: 'Confidence', v: '89%', c: '#2D6B4F' },
                    { l: 'Affected Route', v: route, c: '#2F6F7E' },
                    { l: 'Logistics Impact', v: 'HIGH', c: '#BE2424' },
                  ].map(m => (
                    <div key={m.l}>
                      <div style={{ fontSize: 10, color: '#8A9098' }} className="uppercase tracking-wide mb-0.5">{m.l}</div>
                      <div className="text-sm font-bold" style={{ color: m.c }}>{m.v}</div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs mt-3" style={{ color: '#8A9098' }}>
                AI estimates support your judgement — they are not guaranteed facts. Verify on-site conditions.
              </p>
            </div>
          </div>
        )}

        {/* STEP 5 — Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-base" style={{ color: '#17212B' }}>Review Incident</h3>
            <div className="rounded-lg border divide-y" style={{ borderColor: BORDER, background: SURFACE_2 }}>
              {[
                ['Incident Type', type ?? '—'],
                ['Severity', severity],
                ['Location', `${locName} · ${route}`],
                ['GPS', gps ?? '—'],
                ['Evidence', `${evidence.length} file(s) attached`],
                ['Description', desc || '—'],
                ['AI Risk / Priority', 'HIGH · 82/100 (89% confidence)'],
              ].map(([k, v]) => (
                <div key={k} className="flex px-4 py-2.5 text-sm gap-4">
                  <span className="w-40 flex-shrink-0 text-xs font-medium" style={{ color: '#8A9098' }}>{k}</span>
                  <span style={{ color: '#17212B' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6 — Submit / Confirmation */}
        {step === 5 && (
          <div className="py-6 text-center">
            {submit !== 'done' ? (
              <div className="max-w-sm mx-auto space-y-4">
                <p className="text-sm" style={{ color: '#5A6670' }}>Ready to submit this incident report to the District Officer.</p>
                <button onClick={doSubmit} disabled={submit === 'submitting'}
                  className="w-full font-medium px-4 py-3 rounded transition-all disabled:opacity-70"
                  style={{ background: NAVY, color: 'white', minHeight: 44 }}>
                  {submit === 'submitting' ? 'Submitting…' : 'Submit Incident'}
                </button>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-2xl mb-3"
                  style={{ background: '#EAF4EE', color: '#2D6B4F' }}>✓</div>
                <h3 className="font-semibold text-lg mb-1" style={{ color: '#17212B' }}>Incident Reported Successfully</h3>
                <div className="rounded-lg border divide-y my-4 text-left" style={{ borderColor: BORDER, background: SURFACE_2 }}>
                  {[
                    ['Incident ID', incidentId],
                    ['Status', 'Under Review'],
                    ['District Officer Notification', 'Sent ✓'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex px-4 py-2.5 text-sm justify-between">
                      <span className="text-xs font-medium" style={{ color: '#8A9098' }}>{k}</span>
                      <span className="font-medium" style={{ color: k === 'Status' ? '#C4861A' : '#17212B' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 justify-center">
                  <button className="text-xs font-medium px-4 py-2 rounded border" style={{ borderColor: BORDER, color: TEAL, minHeight: 44 }}>View Incident</button>
                  <button onClick={() => setPage?.('fo-dashboard')} className="text-xs font-medium px-4 py-2 rounded" style={{ background: NAVY, color: 'white', minHeight: 44 }}>Back to Dashboard</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nav buttons */}
        {step < 5 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: BORDER }}>
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
              className="text-xs font-medium px-4 py-2 rounded border transition-colors disabled:opacity-40"
              style={{ borderColor: BORDER, color: '#5A6670', minHeight: 44 }}>← Back</button>
            <button onClick={() => canNext && setStep(s => s + 1)} disabled={!canNext}
              className="text-xs font-medium px-5 py-2 rounded transition-all disabled:opacity-40"
              style={{ background: NAVY, color: 'white', minHeight: 44 }}>
              {step === 4 ? 'Continue to Submit →' : 'Next →'}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
