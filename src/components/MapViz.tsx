import { useEffect, useState } from 'react';
import type { Incident, Route, Vehicle } from '@/data/demo';

interface MapVizProps {
  incidents?: Incident[];
  routes?: Route[];
  vehicles?: Vehicle[];
  height?: number;
  showLegend?: boolean;
}

/* Fixed screen positions for each route/marker on a 960×640 canvas */
const routeCoords: Record<string, { path: string; labelX: number; labelY: number }> = {
  'NH-27':  { path: 'M 55 560 Q 190 500 355 415 Q 495 335 675 270 Q 778 232 880 194', labelX: 450, labelY: 353 },
  'NH-2':   { path: 'M 115 75 Q 238 178 375 275 Q 515 375 598 495 Q 648 565 698 638', labelX: 375, labelY: 255 },
  'NH-306': { path: 'M 818 95 Q 748 198 675 308 Q 618 398 538 498 Q 478 575 428 658', labelX: 656, labelY: 288 },
  'NH-6':   { path: 'M 78 318 Q 198 348 338 368 Q 478 388 618 418 Q 738 448 848 468', labelX: 448, labelY: 378 },
  'NH-13':  { path: 'M 748 55 Q 728 148 718 248 Q 708 358 698 468 Q 688 558 678 638', labelX: 718, labelY: 196 },
  'NH-40':  { path: 'M 138 198 Q 278 228 398 248 Q 518 268 658 288', labelX: 398, labelY: 238 },
  'NH-10':  { path: 'M 858 398 Q 798 438 738 478 Q 678 518 598 558', labelX: 738, labelY: 458 },
};

const incidentMarkers: Record<string, { x: number; y: number }> = {
  'INC-2026-041': { x: 318, y: 428 },
  'INC-2026-042': { x: 438, y: 308 },
  'INC-2026-043': { x: 598, y: 468 },
  'INC-2026-044': { x: 198, y: 368 },
  'INC-2026-045': { x: 718, y: 178 },
};

const vehicleMarkers: Record<string, { x: number; y: number }> = {
  'LG-102': { x: 478, y: 298 },
  'LG-115': { x: 558, y: 438 },
  'LG-089': { x: 698, y: 388 },
  'LG-134': { x: 558, y: 258 },
  'LG-098': { x: 778, y: 478 },
  'LG-121': { x: 518, y: 338 },
};

const severityColor: Record<string, string> = {
  CRITICAL: '#BE2424', HIGH: '#E07840', MODERATE: '#C4861A', LOW: '#2D6B4F',
};
const routeColor: Record<string, string> = {
  Open: '#2D6B4F', Restricted: '#E07840', Blocked: '#C25A1A', Closed: '#BE2424',
};

export default function MapViz({
  incidents = [], routes = [], vehicles = [],
  height = 480, showLegend = true,
}: MapVizProps) {
  const activeRouteIds = new Set(routes.map(r => r.id));
  const activeVehicleIds = new Set(vehicles.map(v => v.id));
  const activeIncidentIds = new Set(incidents.map(i => i.id));

  // Brief themed GPS/location acquisition state on mount
  const [locating, setLocating] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLocating(false), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative overflow-hidden" style={{ height, borderRadius: '0 0 12px 12px' }}>
      {/* GPS / location loading overlay */}
      {locating && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
          style={{ background: 'rgba(238,242,245,0.72)', backdropFilter: 'blur(3px)' }}>
          <div className="ui-gps"><span className="ui-gps-pin">◉</span></div>
          <div className="text-xs font-medium tracking-wide" style={{ color: '#17324D' }}>
            Acquiring location signal…
          </div>
        </div>
      )}
      <div className={locating ? '' : 'ui-page'} style={{ height: '100%' }}>
      <svg
        viewBox="0 0 960 640"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Exact match to image gradient: warm peach-ochre top-left → cool sage bottom-right */}
          <linearGradient id="mapBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#D0956A" />
            <stop offset="35%"  stopColor="#DFCBA8" />
            <stop offset="70%"  stopColor="#CFCEC0" />
            <stop offset="100%" stopColor="#BFD0C0" />
          </linearGradient>

          {/* Softer pulsing glow for active incident markers */}
          <radialGradient id="pulseGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#E07840" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#E07840" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width="960" height="640" fill="url(#mapBg)" />

        {/* Topographic contour lines — warm brown, matching image style */}
        <g stroke="#6E5030" strokeWidth="0.7" fill="none" opacity="0.14">
          {/* Terrain hill 1 — centre */}
          <ellipse cx="375" cy="415" rx="305" ry="185" />
          <ellipse cx="375" cy="415" rx="245" ry="145" />
          <ellipse cx="375" cy="415" rx="185" ry="108" />
          <ellipse cx="375" cy="415" rx="125" ry="70" />
          <ellipse cx="375" cy="415" rx="68"  ry="38" />
          {/* Terrain hill 2 — lower-left */}
          <ellipse cx="158" cy="575" rx="225" ry="135" />
          <ellipse cx="158" cy="575" rx="165" ry="95" />
          <ellipse cx="158" cy="575" rx="105" ry="58" />
          <ellipse cx="158" cy="575" rx="52"  ry="30" />
          {/* Terrain hill 3 — upper-right */}
          <ellipse cx="778" cy="148" rx="255" ry="162" />
          <ellipse cx="778" cy="148" rx="195" ry="122" />
          <ellipse cx="778" cy="148" rx="135" ry="82" />
          <ellipse cx="778" cy="148" rx="72"  ry="46" />
          {/* Terrain hill 4 — lower-right */}
          <ellipse cx="818" cy="518" rx="205" ry="135" />
          <ellipse cx="818" cy="518" rx="145" ry="92" />
          <ellipse cx="818" cy="518" rx="82"  ry="52" />
        </g>

        {/* District boundary — dashed */}
        <path
          d="M 78 78 Q 200 58 380 68 Q 560 78 722 58 Q 862 48 902 120 Q 932 202 922 342 Q 912 462 902 562 Q 882 622 802 640 Q 682 640 562 640 Q 402 640 242 638 Q 122 636 58 580 Q 28 520 38 400 Q 48 258 78 78 Z"
          fill="none" stroke="#5A7A6A" strokeWidth="1.2" strokeDasharray="8,5" opacity="0.4"
        />

        {/* Route paths */}
        {Object.entries(routeCoords).map(([id, coords]) => {
          const route = routes.find(r => r.id === id);
          if (routes.length > 0 && !activeRouteIds.has(id)) return null;
          const color = route ? (routeColor[route.status] ?? '#8A9A88') : '#9A9A90';
          const isBlocked = route?.status === 'Blocked' || route?.status === 'Closed';
          return (
            <g key={id}>
              {/* Shadow/glow for at-risk routes */}
              {(route?.status === 'Blocked' || route?.status === 'Closed') && (
                <path d={coords.path} fill="none" stroke={color} strokeWidth={6} opacity={0.15} />
              )}
              <path
                d={coords.path}
                fill="none"
                stroke={color}
                strokeWidth={isBlocked ? 2.5 : 1.8}
                strokeDasharray={isBlocked ? '5,4' : undefined}
                opacity={0.88}
                strokeLinecap="round"
              />
              {route && (
                <text
                  x={coords.labelX} y={coords.labelY - 7}
                  textAnchor="middle"
                  style={{ fontSize: 9.5, fill: color, fontFamily: 'Inter', fontWeight: 600, letterSpacing: 0.5 }}
                >
                  {id}
                </text>
              )}
            </g>
          );
        })}

        {/* Vehicle markers */}
        {vehicles.map(v => {
          const pos = vehicleMarkers[v.id];
          if (!pos || !activeVehicleIds.has(v.id)) return null;
          const color = v.risk === 'CRITICAL' ? '#BE2424' : v.risk === 'HIGH' ? '#E07840' : v.risk === 'MODERATE' ? '#C4861A' : '#2D6B4F';
          return (
            <g key={v.id}>
              <rect x={pos.x - 15} y={pos.y - 9} width={30} height={18} rx={3}
                fill="rgba(250,247,240,0.92)" stroke={color} strokeWidth={1.5} />
              <text x={pos.x} y={pos.y + 5} textAnchor="middle"
                style={{ fontSize: 8, fill: color, fontFamily: 'Inter', fontWeight: 700 }}>
                {v.id}
              </text>
            </g>
          );
        })}

        {/* Incident markers */}
        {incidents.map(inc => {
          const pos = incidentMarkers[inc.id];
          if (!pos || !activeIncidentIds.has(inc.id)) return null;
          const color = severityColor[inc.severity] ?? '#E07840';
          const isPending = inc.status === 'PENDING_VERIFICATION';
          return (
            <g key={inc.id}>
              {/* Pulsing glow ring — matches image orange ring exactly */}
              {isPending && (
                <>
                  <circle cx={pos.x} cy={pos.y} r={18} fill={color} opacity={0.12} />
                  <circle cx={pos.x} cy={pos.y} fill="none" stroke={color} strokeWidth={1.6}
                    className="ui-map-ring" style={{ color } as React.CSSProperties} />
                </>
              )}
              {/* Core dot — matches image style */}
              <circle cx={pos.x} cy={pos.y} r={5.5} fill={color} stroke="white" strokeWidth={2} />
              <text x={pos.x + 11} y={pos.y + 4}
                style={{ fontSize: 9, fill: '#17212B', fontFamily: 'Inter', fontWeight: 500, opacity: 0.8 }}>
                {inc.type}
              </text>
            </g>
          );
        })}

        {/* Safe location markers — matches image's dark green concentric rings */}
        {routes.filter(r => r.status === 'Open').slice(0, 2).map((r, i) => {
          const positions = [{ x: 788, y: 252 }, { x: 228, y: 668 }];
          const pos = positions[i];
          if (!pos) return null;
          return (
            <g key={r.id}>
              <circle cx={pos.x} cy={pos.y} r={10} fill="none" stroke="#2D6B4F" strokeWidth={1.5} opacity={0.5} />
              <circle cx={pos.x} cy={pos.y} r={5.5} fill="#2D6B4F" stroke="white" strokeWidth={2} />
            </g>
          );
        })}

        {/* DEMO DATA attribution */}
        <text x={16} y={626}
          style={{ fontSize: 8.5, fill: '#5A6670', fontFamily: 'Inter', letterSpacing: 0.3, opacity: 0.7 }}>
          DEMO DATA · NER District Operations · Ministry of Development of North Eastern Region · Government of India
        </text>
      </svg>
      </div>

      {/* Map controls — floating over gradient */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        {['+', '−', '⊕', '≡'].map(ctrl => (
          <button key={ctrl}
            className="w-8 h-8 flex items-center justify-center rounded text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: 'rgba(250,250,251,0.92)', border: '1px solid rgba(150,165,180,0.6)', color: '#17324D', backdropFilter: 'blur(4px)' }}>
            {ctrl}
          </button>
        ))}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-8 left-3 rounded-md shadow-sm p-2.5 text-xs"
          style={{ background: 'rgba(250,247,240,0.90)', border: '1px solid rgba(200,186,164,0.6)', minWidth: 148, backdropFilter: 'blur(4px)' }}>
          <div className="font-semibold mb-2 text-xs uppercase tracking-wider" style={{ color: '#8A9098' }}>Legend</div>
          <div className="space-y-1.5">
            {[
              { color: '#2D6B4F', label: 'Open Route', line: true },
              { color: '#E07840', label: 'Restricted', line: true },
              { color: '#BE2424', label: 'Closed / Blocked', line: true },
              { color: '#BE2424', label: 'Critical Incident', dot: true },
              { color: '#E07840', label: 'Active Incident', dot: true },
              { color: '#2D6B4F', label: 'Safe Zone', dot: true },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                {item.dot
                  ? <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm flex-shrink-0" style={{ background: item.color }} />
                  : <div className="w-5 h-0.5 rounded flex-shrink-0" style={{ background: item.color }} />
                }
                <span style={{ color: '#5A6670' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
