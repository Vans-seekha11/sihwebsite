Add a **separate Control Room mobile dashboard** as new frames in the same Figma file, alongside Login, Splash, Field Officer, and District Officer. It must reuse the exact same design system but have its **own layout and information hierarchy** — not a copy of District Officer with more cards.

**Role-gating (redirect at auth, not a toggle):** Only a Control Room login loads this dashboard. Field officer→bottom-nav shell · District officer→district-scoped shell (own district only) · Control room→this dedicated command-center shell with full-region data + broadcast compose · User→read-only lightweight view. No role can access another role's shell.

**Design system (reuse only, no new tokens):** navy-900, navy-700, paper-50, saffron-600, signal-red-700, deep-green-700, slate-500 · Public Sans (headings/UI) + Noto Sans (body) · flat cards, hairline borders, 4–6px radius, no shadows · reuse RiskBadge, SyncStatusChip, AlertBanner, MapLegend, ConnectivityStatusRow, KPI card, table→card pattern, skeleton loaders, transitions (150–300ms, no dramatic animation).

**Nav shell:** same drawer (<900px)/side rail (≥900px) pattern. Sidebar/drawer items relabeled for Control Room: Command Center, Regional Map, Live Logistics, Risk Intelligence, Incidents, Districts, Routes, AI Predictions, Alerts, Analytics, Reports, Settings. Active item: Command Center.

**Purpose:** answer "what's happening across NER right now" in seconds. Priority order: Critical Incidents → Regional Risk → Affected Routes → Logistics Disruption → District Status → AI Predictions → Alerts → Priority Actions. Do not emphasize individual field tasks.

**Header:** "Regional Control Center" + subtitle "North Eastern Region"; status row: ● System Operational, Last Updated, notification bell, profile — condensed into existing mobile header pattern.

**Mobile layout (single-column, scroll-priority order, replacing desktop's 3-zone layout):**

1. **Regional KPI strip** — horizontal scroll cards (existing KPI style): Active Incidents, Critical Incidents, Affected Routes, At-Risk Logistics, Districts on Alert, Regional Accessibility (score/100).
2. **Regional Situation Map** (full-width card, tap to expand full-screen) — district boundaries, incidents, route disruptions, logistics movement, risk zones; markers colored Green/Amber/Orange/Red/Blue; compact control bar (Search, Layers, Risk, Incidents, Routes, Logistics, Weather, Time) collapses into bottom sheet on mobile; MapLegend as compact bottom-sheet/expandable strip.
3. **Critical Situation panel** — stacked cards (not side panel), top 3–5 events only, each: severity label, title, district, affected routes, impact, time, "View" button; "View All Critical Events" link at bottom.
4. **Regional Risk Intelligence** — horizontal scroll or stacked risk cards (Overall, Flood, Landslide, Route, Logistics Risk), each with score/100, band label, trend arrow, labeled "AI-generated risk estimate."
5. **District Situation** — desktop table converts to stacked cards per district (name, risk badge, accessibility score, active incidents, critical alerts, affected routes, logistics impact, status); "View All Districts" button.
6. **Live Logistics** — desktop table converts to stacked cards (vehicle, route, destination, status chip, risk, ETA); "● LIVE" indicator + "Last updated Xs ago"; only the updated card animates on refresh, not the whole screen; "View Live Logistics" button.
7. **AI Predictions** — stacked cards (Flood Risk, Route Disruption, Logistics Delay), each with expected impact, window/probability, confidence %, clearly labeled "AI-generated prediction"; "View All Predictions" button.
8. **Priority Actions** — stacked list: priority icon, description, location, time, "Review" button.
9. **Alert Summary** — compact badge row (Critical/High/Moderate/Information counts) using existing status badge system; "View Alerts" button.
10. **Regional Accessibility** — dedicated card: score/100, status label, existing accessibility visualization, breakdown (Fully Accessible/Partially Accessible/Restricted %).
11. **Quick Actions** — bottom action row/sheet using existing button style (not oversized/colorful): View Critical Incidents, Regional Map, Live Logistics, Risk Intelligence, AI Predictions, Generate Report.

**Interactions (tap-based, mobile equivalents of desktop click states):** tap Critical Incident→Incident Detail · tap Map Marker→Incident info sheet · tap District card→District Overview · tap Logistics card→Live Logistics Detail · tap AI Prediction→Prediction Detail · tap Risk card→Risk Intelligence · tap Alert→Alert Detail · tap Simulation→Simulation sheet. All transitions smooth, 200–300ms.

**Real-time behavior (kept subtle, mobile-appropriate):** new critical incident → bell indicator + card fade/slide into Critical Situation panel + subtle marker pulse on map (not all markers). Vehicle position updates move smoothly, never jump. Risk score updates use smooth number transition with delta shown (e.g. "+6"). Data refresh shows "↻ Updating..." → "✓ Updated just now" using existing sync icon. AI generation shows "Analyzing regional conditions..." → "Analysis Complete" with result — no glow/neon effects.

**Loading states:** skeleton loaders for KPI strip, map, critical incidents, district cards, logistics, risk cards, AI predictions — no generic spinners.

**Non-negotiable:** identical colors, fonts, sizes, icons, card/button/table/badge/modal/toast/loading styles, header, and nav pattern as Login/Splash/Field Officer/District Officer. Only the layout, content priority, and Control-Room-specific data differ — this must read as one platform's third role view, feeling like a **Regional Command Center**, not a generic SaaS screen, and it must be reachable **only** via a Control Room login.