import { useState, useEffect, useMemo } from 'react';
import MapViz from '@/components/MapViz';
import { SeverityBadge, StatusBadge, AccessibilityBadge } from '@/components/StatusBadge';
import type { Severity } from '@/data/demo';
import { getIncidents, subscribeToIncidents } from '@/lib/incidentStore';
import { getTasks, subscribeToTasks } from '@/lib/taskStore';
import { Card, CardHeader, BORDER, SURFACE_2, NAVY, TEAL, GOLD } from '../fo/ui';

/* ────────────────────────────────────────────────────────────────
   Regional Control Center — Command Center dashboard.
   Distinct three-zone command layout (map anchor + critical panel +
   regional intelligence) using the exact shared design system.
──────────────────────────────────────────────────────────────── */

const QUICK = ['View Critical Incidents', 'Regional Map', 'Live Logistics', 'Risk Intelligence', 'AI Predictions', 'Generate Report'];

function riskColor(s: number) {
  return s > 75 ? '#BE2424' : s > 60 ? '#C25A1A' : s > 40 ? '#C4861A' : '#2D6B4F';
}

export default function CommandCenter({ setPage }: { setPage?: (p: string) => void }) {
  const [incidents, setIncidents] = useState(() => getIncidents());
  const [tasks, setTasks] = useState(() => getTasks());
  const [overall, setOverall] = useState(72);
  const [analyzing, setAnalyzing] = useState(false);
  const [refresh, setRefresh] = useState<'idle' | 'busy' | 'done'>('idle');
  const [updatedTick, setUpdatedTick] = useState('just now');

  useEffect(() => subscribeToIncidents(stored => setIncidents(stored)), []);
  useEffect(() => subscribeToTasks(stored => setTasks(stored)), []);

  const liveRoutes = useMemo(() => {
    const grouped = new Map<string, { id: string; name: string; risk: number; accessibility: number; incidents: number; status: string; weather: string; eta: string; distance: string; delay: string; lastUpdated: string; floodRisk: Severity; landslideRisk: Severity }>();

    incidents.forEach(incident => {
      const existing = grouped.get(incident.route) ?? {
        id: incident.route,
        name: incident.route,
        risk: 0,
        accessibility: 100,
        incidents: 0,
        status: 'Open',
        weather: 'Monitoring',
        eta: 'Pending',
        distance: 'N/A',
        delay: 'None',
        lastUpdated: incident.reportedTime,
        floodRisk: 'LOW',
        landslideRisk: 'LOW',
      };
      const nextRisk = Math.max(existing.risk, incident.riskScore);
      const nextAccessibility = Math.max(20, Math.min(100, existing.accessibility - (incident.severity === 'CRITICAL' ? 30 : incident.severity === 'HIGH' ? 20 : incident.severity === 'MODERATE' ? 12 : 6)));
      grouped.set(incident.route, {
        ...existing,
        risk: nextRisk,
        accessibility: nextAccessibility,
        incidents: existing.incidents + 1,
        status: incident.status === 'RESOLVED' ? 'Open' : incident.status === 'ESCALATED' ? 'Restricted' : incident.status === 'PENDING_VERIFICATION' ? 'Restricted' : 'Open',
        weather: incident.severity === 'CRITICAL' ? 'Severe' : incident.severity === 'HIGH' ? 'Heavy Rain' : 'Monitoring',
        eta: incident.estimatedDisruption,
        floodRisk: incident.severity === 'LOW' ? 'LOW' : incident.severity === 'MODERATE' ? 'MODERATE' : incident.severity === 'HIGH' ? 'HIGH' : 'CRITICAL',
        landslideRisk: incident.severity === 'CRITICAL' ? 'CRITICAL' : incident.severity === 'HIGH' ? 'HIGH' : 'MODERATE',
      });
    });

    return Array.from(grouped.values()).slice(0, 6);
  }, [incidents]);

  const liveVehicles = useMemo(() => {
    return tasks.slice(0, 5).map(task => ({
      id: task.id,
      cargo: task.title,
      origin: 'Regional HQ',
      destination: task.location,
      currentLocation: task.location,
      route: task.relatedIncident ?? task.location,
      eta: task.deadline,
      delay: task.status === 'Escalated' ? 'High' : task.status === 'In Progress' ? '+30m' : 'None',
      risk: task.priority,
      status: task.status === 'Escalated' ? 'At Risk' : task.status === 'In Progress' ? 'Delayed' : 'On Time',
    }));
  }, [tasks]);

  const activeIncidents = useMemo(
    () => incidents.filter(incident => !['RESOLVED', 'CLOSED'].includes(incident.status)),
    [incidents]
  );

  const criticalIncidents = useMemo(
    () => activeIncidents.filter(incident => incident.severity === 'CRITICAL' || incident.status === 'ESCALATED').slice(0, 5),
    [activeIncidents]
  );

  const affectedRoutes = useMemo(
    () => Array.from(new Set(activeIncidents.map(incident => incident.route))).filter(Boolean),
    [activeIncidents]
  );

  const atRiskLogistics = useMemo(
    () => tasks.filter(task => ['New', 'In Progress', 'Escalated'].includes(task.status)).length + activeIncidents.filter(incident => incident.affectedLogistics > 0).length,
    [tasks, activeIncidents]
  );

  const districtsOnAlert = useMemo(
    () => Array.from(new Set(activeIncidents.map(incident => incident.location.split(',').pop()?.trim() || incident.location))).filter(Boolean).length,
    [activeIncidents]
  );

  const regionalAccessibility = useMemo(() => {
    if (!activeIncidents.length) return 76;
    const averageRisk = activeIncidents.reduce((sum, incident) => sum + incident.riskScore, 0) / activeIncidents.length;
    return Math.max(20, Math.min(100, Math.round(100 - averageRisk * 0.5)));
  }, [activeIncidents]);

  const kpis = useMemo(() => [
    { label: 'Active Incidents', value: String(activeIncidents.length), color: '#C25A1A', icon: '◆' },
    { label: 'Critical Incidents', value: String(criticalIncidents.length), color: '#BE2424', icon: '!' },
    { label: 'Affected Routes', value: String(affectedRoutes.length), color: '#C4861A', icon: '→' },
    { label: 'At-Risk Logistics', value: String(atRiskLogistics), color: '#2F6F7E', icon: '⊟' },
    { label: 'Districts on Alert', value: String(districtsOnAlert), color: '#17324D', icon: '◉' },
    { label: 'Regional Accessibility', value: String(regionalAccessibility), suffix: '/100', color: '#C25A1A', icon: '▨' },
  ], [activeIncidents.length, affectedRoutes.length, atRiskLogistics, criticalIncidents.length, districtsOnAlert, regionalAccessibility]);

  const criticalList = useMemo(() => criticalIncidents.map(incident => ({
    sev: incident.severity,
    title: incident.status === 'ESCALATED' ? `Escalated: ${incident.type}` : `${incident.type} · ${incident.location}`,
    meta: [
      ['Route', incident.route],
      ['Status', incident.status],
      ['Reported', incident.reportedTime],
    ],
    time: incident.reportedTime,
    btn: 'Review Incident',
  })), [criticalIncidents]);

  const riskList = useMemo(() => {
    const routeMap = new Map<string, { score: number; level: Severity; label: string; trend: string }>();

    activeIncidents.forEach(incident => {
      const current = routeMap.get(incident.route) ?? { score: 0, level: incident.severity, label: incident.route, trend: 'Watchlist' };
      routeMap.set(incident.route, {
        score: Math.max(current.score, incident.riskScore),
        level: incident.severity,
        label: incident.route,
        trend: current.trend,
      });
    });

    return Array.from(routeMap.values()).slice(0, 5).map(item => ({
      label: item.label,
      score: item.score,
      level: item.level,
      trend: item.score >= 75 ? 'Escalating' : 'Monitoring',
    }));
  }, [activeIncidents]);

  const districtRows = useMemo(() => {
    const grouped = new Map<string, { name: string; risk: Severity; acc: number; inc: number; alerts: number; routes: Set<string>; impact: string; status: string }>();

    activeIncidents.forEach(incident => {
      const key = incident.location.split(',').slice(-2).join(', ') || incident.location;
      const existing = grouped.get(key) ?? {
        name: key,
        risk: 'LOW',
        acc: 100,
        inc: 0,
        alerts: 0,
        routes: new Set<string>(),
        impact: 'Monitoring',
        status: 'Active',
      };

      const currentRisk = incident.severity === 'CRITICAL' ? 4 : incident.severity === 'HIGH' ? 3 : incident.severity === 'MODERATE' ? 2 : 1;
      const maxRiskIndex = { LOW: 1, MODERATE: 2, HIGH: 3, CRITICAL: 4 };
      const nextRisk = maxRiskIndex[existing.risk] >= currentRisk ? existing.risk : incident.severity;
      existing.risk = nextRisk;
      existing.acc = Math.max(20, Math.min(100, 100 - Math.round((incident.riskScore + existing.inc * 8) / (existing.inc + 1))));
      existing.inc += 1;
      existing.alerts += incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 1 : 0;
      existing.routes.add(incident.route);
      existing.impact = incident.estimatedDisruption || 'Monitoring';
      existing.status = incident.status === 'ESCALATED' ? 'Escalated' : 'Active';
      grouped.set(key, existing);
    });

    return Array.from(grouped.values()).slice(0, 5).map(entry => ({
      name: entry.name,
      risk: entry.risk,
      acc: entry.acc,
      inc: String(entry.inc),
      alerts: String(entry.alerts),
      routes: String(entry.routes.size),
      impact: entry.impact,
      status: entry.status,
    }));
  }, [activeIncidents]);

  const predictionRows = useMemo(() => {
    return activeIncidents.slice(0, 3).map((incident, index) => ({
      title: `${incident.type} risk watch`,
      rows: [
        ['Route', incident.route],
        ['Likelihood', `${Math.min(98, incident.riskScore + (index * 6))}%`],
        ['Window', index === 0 ? 'Next 3 hrs' : index === 1 ? 'Next 6 hrs' : 'Next 12 hrs'],
      ],
      confidence: Math.min(98, incident.riskScore + (index * 4)),
    }));
  }, [activeIncidents]);

  const priorityActions = useMemo(() => {
    const actionMap: Array<{ sev: Severity; label: string; loc: string; time: string }> = [];

    activeIncidents.slice(0, 4).forEach(incident => {
      actionMap.push({
        sev: incident.severity,
        label: `${incident.type} at ${incident.location}`,
        loc: incident.route,
        time: incident.reportedTime,
      });
    });

    tasks.filter(task => ['New', 'In Progress', 'Escalated'].includes(task.status)).slice(0, 2).forEach(task => {
      actionMap.push({
        sev: task.priority,
        label: task.title,
        loc: task.location,
        time: task.created,
      });
    });

    return actionMap.slice(0, 5);
  }, [activeIncidents, tasks]);

  const alertSummary = useMemo(() => [
    { label: 'Critical', value: activeIncidents.filter(incident => incident.severity === 'CRITICAL').length, sev: 'CRITICAL' as Severity },
    { label: 'High', value: activeIncidents.filter(incident => incident.severity === 'HIGH').length, sev: 'HIGH' as Severity },
    { label: 'Moderate', value: activeIncidents.filter(incident => incident.severity === 'MODERATE').length, sev: 'MODERATE' as Severity },
    { label: 'Low', value: activeIncidents.filter(incident => incident.severity === 'LOW').length, sev: 'LOW' as Severity },
  ], [activeIncidents]);

  useEffect(() => {
    const t1 = setTimeout(() => setAnalyzing(true), 1200);
    const t2 = setTimeout(() => {
      setOverall(regionalAccessibility);
      setAnalyzing(false);
    }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [regionalAccessibility]);

  const doRefresh = () => {
    setRefresh('busy');
    setTimeout(() => { setRefresh('done'); setUpdatedTick('just now'); }, 1200);
  };

  return (
    <div className="space-y-5 max-w-screen-2xl">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-semibold text-2xl" style={{ color: '#17212B' }}>Regional Control Center</h1>
          <p className="text-sm mt-0.5" style={{ color: '#5A6670' }}>North Eastern Region · Live situational awareness</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border"
            style={{ background: '#EAF4EE', borderColor: '#A8D4B8', color: '#2D6B4F' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            System Operational
          </span>
          <button onClick={doRefresh} disabled={refresh === 'busy'}
            className="text-xs px-3 py-1.5 rounded border font-medium transition-colors disabled:opacity-70"
            style={{ borderColor: BORDER, color: TEAL }}>
            {refresh === 'busy' ? '↻ Updating regional data…' : refresh === 'done' ? `✓ Updated ${updatedTick}` : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Regional KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map(k => (
          <Card key={k.label} className="p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-base" style={{ color: k.color }}>{k.icon}</span>
            </div>
            <div className="text-2xl font-bold leading-none mb-1" style={{ color: '#17212B' }}>
              {k.value}<span className="text-sm font-medium" style={{ color: '#8A9098' }}>{k.suffix ?? ''}</span>
            </div>
            <div className="text-xs font-medium" style={{ color: '#5A6670' }}>{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Command layout: map (2col) + critical situation */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2 overflow-hidden">
          <CardHeader title="Regional Situation Map" sub="North Eastern Region · districts, incidents, routes & logistics"
            action={
              <div className="flex items-center gap-1.5 flex-wrap">
                {['Risk', 'Incidents', 'Routes', 'Logistics', 'Weather'].map((c, i) => (
                  <button key={c} className="text-xs px-2 py-1 rounded border transition-colors"
                    style={{ borderColor: BORDER, color: i === 0 ? NAVY : '#5A6670', background: i === 0 ? SURFACE_2 : 'transparent' }}>
                    {c}
                  </button>
                ))}
              </div>
            } />
          <MapViz incidents={incidents} routes={liveRoutes} vehicles={liveVehicles} height={420} showLegend />
        </Card>

        {/* Critical situation panel */}
        <Card className="flex flex-col">
          <CardHeader title="Critical Situation" sub="Highest-priority regional events" />
          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: SURFACE_2 }}>
            {criticalList.map((c, i) => (
              <div key={`${c.title}-${i}`} className="px-4 py-3 animate-[fadeIn_.3s_ease]">
                <div className="flex items-center justify-between mb-1.5">
                  <SeverityBadge severity={c.sev} />
                  <span className="text-xs" style={{ color: '#8A9098' }}>{c.time}</span>
                </div>
                <div className="text-sm font-semibold mb-1.5" style={{ color: '#17212B' }}>{c.title}</div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mb-2">
                  {c.meta.map(([k, v]) => (
                    <span key={k} className="text-xs" style={{ color: '#5A6670' }}>
                      <span style={{ color: '#8A9098' }}>{k}: </span>{v}
                    </span>
                  ))}
                </div>
                <button className="text-xs font-medium px-2.5 py-1 rounded border transition-colors"
                  style={{ borderColor: BORDER, color: TEAL }}>{c.btn} →</button>
              </div>
            ))}
          </div>
          <div className="p-3 border-t" style={{ borderColor: BORDER }}>
            <button onClick={() => setPage?.('incidents')}
              className="w-full text-xs font-medium px-3 py-2 rounded transition-all"
              style={{ background: NAVY, color: 'white', minHeight: 40 }}>View All Critical Events</button>
          </div>
        </Card>
      </div>

      {/* Regional Risk Intelligence */}
      <Card>
        <CardHeader title="Regional Risk Intelligence"
          action={<span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#F5DFA8', color: '#7A6D2A' }}>✦ AI-generated risk estimate</span>} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4">
          {riskList.map((r, i) => {
            const score = i === 0 ? overall : r.score;
            return (
              <div key={r.label} className="rounded-lg border p-3" style={{ background: SURFACE_2, borderColor: BORDER }}>
                <div className="text-xs font-medium mb-1" style={{ color: '#5A6670' }}>{r.label}</div>
                <div className="flex items-baseline gap-1 mb-1.5">
                  {i === 0 && analyzing
                    ? <span className="text-sm animate-pulse" style={{ color: GOLD }}>✦ Analyzing…</span>
                    : <><span className="text-2xl font-bold transition-all" style={{ color: riskColor(score) }}>{score}</span>
                        <span className="text-xs" style={{ color: '#8A9098' }}>/100</span></>}
                </div>
                <div className="flex items-center justify-between">
                  <SeverityBadge severity={r.level} />
                  {i === 0 && !analyzing && <span className="text-xs font-semibold" style={{ color: '#BE2424' }}>+6</span>}
                </div>
                {r.trend && <div className="text-xs mt-1.5" style={{ color: '#BE2424' }}>{r.trend}</div>}
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: BORDER }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: riskColor(score) }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* District status + Live logistics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2">
          <CardHeader title="District Situation" sub="Regional comparison"
            action={<button onClick={() => setPage?.('analytics')} className="text-xs font-medium px-3 py-1.5 rounded border" style={{ borderColor: BORDER, color: TEAL }}>View All Districts →</button>} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: SURFACE_2 }}>
                  {['District', 'Risk', 'Access.', 'Incidents', 'Alerts', 'Routes', 'Logistics', 'Status'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A6670' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {districtRows.map((d, i) => (
                  <tr key={d.name} className="transition-colors cursor-pointer hover:bg-black/[0.02]"
                    style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(243,235,220,0.4)' }}>
                    <td className="px-3 py-2.5 text-xs font-medium" style={{ color: '#17212B' }}>{d.name}</td>
                    <td className="px-3 py-2.5"><SeverityBadge severity={d.risk} /></td>
                    <td className="px-3 py-2.5"><AccessibilityBadge score={d.acc} /></td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: '#17212B' }}>{d.inc}</td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: '#17212B' }}>{d.alerts}</td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: '#17212B' }}>{d.routes}</td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: '#5A6670' }}>{d.impact}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Live logistics */}
        <Card className="flex flex-col">
          <CardHeader title="Live Logistics"
            action={<span className="inline-flex items-center gap-1 text-xs" style={{ color: '#BE2424' }}><span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: '#BE2424' }} />LIVE</span>} />
          <div className="flex-1 divide-y" style={{ borderColor: SURFACE_2 }}>
            {liveVehicles.slice(0, 5).map(v => (
              <div key={v.id} className="px-4 py-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-semibold" style={{ color: TEAL }}>{v.id}</div>
                  <div className="text-xs" style={{ color: '#8A9098' }}>{v.route} → {v.destination}</div>
                </div>
                <StatusBadge status={v.status} />
                <SeverityBadge severity={v.risk} />
                <span className="text-xs w-10 text-right" style={{ color: '#5A6670' }}>{v.delay === 'None' ? 'ETA' : v.delay}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t flex items-center justify-between" style={{ borderColor: BORDER }}>
            <span className="text-xs" style={{ color: '#8A9098' }}>Last updated: 10 sec ago</span>
            <button onClick={() => setPage?.('logistics')} className="text-xs font-medium" style={{ color: TEAL }}>View Live Logistics →</button>
          </div>
        </Card>
      </div>

      {/* AI predictions + Priority actions + side column */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* AI predictions */}
        <Card>
          <CardHeader title="AI Predictions"
            action={<span style={{ color: GOLD }}>✦</span>} />
          <div className="p-4 space-y-3">
            {predictionRows.map(p => (
              <div key={p.title} className="rounded-lg border p-3" style={{ background: SURFACE_2, borderColor: BORDER }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold" style={{ color: '#17212B' }}>{p.title}</span>
                  <span className="text-xs font-bold" style={{ color: '#2D6B4F' }}>{p.confidence}%</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {p.rows.map(([k, v]) => (
                    <span key={k} className="text-xs" style={{ color: '#5A6670' }}><span style={{ color: '#8A9098' }}>{k}: </span>{v}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1 mt-1.5"><span style={{ color: GOLD }}>✦</span>
                  <span className="text-xs" style={{ color: '#8A9098' }}>AI-generated prediction</span></div>
              </div>
            ))}
            <button onClick={() => setPage?.('ai')} className="w-full text-xs font-medium px-3 py-2 rounded border" style={{ borderColor: BORDER, color: TEAL }}>View All Predictions →</button>
          </div>
        </Card>

        {/* Priority actions */}
        <Card>
          <CardHeader title="Priority Actions" sub="Recommended next steps" />
          <div className="divide-y" style={{ borderColor: SURFACE_2 }}>
            {priorityActions.map((a, i) => (
              <div key={`${a.label}-${i}`} className="px-4 py-3 flex items-center gap-3">
                <SeverityBadge severity={a.sev} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium" style={{ color: '#17212B' }}>{a.label}</div>
                  <div className="text-xs" style={{ color: '#8A9098' }}>{a.loc} · {a.time}</div>
                </div>
                <button className="text-xs font-medium px-2.5 py-1 rounded border" style={{ borderColor: BORDER, color: TEAL, minHeight: 32 }}>Review</button>
              </div>
            ))}
          </div>
        </Card>

        {/* Right column: alert summary + regional accessibility */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="Alert Summary"
              action={<button onClick={() => setPage?.('alerts')} className="text-xs font-medium" style={{ color: TEAL }}>View Alerts →</button>} />
            <div className="grid grid-cols-2 gap-3 p-4">
              {alertSummary.map(a => (
                <div key={a.label} className="rounded-lg border p-3" style={{ background: SURFACE_2, borderColor: BORDER }}>
                  <div className="text-2xl font-bold leading-none mb-1" style={{ color: '#17212B' }}>{String(a.value).padStart(2, '0')}</div>
                  <SeverityBadge severity={a.sev} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Regional Accessibility" />
            <div className="p-4">
              <div className="flex items-end justify-between mb-2">
                <div className="text-3xl font-bold leading-none" style={{ color: '#C25A1A' }}>{regionalAccessibility}<span className="text-sm" style={{ color: '#8A9098' }}>/100</span></div>
                <SeverityBadge severity={regionalAccessibility >= 75 ? 'MODERATE' : 'HIGH'} />
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: BORDER }}>
                <div className="h-full rounded-full" style={{ width: `${regionalAccessibility}%`, background: '#C25A1A' }} />
              </div>
              {[
                ['Fully Accessible', Math.max(20, regionalAccessibility), '#2D6B4F'],
                ['Partially Accessible', Math.max(18, Math.round((100 - regionalAccessibility) * 0.6)), '#C4861A'],
                ['Restricted', Math.max(10, 100 - Math.max(20, regionalAccessibility) - Math.max(18, Math.round((100 - regionalAccessibility) * 0.6))), '#BE2424'],
              ].map(([l, v, c]) => (
                <div key={l as string} className="flex items-center justify-between text-xs py-1" style={{ color: '#5A6670' }}>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: c as string }} />{l}</span>
                  <span className="font-medium" style={{ color: '#17212B' }}>{v}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick actions bar */}
      <Card className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider mr-1" style={{ color: '#8A9098' }}>Quick Actions</span>
          {QUICK.map(q => (
            <button key={q} className="text-xs font-medium px-3 py-1.5 rounded border transition-colors"
              style={{ borderColor: BORDER, color: '#5A6670', minHeight: 36 }}
              onMouseEnter={e => (e.currentTarget.style.color = NAVY)}
              onMouseLeave={e => (e.currentTarget.style.color = '#5A6670')}>
              {q}
            </button>
          ))}
        </div>
      </Card>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
