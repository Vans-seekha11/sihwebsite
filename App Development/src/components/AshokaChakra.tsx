// Ashoka Chakra — the 24-spoke national wheel, rendered as crisp SVG.
// Proportions follow the Bureau of Indian Standards specification.
// Use with the existing spinSlow keyframe for rotation.

export function AshokaChakra({
  size,
  color = "#0E2A47",
}: {
  size: number;
  color?: string;
}) {
  const N = 24;
  const CX = size / 2;
  const CY = size / 2;

  // Radii — calibrated to match BIS Ashoka Chakra proportions
  const R_OUTER = size * 0.462; // outer edge of rim
  const RIM_W  = size * 0.072; // rim thickness (~D/14)
  const R_RIM  = R_OUTER - RIM_W; // inner edge of rim
  const R_HUB  = size * 0.088; // hub circle radius (~D/11)

  // Spoke width — tapers from hub to tip
  const SW_HUB = size * 0.0155; // half-width at hub (base)
  const SW_TIP = size * 0.007;  // half-width at rim (tip)

  // Between-spoke dart shapes at inner rim edge
  const DART_HALF_ANG = (Math.PI * 5.8) / 180; // ±5.8° base spread
  const DART_DEPTH    = size * 0.058;            // inward depth of dart tip

  const STEP = (2 * Math.PI) / N; // 15° in radians

  // Build spoke polygons and dart paths in one pass
  const spokePts: string[] = [];
  const dartDs:   string[] = [];

  for (let i = 0; i < N; i++) {
    const a = i * STEP - Math.PI / 2; // start at 12-o'clock
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    // Perpendicular to spoke direction (for width)
    const cp = -sa;
    const sp =  ca;

    // Spoke: trapezoid (wider at hub, narrower at rim)
    spokePts.push(
      [
        `${f(CX + R_HUB * ca - SW_HUB * cp)},${f(CY + R_HUB * sa - SW_HUB * sp)}`,
        `${f(CX + R_HUB * ca + SW_HUB * cp)},${f(CY + R_HUB * sa + SW_HUB * sp)}`,
        `${f(CX + R_RIM * ca + SW_TIP * cp)},${f(CY + R_RIM * sa + SW_TIP * sp)}`,
        `${f(CX + R_RIM * ca - SW_TIP * cp)},${f(CY + R_RIM * sa - SW_TIP * sp)}`,
      ].join(" "),
    );

    // Dart: triangle centered between spoke i and i+1
    const da = a + STEP / 2;
    const a1 = da - DART_HALF_ANG;
    const a2 = da + DART_HALF_ANG;
    const bx1 = CX + R_RIM * Math.cos(a1);
    const by1 = CY + R_RIM * Math.sin(a1);
    const bx2 = CX + R_RIM * Math.cos(a2);
    const by2 = CY + R_RIM * Math.sin(a2);
    const tx  = CX + (R_RIM - DART_DEPTH) * Math.cos(da);
    const ty  = CY + (R_RIM - DART_DEPTH) * Math.sin(da);
    dartDs.push(`M${f(bx1)},${f(by1)}L${f(bx2)},${f(by2)}L${f(tx)},${f(ty)}Z`);
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ashoka Chakra"
    >
      {/* Outer ring — rendered as a stroked annulus for crisp edges */}
      <circle
        cx={CX}
        cy={CY}
        r={R_OUTER - RIM_W / 2}
        stroke={color}
        strokeWidth={RIM_W}
        fill="none"
      />

      {/* 24 spokes */}
      {spokePts.map((pts, i) => (
        <polygon key={`sp${i}`} points={pts} fill={color} />
      ))}

      {/* 24 dart shapes between spokes at inner rim */}
      {dartDs.map((d, i) => (
        <path key={`dt${i}`} d={d} fill={color} />
      ))}

      {/* Centre hub */}
      <circle cx={CX} cy={CY} r={R_HUB} fill={color} />

      {/* Tiny centre recess — gives the hub visual depth without decoration */}
      <circle cx={CX} cy={CY} r={R_HUB * 0.28} fill={color} opacity="0.35" />
    </svg>
  );
}

// Watermark variant — same geometry, very low opacity, used behind the glass card.
export function AshokaChakraWatermark({ size }: { size: number }) {
  return (
    <div style={{ opacity: 0.06 }}>
      <AshokaChakra size={size} color="#0E2A47" />
    </div>
  );
}

function f(n: number) {
  return n.toFixed(2);
}
