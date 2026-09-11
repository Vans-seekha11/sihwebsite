**Prompt for Claude Design (Mobile App — Control Officer, remaining dashboard screens):**

The Command Center (main dashboard) screen for the Control Officer mobile app is already finalized — keep it exactly as is, no changes. Now build the **remaining screens** in the Control Officer's nav (Regional Map, Live Logistics, AI Predictions, Incidents, Routes, Alerts, Analytics), porting them **exactly** from the attached desktop reference screenshots — same data, same fields, same hierarchy, same components. Do not add, remove, simplify, or reinterpret anything. Use the same design system already established across all three mobile dashboards (colors, typography, cards, buttons, badges, icons, spacing, radius) and the same drawer navigation pattern already built for Control Officer (CO badge, "North Eastern Region" active-region label, System Online status, full nav list with Command Center/Regional Map/Live Logistics/AI Predictions/Incidents/Routes/Alerts/Analytics, "Viewing As" FO/DO/CO switcher, Help & Support, Logout).

**Screen — Regional Map:**
- "Regional Map" title (drawer label), page header "District Map," subtitle "Geospatial intelligence — routes, incidents, logistics," "Simulate Route Closure" button.
- Filter controls (Map Layers checkboxes: Roads, Incidents, Flood Risk, Landslide Risk, Logistics, Infrastructure; Risk Level: Low/Moderate/High/Critical; Time Range: Last 1 hour/6 hours/24 hours/7 days) — collapse into an expandable filter sheet above the map on mobile, since the map needs full width.
- Full-width map with the same legend as elsewhere (Open Route / Restricted / Closed-Blocked / Critical Incident / Active Incident / Safe Zone), showing the same example markers (Infrastructure Damage, Landslide LG-102/121, Flood, Road Blockage, LG-115, LG-089).
- Routes list below the map: NH-27 Blocked, NH-2 Restricted, NH-306 Restricted, NH-6 Restricted, NH-13 Closed, NH-40 Open, NH-10 Open.

**Screen — Live Logistics:**
- "Live Logistics" title, page header "Logistics," subtitle "District logistics monitoring and convoy management."
- Summary tiles: Active Vehicles (5), Delayed Vehicles (3), At-Risk Shipments (3), Stopped (1).
- Active Convoys map (full-width on mobile).
- At-Risk Convoys card: LG-102 (Medical Supplies, Near Dimapur → Kohima, NH-2, ETA 4:40 PM, High, +1h 15m), LG-089 (Relief Materials, Sonitpur → Itanagar, NH-13, ETA Suspended, Critical, Indefinite), LG-131 (Telecom Equipment, Senapati → Kohima, NH-2, ETA 5:30 PM, High, +1h 30m).
- Logistics Table (stacked cards on mobile): all 6 rows exactly as shown — LG-102, LG-115, LG-089, LG-134, LG-098, LG-121 — with Cargo, Origin, Destination, Current Location, Route, ETA, Delay, Risk badge, Status badge for each.

**Screen — AI Predictions:**
- "AI Predictions" title, page header "AI Insights," subtitle "AI-generated predictions and recommendations — Demo Data — Not guaranteed facts," disclaimer banner exactly as shown: "All predictions are AI-generated estimates based on historical data, weather patterns, and real-time incident feed. These are recommendations, not confirmed facts. District Officer discretion required."
- Risk Predictions card: NH-27 (94%, Next 3 hours, 89% confidence, factors: Active flooding, IMD flash flood warning, High water level, Historical risk zone), NH-13 (78%, Next 6 hours, 72% confidence, factors: Bridge structural damage, Heavy rainfall forecast, Remote location, Limited access), NH-306 (64%, Next 12 hours, 68% confidence, factors: Saturated soil, Steep gradient, Previous landslide history, Rainfall forecast).
- Logistics Delay Predictions card: "6 logistics routes may experience delays" summary, then NH-2 (82% probability, 2 affected convoys, cause: Landslide debris clearance, +1h 30m), NH-27 (97% probability, 3 affected convoys, cause: Active flooding/road closure, Indefinite delay), NH-306 (58% probability, 1 affected convoy, cause: Road blockage clearance, +45m).
- Route Recommendations card: NH-27 → NH-37 via Jorhat (avoid active flood zone, benefit: risk reduction 94%→18%, +35 km), NH-13 air transport via Tezpur (road closed indefinitely, ensures delivery of critical supplies, N/A distance).
- Resource Recommendations card: three entries exactly as shown — deploy 2 additional field teams to Barpeta (NH-27 deteriorating rapidly), pre-position NDRF team at Kohima (potential NH-2 emergency response), 1 logistics coordinator needed at Dimapur (manage convoy rerouting) — each with "Act on Recommendation" + "Dismiss" buttons.

**Screen — Incidents:**
- "Incidents" title, page header, subtitle "Manage and verify incident reports across the district."
- Status tiles/tabs: All (7), Pending Verification (2), Active (2), Escalated (1), Resolved (2).
- Incident list (stacked cards on mobile): all 7 rows exactly as shown — INC-2026-041 (Flood, Barpeta/Assam, NH-27, Critical, FO-102, 10:32 AM, Pending, unassigned, Pending Verification), 042 (Landslide, Kohima-Imphal Highway/Nagaland, NH-2, High, FO-118, 09:48 AM, Verified, FO-121, Active), 043 (Road Blockage, Aizawl District/Mizoram, NH-306, High, FO-134, 08:15 AM, Verified, FO-109, Escalated), 044 (Flood, Silchar/Assam, NH-6, Moderate, FO-107, 07:50 AM, Verified, FO-115, Active), 045 (Infrastructure Damage, Tawang/Arunachal Pradesh, NH-13, Critical, FO-128, 06:30 AM, Pending, unassigned, Pending Verification), 038 (Vehicle Breakdown, Gangtok/Sikkim, NH-10, Low, FO-101, Yesterday 4:15 PM, Verified, FO-103, Resolved), 039 (Accident, Shillong/Meghalaya, NH-40, Moderate, FO-113, Yesterday 2:30 PM, Verified, FO-116, Resolved) — each with View/Verify action buttons and All Severity/All Types filter dropdowns.

**Screen — Routes:**
- "Routes" title, page header, subtitle "Route intelligence and accessibility monitoring," "All Status" filter.
- Summary tiles: Open Routes (2), Restricted (3), Blocked (1), Closed (1).
- Route list (stacked cards): all 7 rows exactly as shown — NH-27 East-West Corridor Assam (110 km, 82/100 Critical, risk bar, Blocked, Heavy Rain, ETA 6h20m, Delay +3h40m, Updated 10:45 AM), NH-2 Kohima-Imphal Corridor (145 km, 48/100 Moderate, Restricted, Moderate Rain, ETA 4h50m, +1h15m, 10:30 AM), NH-306 Aizawl-Lunglei Highway (95 km, 55/100 Restricted, Cloudy, ETA 3h10m, +45m, 09:50 AM), NH-6 Silchar-Jiribam Corridor (205 km, 61/100 Restricted, Light Rain, ETA 5h40m, +1h10m, 10:15 AM), NH-13 Tawang Highway (340 km, 78/100 Critical, Closed, Fog+Rain, ETA Unavailable, Indefinite, 08:00 AM), NH-40 Guwahati-Shillong Highway (100 km, 22/100 Good, Open, Partly Cloudy, ETA 2h45m, None, 10:50 AM), NH-10 Siliguri-Gangtok Highway (115 km, 18/100 Good, Open, Clear, ETA 3h20m, +15m, 10:55 AM) — each with a "Detail →" action.

**Screen — Alerts:**
- "Alerts" title, page header, subtitle "Operational notification center — 3 unacknowledged," "Acknowledge All" button.
- Filter chips: All, Critical, Route Closure, Flood, Landslide, Logistics Delay, Escalation, AI Warning.
- Alert cards, all 6 exactly as shown: Flash flood warning NH-27 Barpeta (Critical, Barpeta/Assam/Flood, Source: IMD/AI System, 10:40 AM, View/Acknowledge/Assign/Escalate), Bridge damage Tawang (Critical, Tawang/Arunachal Pradesh/Infrastructure, Source: Field Officer FO-128, 10:22 AM, View/Acknowledge/Assign/Escalate), 3 convoys at risk NH-2 Zone (High, Nagaland/Logistics Delay, Source: AI Prediction System, 10:15 AM, View/Acknowledge/Assign/Escalate), plus the three already-acknowledged, muted-state alerts: INC-2026-043 exceeds SLA threshold (09:50 AM), Increased landslide probability NH-306 (09:30 AM), NH-13 closed indefinitely (08:05 AM).

**Screen — Analytics:**
- "Analytics" title, page header, subtitle "Decision-focused district performance analytics — Demo Data."
- KPI tiles: Total Incidents 7d (24, +14%), Avg Response Time (42m, -8% week), Route Accessibility (52%, -5% week), Logistics On-Time (68%), Unresolved >24h (7, +3 week).
- Incident Trend line chart (Mon–Today, matching the reference shape).
- Route Accessibility stacked bar chart per route (NH-27 18% accessible, NH-2 52%, NH-306 45%, NH-6 39%, NH-40 78%) with Accessible/Restricted legend.
- Average Response Time line chart with 35-minute target dashed line.
- District Risk Score Trend line chart with the callout: "Risk trend increasing — 74/100 today vs 42/100 last Monday. Monsoon season contributing factor."
- District Performance Comparison table (stacked cards on mobile): all 5 rows exactly — Kamrup Metro/Assam (24, 42m, 52%, 32%, 7), Kohima/Nagaland (18, 38m, 61%, 24%, 4), Aizawl/Mizoram (12, 55m, 44%, 41%, 8), East Khasi Hills/Meghalaya (8, 31m, 72%, 18%, 2), Tawang/Arunachal Pradesh (8, 68m, 28%, 72%, 5).

**Mobile adaptation rules (layout only, content stays identical):** every desktop table becomes stacked cards; side-by-side filter+map or panel+panel layouts stack vertically; charts keep their chart type, resized full-width, horizontally scrollable if needed rather than cropped; minimum 44px touch targets; preserve every number, label, route name, incident ID, vehicle ID, and badge color exactly as shown in the reference screenshots — this is a faithful port, not a redesign.