import { Warning } from "./icons";

export function HomeMap() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 390 240"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width={390} height={240} fill="#eceee7" />
      {/* district boundary */}
      <path
        d="M22 18 C 100 6, 295 10, 368 36 C 382 92, 376 196, 348 224 C 285 238, 88 232, 32 213 C 8 172, 12 62, 22 18Z"
        stroke="#d5d7d0"
        strokeWidth={1.5}
        fill="none"
        strokeDasharray="6 5"
      />
      <g stroke="#e2e3dc" strokeWidth={2} fill="none" opacity={0.9}>
        <path d="M-10 60 C 90 35, 200 75, 400 45" />
        <path d="M-10 120 C 110 95, 230 135, 400 105" />
        <path d="M-10 185 C 120 160, 250 200, 400 172" />
      </g>
      {/* SH-5 side road */}
      <path d="M168 148 C 162 178, 156 210, 153 240" stroke={ROAD} strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* NH-6 clear segment */}
      <path d="M52 218 C 88 196, 128 175, 168 148" stroke={GREEN} strokeWidth={7} fill="none" strokeLinecap="round" />
      {/* NH-6 caution segment */}
      <path d="M168 148 C 208 120, 238 102, 265 80" stroke="#d97a1f" strokeWidth={7} fill="none" strokeLinecap="round" />
      {/* NH-6 high-risk segment */}
      <path d="M265 80 C 287 64, 302 48, 318 30" stroke={RED} strokeWidth={7} fill="none" strokeLinecap="round" />
      {/* Umiam junction node */}
      <circle cx={168} cy={148} r={6} fill="#fff" stroke={NAVY} strokeWidth={2} />
      {/* Officer position */}
      <circle cx={220} cy={114} r={13} fill={NAVY} />
      <path d="M220 109 l-4 5 4-10 4 10Z" fill="#fff" />
      <MapLabel x={36} y={232} size={11} fill="#6b7280">Jorabat</MapLabel>
      <MapLabel x={150} y={165} size={11} bold fill="#5b6472">Umiam</MapLabel>
      <MapLabel x={268} y={66} size={11} fill={RED}>Km 31–34</MapLabel>
      <MapLabel x={118} y={94} size={13} bold fill="#5b6472">NH-6</MapLabel>
      <MapLabel x={272} y={180} size={12} fill="#9aa0a8">Ri Bhoi</MapLabel>
      <MapLabel x={272} y={195} size={10} fill="#b0b5b0">district</MapLabel>
    </svg>
  );
}

const NAVY = "#0e2a47";
const RED = "#b3261e";
const GREEN = "#1e6b45";
const ROAD = "#c9cbc4";

// Faint terrain contour lines shared by the map surfaces.
function Terrain() {
  return (
    <g stroke="#e2e3dc" strokeWidth={2} fill="none" opacity={0.9}>
      <path d="M-10 70 C 90 40, 200 90, 400 55" />
      <path d="M-10 130 C 110 100, 230 150, 400 115" />
      <path d="M-10 200 C 120 170, 250 215, 400 185" />
      <path d="M-10 280 C 130 250, 260 295, 400 265" />
      <path d="M-10 360 C 130 330, 260 375, 400 345" />
      <path d="M-10 440 C 130 410, 260 455, 400 425" />
    </g>
  );
}

function MapLabel({
  x,
  y,
  children,
  bold,
  size = 12,
  fill = "#5b6472",
  anchor = "start",
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  bold?: boolean;
  size?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      fontFamily="'Noto Sans', sans-serif"
      fontSize={size}
      fontWeight={bold ? 700 : 500}
      fill={fill}
      textAnchor={anchor}
    >
      {children}
    </text>
  );
}

// Boxed callout label with a hairline border.
function Tag({
  x,
  y,
  text,
  color = NAVY,
  border = "rgba(91,100,114,0.35)",
}: {
  x: number;
  y: number;
  text: string;
  color?: string;
  border?: string;
}) {
  const w = text.length * 6.6 + 16;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={22}
        rx={4}
        fill="#ffffff"
        stroke={border}
      />
      <text
        x={x + 8}
        y={y + 15}
        fontFamily="'Public Sans', sans-serif"
        fontSize={12}
        fontWeight={600}
        fill={color}
      >
        {text}
      </text>
    </g>
  );
}

export function IdleMap() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 390 460"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width={390} height={460} fill="#eceee7" />
      <Terrain />
      <path d="M60 -10 C 120 120, 90 260, 150 470" stroke={ROAD} strokeWidth={7} fill="none" />
      <path d="M330 -10 C 300 140, 360 300, 300 470" stroke={ROAD} strokeWidth={7} fill="none" />
      {/* active navy route */}
      <path
        d="M200 470 C 180 360, 230 300, 205 210 C 190 150, 230 90, 215 -10"
        stroke={NAVY}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={200} cy={430} r={11} fill={NAVY} />
      <path d="M200 435 l-4 4 4-8 4 8Z" fill="#fff" />
      <MapLabel x={250} y={150} fill="#8a8f88">
        Jaintia Hills
      </MapLabel>
    </svg>
  );
}

export function RiskMap() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 390 300"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width={390} height={300} fill="#eceee7" />
      <Terrain />
      {/* side roads */}
      <path d="M150 -10 C 175 90, 120 200, 155 310" stroke={ROAD} strokeWidth={7} fill="none" />
      <path d="M245 190 C 250 240, 235 280, 250 320" stroke={ROAD} strokeWidth={7} fill="none" />

      {/* original route: dashed navy */}
      <path
        d="M210 270 C 205 220, 235 195, 238 168"
        stroke={NAVY}
        strokeWidth={4.5}
        strokeDasharray="9 8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M238 168 C 240 130, 225 95, 245 55"
        stroke={NAVY}
        strokeWidth={4.5}
        strokeDasharray="9 8"
        fill="none"
        strokeLinecap="round"
      />
      {/* high-risk red segment */}
      <path
        d="M245 130 C 255 105, 250 80, 258 45"
        stroke={RED}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      {/* green alternate */}
      <path
        d="M210 270 C 150 250, 120 215, 165 190 C 200 172, 220 180, 238 168"
        stroke={GREEN}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />

      {/* vehicle */}
      <circle cx={210} cy={270} r={13} fill={NAVY} />
      <path d="M210 265 l-5 6 5-10 5 10Z" fill="#fff" />

      {/* Km 26 junction node */}
      <circle cx={238} cy={168} r={7} fill="#fff" stroke={NAVY} strokeWidth={2.5} />
      <MapLabel x={252} y={166} bold>
        Km 26 jn.
      </MapLabel>
      <MapLabel x={252} y={182} size={11}>
        Lubha bridge
      </MapLabel>

      {/* high-risk marker + tag */}
      <g transform="translate(248 100)">
        <circle r={13} fill="#fff" stroke={RED} strokeWidth={2.5} />
        <g transform="translate(-8 -8)">
          <Warning size={16} className="text-[#b3261e]" />
        </g>
      </g>
      <Tag x={268} y={90} text="High risk Km 31–34" color={RED} border="rgba(179,38,30,0.5)" />

      <Tag x={40} y={165} text="Alternate proposed" color={GREEN} border="rgba(30,107,69,0.5)" />

      <MapLabel x={90} y={225} fill="#8a8f88">
        Lubha R.
      </MapLabel>
      <MapLabel x={40} y={242} size={11} fill="#9aa0a8">
        Reserve forest
      </MapLabel>
      <MapLabel x={255} y={250} fill="#8a8f88">
        Umkiang
      </MapLabel>
      <MapLabel x={12} y={190} fill="#9aa0a8">
        SH
      </MapLabel>
    </svg>
  );
}

// Screen 3 — confirmed. `draw` triggers the hero route-redraw animation.
export function ConfirmedMap({ draw }: { draw: boolean }) {
  const greenRoute =
    "M300 110 C 300 175, 250 220, 258 300 C 262 350, 150 345, 142 405 C 133 470, 300 455, 300 485 L 288 560";
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 390 560"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width={390} height={560} fill="#eceee7" />
      <ellipse cx={320} cy={230} rx={140} ry={120} fill="#e7e9df" />
      <Terrain />
      {/* side roads */}
      <path d="M150 -10 C 175 120, 120 320, 165 570" stroke={ROAD} strokeWidth={7} fill="none" />
      <path d="M-10 460 C 120 440, 260 470, 400 450" stroke={ROAD} strokeWidth={6} fill="none" />

      {/* avoided segment — grey dashed */}
      <path
        d="M258 300 C 258 350, 262 400, 262 445"
        stroke="#9aa0a8"
        strokeWidth={4.5}
        strokeDasharray="7 8"
        fill="none"
        strokeLinecap="round"
      />

      {/* confirmed green route (hero redraw) */}
      <path
        d={greenRoute}
        stroke={GREEN}
        strokeWidth={5.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={
          draw
            ? {
                // @ts-expect-error CSS var
                "--dash-len": "1400",
                strokeDasharray: 1400,
                animation: "drawPath 1.15s ease-out forwards",
              }
            : undefined
        }
      />

      {/* Sonapur node (square) */}
      <rect x={294} y={104} width={12} height={12} fill={NAVY} />
      <MapLabel x={314} y={110} bold>
        Sonapur
      </MapLabel>
      <MapLabel x={314} y={126} size={11}>
        relief depot
      </MapLabel>

      {/* Lumshnong node */}
      <circle cx={258} cy={300} r={7} fill="#fff" stroke={GREEN} strokeWidth={2.5} />
      <MapLabel x={272} y={298} bold>
        Lumshnong
      </MapLabel>
      <MapLabel x={272} y={314} size={11}>
        bypass entry
      </MapLabel>

      {/* avoided marker + tag */}
      <g transform="translate(262 455)">
        <circle r={13} fill="#fff" stroke="#9aa0a8" strokeWidth={2.5} />
        <g transform="translate(-8 -8)">
          <Warning size={16} className="text-[#9aa0a8]" />
        </g>
      </g>
      <Tag x={282} y={392} text="Avoided Km 31–34" color="#5b6472" />

      {/* Km 26 junction */}
      <circle cx={300} cy={485} r={7} fill="#fff" stroke={GREEN} strokeWidth={2.5} />
      <MapLabel x={314} y={483} bold>
        Km 26 jn.
      </MapLabel>
      <MapLabel x={314} y={499} size={11}>
        Lubha bridge
      </MapLabel>

      {/* vehicle */}
      <circle cx={286} cy={545} r={13} fill={NAVY} />
      <path d="M286 540 l-5 6 5-10 5 10Z" fill="#fff" />

      <Tag x={70} y={520} text="Clear · bypass" color={GREEN} border="rgba(30,107,69,0.5)" />

      <MapLabel x={330} y={220} fill="#8a8f88">
        Jaintia Hills
      </MapLabel>
      <MapLabel x={330} y={236} size={11} fill="#9aa0a8">
        1,412 m
      </MapLabel>
      <MapLabel x={190} y={190} bold fill="#7a8088">
        NH-6
      </MapLabel>
      <MapLabel x={330} y={300} size={11} fill="#9aa0a8">
        PMGSY link
      </MapLabel>
      <MapLabel x={12} y={470} fill="#9aa0a8">
        SH-11
      </MapLabel>
    </svg>
  );
}
