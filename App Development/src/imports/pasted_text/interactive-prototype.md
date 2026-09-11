# Master Prompt — Interactive Working Prototype
### NER Logistics Platform · Field Officer iOS Track · Active Trip → Risk Interrupt → Reroute
*(Paste this whole prompt into Figma Make / your AI app-builder of choice. Reference images = your 3 exported screens.)*

---

## Role & context
You are a senior front-end engineer building a **working, clickable prototype** for a Smart India Hackathon (SIH) submission — problem statement SIH26002, MDoNER NER Logistics Platform. The team has three finished high-fidelity UI screens (attached as reference images) for the Field Officer track on iOS: **Active Trip → Critical Risk Interrupt → Rerouted/Confirmed**. Do **not** redesign anything. Reproduce these three screens pixel-for-pixel from the reference images and wire them into a fully working, demo-safe interactive flow with real state, not three flat mockups stitched together.

## Non-negotiable visual fidelity
- Canvas: iPhone frame, 390×844, safe-area accurate — mock status bar (09:41 / 09:43, signal/wifi/battery glyphs) is static and non-interactive.
- Navy top nav bar `#0E2A47`; pressed/secondary surfaces `#1B3F63`.
- Background `#F5F5F1` (cool paper white — never a warm cream).
- Risk semantics only: caution `#D97A1F` (saffron), critical/high-risk `#B3261E` (true red), clear/low-risk/success `#1E6B45` (deep green), body/secondary text `#5B6472`. Every risk indicator must pair color + icon + text label — never color alone.
- Typography: **Public Sans** for nav titles, headings, and buttons; **Noto Sans** for body copy and data values. Minimum 16sp anywhere in this track, never below 14sp.
- Flat panels, 1px hairline borders (slate at ~20% opacity), 4–6px corner radius, no drop shadows, no gradients. Left-aligned throughout.
- Outlined icon set, consistent stroke weight.
- Exactly **one** hero animation in the whole flow — the route redraw on reroute confirmation (see step 4 below). Every other transition is a quiet 150–200ms ease fade/slide. No hover-fades, no bounce, no per-card motion.

## Screen 1 — Active Trip (default state)
Nav bar: "Active trip" / "TRP-2291 · Consignment P1 medical", right-aligned green "Online" pill.
Full-bleed map (top ~55%) with two floating circular icon buttons bottom-right (locate pin, map layers).
Bottom sheet (partial detent, visible drag handle):
- Turn icon + "Next turn · 1.2 km" / "Left onto NH-6 spur" / "at Km 26 junction, Lubha bridge"
- Divider
- Two-column stats: "ETA range / 14:20 – 14:50" | "Remaining / 48 km · Sonapur"
- Saffron caution banner: "⚠ Caution · Km 22–26 wet slope, reduce speed"
- Buttons: outline "Route detail", solid navy "Report condition"
Tab bar (4 items): Home, **Route (active)**, Report, Alerts — no badges.

## Screen 2 — Critical Risk Interrupt
Nav bar: "Active trip" / "TRP-2291 · risk update received", right-aligned red "⚠ 1 critical" pill.
Red alert card slides down over the map on entry:
- Header row: "⚠ Critical risk alert" (left) / "now" (right), red background.
- White body: "NH-6 Km 31–34 is now high risk" (bold) / "Predicted landslide, 78% confidence · 5 km ahead, reaches you in 11 min."
- Buttons: outline "Not now", solid red "View safer route".
Map: dashed navy original path, solid red flagged segment labelled "High risk Km 31–34", green candidate labelled "Alternate proposed", markers for Km 26 jn./Lubha bridge and Umkiang.
Bottom sheet:
- Light-red banner: "⚠ High risk ahead · Km 31–34 flagged on current route"
- "⟳ Calculating alternate route…" with a filling progress bar beneath it
- Two-column stats: "ETA range — on hold / ~~14:20 – 14:50~~ (strikethrough)" | "Candidate bypass / Lumshnong, +18 km"
Tab bar: Alerts tab shows a red "1" badge.

## Screen 3 — Rerouted / Confirmed
Nav bar: "Active trip · rerouted" / "TRP-2291 · control room notified", right-aligned green "✓ Synced" pill.
Map: legend card top-left (Risk on segments — Clear=green / Caution=orange / High risk=red / Avoided route=grey dashed), confirmed green route Sonapur → Lumshnong (bypass entry) → Km 26 jn., old red segment now grey-dashed "Avoided Km 31–34", tag "Clear · bypass".
Bottom sheet:
- Green check chip + "Rerouted via Lumshnong bypass" / "Avoids Km 31–34. Two lanes, PMGSY surface, clear at 09:40."
- Two-column stats: "New ETA range / 14:38 – 15:10" with "+18 min vs. original" in saffron beneath | "Risk exposure / Low · 1 caution" with "was High · 1 blocked" muted beneath
- Grey next-turn row: "Next turn · 3.4 km / Right onto Lumshnong bypass, then 21 km"
- Buttons: outline "Compare", solid navy "Follow new route"
Tab bar: Alerts badge clears once this screen is reached.

## Interaction / state-machine spec
Build a real state machine — not three isolated pages.

1. **Idle (Screen 1)** loads by default.
2. Add a **hidden "Simulate risk event" control** (a ghost button or long-press on the nav bar — invisible in the normal design, jury-only). Wire both a manual trigger AND an auto-fire after ~8s idle on Screen 1, so a judge can force the demo on cue instead of waiting.
3. **Screen 2 → "Not now"**: dismiss the alert card (slide up + fade, 200ms), return to Screen 1, but upgrade the caution banner in place to reflect the new risk — don't silently reset to the original state.
4. **Screen 2 → "View safer route"**: alert card dismisses, "Calculating alternate route…" bar fills 0→100% over ~1.5s, then auto-advances to Screen 3. **This is the one hero animation**: the red high-risk segment fades to grey-dashed while the green bypass path draws in as the sheet content cross-fades — a real path/color transition, never a hard cut.
5. **Screen 3 → "Follow new route"**: returns to a Screen-1-shaped view but with post-reroute data (green route, ETA 14:38–15:10, no caution banner, next turn = "Right onto Lumshnong bypass"). Build this as the *same* component driven by state, not a fourth static screen.
6. **Screen 3 → "Compare"**: a simple overlay/modal listing old vs. new ETA and risk exposure side by side is enough if time is short.
7. Tab bar: Home/Report/Alerts must never dead-end into a blank screen — give them minimal placeholder views or a clearly disabled affordance.
8. Bottom sheet drag handle: support at least a two-position snap (partial ↔ expanded) via drag or tap.

## Data to wire as shared variables (not per-screen hardcoded text)
`tripId="TRP-2291"`, `consignment="P1 medical"`, `connectivityStatus`, `etaLow`/`etaHigh`, `kmRemaining`, `destination`, `riskLevel` (clear/caution/high), `riskMessage`, `alertsBadgeCount`, `syncStatus`. Driving all three screens off shared state — instead of copy-pasted text per screen — is what reads as a working system rather than three flat mockups when the jury clicks through it.

## Deliverable
Ship a fully working, deployed, clickable build (web is fine — it does not need to be native iOS) that a judge can open on a laptop or phone browser, click through start to finish in under 60 seconds, and manually re-trigger the risk event without reloading the page. Keep every color, string, and type choice exactly as specified above — no lorem ipsum, no default framework styling bleeding through.

---

## Alternative — native Figma prototyping (no AI regeneration)
If your 3 frames already live in Figma and you'd rather wire them by hand than regenerate anything:

1. Duplicate Screen 1 into an "Active Trip — rerouted" variant frame carrying Screen 3's data, so "Follow new route" can loop back into the same flow shape.
2. Create Figma **Variables** for `etaLow`/`etaHigh`/`riskLevel`/`syncStatus`/`alertsBadge`; bind text layers to them so one variable change updates every instance.
3. Turn `RiskBadge`, `AlertBanner`, `SyncStatusChip`, and the route-option buttons into **interactive components** with real default/pressed/disabled variants.
4. Wire connections: "Report condition" → On Click → Navigate to Screen 2 (plus a parallel "After Delay 8s" trigger from Screen 1) → Smart Animate.
5. Screen 2: "Not now" → Navigate back to Screen 1, Smart Animate, 200ms ease-out. "View safer route" → Navigate to a transient "calculating" frame (progress bar via Smart Animate width, or a Variable + timer) → After Delay 1.5s → Navigate to Screen 3 with Smart Animate — this produces the route-redraw effect, since Smart Animate tweens matching layer names between the map states.
6. Screen 3: "Follow new route" → Navigate to the Screen-1-rerouted variant with Smart Animate.
7. Add a small off-canvas "demo trigger" hotspot near the start frame, purely for jury control.
8. Share via Figma's Prototype link, device frame = iPhone. **Name every corresponding layer identically across Screens 1/2/3** — Smart Animate fails silently on mismatched names — and click through the whole flow at least 10 times before the demo.