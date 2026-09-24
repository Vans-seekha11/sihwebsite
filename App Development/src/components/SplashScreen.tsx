// Splash / launch screen — shown once before Login, unique tricolor background.
import { AshokaChakra } from "./AshokaChakra";

// Gradient: muted saffron → warm paper → deep green. "Official document" register.
const GRADIENT =
  "linear-gradient(to bottom," +
  "#B8762A 0%," +
  "#C07A2E 8%," +
  "#D4A870 22%," +
  "#EEE5D5 37%," +
  "#EDE3D2 52%," +
  "#C8D8C0 66%," +
  "#4A8860 80%," +
  "#2C5C40 92%," +
  "#1E4832 100%)";

export default function SplashScreen({
  onLogIn,
  onCreateAccount,
}: {
  onLogIn: (e: React.MouseEvent) => void;
  onCreateAccount: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* ── Tricolor background ── */}
      <div className="absolute inset-0" style={{ background: GRADIENT }} />

      {/* ── Contour + route glyph overlay ── */}
      <ContourOverlay />

      {/* ── All content above the background ── */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-3.5">
          <span className="font-public text-[15px] font-bold text-navy">09:41</span>
          <div className="flex items-center gap-1.5 text-navy opacity-80">
            <StatusBar />
          </div>
        </div>

        {/* Top strip: access class + live indicator */}
        <div className="flex items-center justify-between px-5 pt-2 pb-1">
          <span
            className="font-public font-semibold text-navy/60"
            style={{ fontSize: 10.5, letterSpacing: "0.11em", textTransform: "uppercase" }}
          >
            Restricted · Provisioned access
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-[7px] w-[7px] rounded-full bg-[#1e6b45]" />
            <span
              className="font-public font-semibold text-navy/60"
              style={{ fontSize: 10.5, letterSpacing: "0.11em", textTransform: "uppercase" }}
            >
              System live
            </span>
          </span>
        </div>

        {/* ── Center group — emblem + heading + subtitle + language ── */}
        <div className="flex flex-1 flex-col items-center justify-center px-7 pb-4">
          {/* Rotating Ashoka Chakra */}
          <div style={{ animation: "spinSlow 18s linear infinite", transformOrigin: "center center" }}>
            <AshokaChakra size={130} />
          </div>

          {/* Platform name */}
          <h1 className="mt-5 text-center font-public text-[26px] font-bold leading-tight text-navy">
            NER Logistics Platform
          </h1>

          {/* Subtitle */}
          <p
            className="mt-3 max-w-[268px] text-center font-noto leading-relaxed text-navy/60"
            style={{ fontSize: 13.5 }}
          >
            Terrain-aware routing, connectivity risk mapping, and fleet coordination across the North Eastern Region.
          </p>

        </div>

        {/* ── CTA buttons ── */}
        <div className="shrink-0 px-5 pb-3 flex flex-col gap-3">
          <button
            onClick={(e) => onLogIn(e)}
            className="w-full rounded-md bg-navy py-[14px] font-public text-[16px] font-bold text-white active:bg-[#1b3f63]"
          >
            Log in
          </button>
          <button
            onClick={(e) => onCreateAccount(e)}
            className="w-full rounded-md border-[1.5px] border-navy bg-[#EEE5D5]/55 py-[14px] font-public text-[16px] font-bold text-navy active:bg-[#EEE5D5]/80"
          >
            Create account
          </button>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 flex items-center justify-center gap-2 px-6 pb-7 pt-3">
          <MinistryMark />
          <p className="text-center font-noto text-white/65" style={{ fontSize: 11.5, lineHeight: "1.5" }}>
            Ministry of Development of North Eastern Region · Government of India
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Topographic contour lines + route glyph — absolutely positioned SVG overlay ──
function ContourOverlay() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 390 844"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Contour lines */}
      <g stroke="#1E2A40" fill="none" strokeWidth="1" opacity="0.065">
        <path d="M-15 95 C 50 82, 130 108, 210 92 C 290 76, 355 100, 415 87" />
        <path d="M-15 162 C 55 148, 135 175, 215 158 C 295 141, 358 168, 415 155" />
        <path d="M-15 238 C 62 226, 142 250, 224 235 C 304 220, 362 244, 415 232" />
        <path d="M-15 318 C 68 307, 148 330, 228 316 C 308 302, 366 325, 415 313" />
        <path d="M-15 400 C 72 390, 152 412, 234 398 C 314 384, 370 406, 415 394" />
        <path d="M-15 482 C 76 472, 158 495, 238 480 C 318 465, 374 488, 415 476" />
        <path d="M-15 564 C 80 554, 162 578, 244 562 C 324 546, 378 570, 415 558" />
        <path d="M-15 648 C 84 638, 166 662, 248 646 C 328 630, 382 654, 415 642" />
        <path d="M-15 730 C 88 720, 170 744, 252 728 C 332 712, 386 736, 415 724" />
      </g>

      {/* Main route glyph — a winding NH through the hills */}
      <path
        d="M55 830 C 90 770, 110 700, 150 640 C 190 580, 195 510, 160 445 C 130 390, 155 325, 210 272 C 258 225, 290 165, 278 95"
        stroke="#0E2A47"
        strokeWidth="2"
        fill="none"
        opacity="0.11"
        strokeLinecap="round"
      />

      {/* Risk-segment highlight on the route glyph (caution zone) */}
      <path
        d="M150 640 C 175 606, 188 570, 160 445"
        stroke="#B3261E"
        strokeWidth="2.5"
        fill="none"
        opacity="0.09"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Small ministry mark (two overlapping circles evoking a seal) ──
function MinistryMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0 opacity-60">
      <circle cx="9" cy="9" r="8" fill="none" stroke="white" strokeWidth="1.2" />
      <circle cx="9" cy="9" r="5" fill="none" stroke="white" strokeWidth="0.8" />
      <circle cx="9" cy="9" r="1.8" fill="white" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={9 + 5.8 * Math.cos(a)}
            y1={9 + 5.8 * Math.sin(a)}
            x2={9 + 7.6 * Math.cos(a)}
            y2={9 + 7.6 * Math.sin(a)}
            stroke="white"
            strokeWidth="0.9"
          />
        );
      })}
    </svg>
  );
}

// ── Status bar glyphs ──
function StatusBar() {
  return (
    <>
      <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
        <rect x="0" y="8" width="3" height="4" rx="0.5" />
        <rect x="5" y="5" width="3" height="7" rx="0.5" />
        <rect x="10" y="2.5" width="3" height="9.5" rx="0.5" />
        <rect x="15" y="0" width="3" height="12" rx="0.5" />
      </svg>
      <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M1 4.2C3.4 2 5.8 1 8.5 1S13.6 2 16 4.2" strokeLinecap="round" />
        <path d="M3.6 7C5.1 5.7 6.7 5 8.5 5s3.4.7 4.9 2" strokeLinecap="round" />
        <path d="M6.2 9.7c.7-.6 1.5-.9 2.3-.9s1.6.3 2.3.9" strokeLinecap="round" />
        <circle cx="8.5" cy="11.4" r="0.6" fill="currentColor" stroke="none" />
      </svg>
      <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
        <rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke="currentColor" opacity="0.5" />
        <rect x="2" y="2" width="18" height="9" rx="1.5" fill="currentColor" />
        <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.5" />
      </svg>
    </>
  );
}
