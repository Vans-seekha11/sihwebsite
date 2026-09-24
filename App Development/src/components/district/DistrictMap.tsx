// District-scope map surface — boundary, roads, blocked roads, risk zones,
// incidents, vehicles, infrastructure, alternates. Flat, no shadows.
import { Warning, Truck } from "../icons";

const NAVY = "#0e2a47";
const RED = "#b3261e";
const GREEN = "#1e6b45";
const SAFF = "#d97a1f";
const ROAD = "#c9cbc4";

export type Layer = "roads" | "risk" | "incidents" | "vehicles" | "infra";

export function DistrictMap({
  layers,
  height = 240,
}: {
  layers: Record<Layer, boolean>;
  height?: number;
}) {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 390 240"
      preserveAspectRatio="xMidYMid slice"
      style={{ height }}
    >
      <rect width={390} height={240} fill="#eceee7" />

      {/* district boundary */}
      <path
        d="M22 20 C 110 8, 300 12, 366 40 C 380 96, 372 194, 342 222 C 280 236, 90 230, 34 210 C 10 168, 12 66, 22 20Z"
        stroke="#b9bcb4"
        strokeWidth={1.5}
        fill="none"
        strokeDasharray="6 5"
      />
      <text x={30} y={34} fontFamily="'Public Sans'" fontSize={11} fontWeight={700} fill="#8a8f88">
        Ri Bhoi · Meghalaya
      </text>

      {/* flood / landslide zones */}
      {layers.risk && (
        <>
          <ellipse cx={286} cy={72} rx={44} ry={30} fill={RED} opacity={0.1} />
          <ellipse cx={286} cy={72} rx={44} ry={30} fill="none" stroke={RED} strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
          <text x={286} y={44} fontFamily="'Noto Sans'" fontSize={10} fontWeight={600} fill={RED} textAnchor="middle">
            Landslide zone
          </text>
          <ellipse cx={110} cy={168} rx={50} ry={28} fill={SAFF} opacity={0.12} />
          <text x={110} y={200} fontFamily="'Noto Sans'" fontSize={10} fontWeight={600} fill={SAFF} textAnchor="middle">
            Flood zone
          </text>
        </>
      )}

      {/* roads */}
      {layers.roads && (
        <g fill="none" strokeLinecap="round">
          <path d="M-10 150 C 90 130, 180 120, 250 96 C 300 78, 340 70, 400 60" stroke={ROAD} strokeWidth={6} />
          <path d="M60 -10 C 90 80, 70 160, 120 250" stroke={ROAD} strokeWidth={5} />
          <path d="M-10 150 C 90 130, 180 120, 250 96" stroke={GREEN} strokeWidth={5} />
          {/* caution segment */}
          <path d="M250 96 C 270 88, 282 82, 300 74" stroke={SAFF} strokeWidth={5} />
          {/* blocked road (red) */}
          <path d="M300 74 C 320 66, 335 62, 360 58" stroke={RED} strokeWidth={5.5} />
          {/* alternate (green dashed) */}
          <path d="M250 96 C 290 130, 330 110, 360 58" stroke={GREEN} strokeWidth={4} strokeDasharray="8 7" />
        </g>
      )}

      {/* infrastructure */}
      {layers.infra && (
        <>
          <rect x={244} y={90} width={11} height={11} fill={NAVY} />
          <text x={230} y={116} fontFamily="'Noto Sans'" fontSize={10} fill="#5b6472">Umiam depot</text>
          <circle cx={110} cy={150} r={4} fill="none" stroke={NAVY} strokeWidth={1.6} />
          <text x={92} y={140} fontFamily="'Noto Sans'" fontSize={10} fill="#5b6472">Bridge</text>
        </>
      )}

      {/* incidents */}
      {layers.incidents && (
        <>
          <g transform="translate(300 74)">
            <circle r={11} fill="#fff" stroke={RED} strokeWidth={2.2} />
            <g transform="translate(-7 -7)"><Warning size={14} className="text-[#b3261e]" /></g>
          </g>
          <g transform="translate(110 168)">
            <circle r={10} fill="#fff" stroke={SAFF} strokeWidth={2.2} />
            <g transform="translate(-6 -6)"><Warning size={12} className="text-[#d97a1f]" /></g>
          </g>
        </>
      )}

      {/* vehicles */}
      {layers.vehicles && (
        <>
          <g transform="translate(180 118)">
            <circle r={10} fill={NAVY} />
            <g transform="translate(-7 -6)"><Truck size={13} className="text-white" /></g>
          </g>
          <g transform="translate(250 96)">
            <circle r={10} fill={NAVY} />
            <g transform="translate(-7 -6)"><Truck size={13} className="text-white" /></g>
          </g>
        </>
      )}
    </svg>
  );
}

// Map legend — color + icon + text, never color alone.
export function MapLegend() {
  const rows = [
    { c: GREEN, label: "Clear road" },
    { c: SAFF, label: "Caution" },
    { c: RED, label: "Blocked / high risk" },
    { c: GREEN, label: "Alternate", dashed: true },
  ];
  return (
    <div className="rounded-md border border-hairline bg-white px-3 py-2.5">
      <p className="mb-1.5 font-public text-[12px] font-bold text-navy">Legend</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span
              className="h-[3px] w-5 shrink-0 rounded-full"
              style={
                r.dashed
                  ? { backgroundImage: `repeating-linear-gradient(90deg, ${r.c} 0 4px, transparent 4px 7px)` }
                  : { background: r.c }
              }
            />
            <span className="font-noto text-[12px] text-ink">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
