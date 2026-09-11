// Tricolor wipe overlay for splash ↔ Login/Create Account navigation.
// A radial sweep in the splash's own pale saffron/sage tints expands from the
// tapped button, while the bronze emblem arcs toward the tap point as a
// "hand-off" into the destination screen. CSS-animation driven (no WebGL) so
// it holds 60fps on mid-range phones. See index.css for the keyframes.
import { AshokaChakra } from "./AshokaChakra";

export type WipeOrigin = {
  // Tap point as a percentage of the screen (for the disc centre).
  xPct: number;
  yPct: number;
  // Delta in px from screen-centre to the tap point (drives the emblem arc).
  dx: number;
  dy: number;
};

export default function SplashTransition({ xPct, yPct, dx, dy }: WipeOrigin) {
  return (
    <div
      className="absolute inset-0 z-[60] overflow-hidden"
      aria-hidden="true"
      // Capture taps for the duration so the sweep can't be double-triggered.
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="ner-wipe-disc"
        style={{ left: `${xPct}%`, top: `${yPct}%` }}
      />
      <div
        className="ner-wipe-emblem"
        style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px` }}
      >
        <AshokaChakra size={120} color="#B87333" />
      </div>
    </div>
  );
}
