**Prompt for Claude Design (Mobile App — District Officer Dashboard, full feature parity):**

Build the **District Officer mobile experience** for the NER Logistics Platform app, replicating the attached desktop District Officer design **exactly** — same sections, same data fields, same components, same content — adapted only for mobile screen size and touch interaction. Do not add, remove, simplify, or reinterpret any feature. Do not change the color system, typography, badge colors, or component style shown in the reference screenshots — port it faithfully to mobile.

**Global chrome (carries across every screen):**
- Convert the persistent left sidebar into a **slide-out drawer**, opened via a hamburger icon in the top header. Drawer content, top to bottom, exactly as shown: "DO" amber badge, "District Officer" title + "NER Operations Portal" subtitle; "Active District" label with district name (e.g. "Kamrup Metro, Assam") + "System Online" status dot; "Main Menu" section with all 10 nav items in this exact order: **Dashboard, District Map, Incidents** (with unread-count badge), **Routes, Logistics, Tasks, AI Insights, Alerts** (with unread-count badge), **Reports, Analytics**; below that, "Viewing As" role switcher (FO / DO / CO), "Help & Support," "Logout."
- Top header on every screen: breadcrumb-style page label (e.g. "NER Platform › District Officer › Dashboard"), page title, and any page-specific action button (e.g. "Generate Report," "+ Create Task," "Simulate Route Closure").
- Active nav item keeps the amber-accent highlighted state.

**Screen 1 — Dashboard:**
- Header: "District Operations" title, subtitle "Real-time district connectivity, logistics and incident intelligence," "Demo Data — Live Monitoring Active" badge, "Generate Report" button.
- KPI tiles (stack 2×2 or 2×3 on mobile, not a single row): Active Incidents (24), Blocked Routes (07), High-Risk Routes (12), Active Logistics (86), Pending Reports (18), Avg Response Time (42m) — each with its trend indicator (e.g. "+3 vs yesterday").
- District Map card: live incident/route-status map with "Full Map" link — render full-width on mobile, same legend (Open Route / Restricted / Closed-Blocked / Critical Incident / Active Incident / Safe Zone).
- Critical Alerts card: "3 unacknowledged," "View All" link, each alert row exactly as shown (severity badge, title, location, timestamp, source, View + Acknowledge buttons) — e.g. Flash flood warning NH-27 Barpeta, Bridge damage Tawang, 3 convoys at risk NH-2 Zone.
- Incident Queue card: table converted to stacked cards on mobile, each with ID, Type, Location, Severity badge, Status badge, "View →" action — same 5 example rows (INC-2026-041 through 045).
- AI Insights card: "View All" link, risk prediction entries (NH-27 94%, NH-13 78%, NH-308 64%) each with disruption probability bar, expected window, confidence %, contributing factor tags — labeled "AI-generated estimate."

**Screen 2 — District Map:**
- "District Map" title, subtitle "Geospatial intelligence — routes, incidents, logistics," "Simulate Route Closure" button.
- Filter panels (Map Layers checkboxes: Roads, Incidents, Flood Risk, Landslide Risk, Logistics, Infrastructure; Risk Level: Low/Moderate/High/Critical; Time Range: Last 1 hour/6 hours/24 hours/7 days) — collapse into an expandable filter drawer/sheet on mobile rather than a fixed side panel, since map needs full width.
- Full-width map with same legend as Dashboard.
- Routes list (NH-27 Blocked, NH-2 Restricted, NH-308 Restricted, NH-6 Restricted, NH-13 Closed, NH-40 Open, NH-10 Open) below the map on mobile.

**Screen 3 — Incidents:**
- "Incidents" title, subtitle "Manage and verify incident reports across the district."
- Status tabs/counts: All (7), Pending Verification (2), Active (2), Escalated (1), Resolved (2).
- Incident list (cards on mobile): ID, Type, Location, Route, Severity badge, Reported By, Time, Verification badge, Assigned officer, Status badge, View/Verify actions — all 7 example rows exactly as shown (INC-2026-041 through 045, 038, 039).
- Filter dropdowns: All Severity, All Types.

**Screen 4 — Routes:**
- "Routes" title, subtitle "Route intelligence and accessibility monitoring," "All Status" filter.
- Summary tiles: Open Routes (2), Restricted (3), Blocked (1), Closed (1).
- Route list (cards): Route ID, Name, Distance, Accessibility score + bar, Risk badge, Status badge, Weather, ETA, Delay, Updated time, "Detail →" — all 7 example rows exactly (NH-27, NH-2, NH-306, NH-6, NH-13, NH-40, NH-10) with their exact values.

**Screen 5 — Logistics:**
- "Logistics" title, subtitle "District logistics monitoring and convoy management."
- Summary tiles: Active Vehicles (5), Delayed Vehicles (3), At-Risk Shipments (3), Stopped (1).
- Active Convoys map (full-width on mobile).
- At-Risk Convoys card: LG-102, LG-089, LG-121 entries exactly as shown (cargo, origin→destination, route/ETA, risk badge, delay).
- Logistics Table (cards on mobile): Vehicle ID, Cargo, Origin, Destination, Current Location, Route, ETA, Delay, Risk badge, Status badge — all 6 rows exactly (LG-102, LG-115, LG-089, LG-134, LG-098, LG-121).

**Screen 6 — Tasks:**
- "Tasks" title, subtitle "Field task management and assignment," "+ Create Task" button.
- Status tiles/tabs: All (5), New (1), In Progress (3), Completed (1), Escalated (0).
- Task list (cards): Task ID, Title, sub-reference (e.g. "L INC-2026-041"), Location, Priority badge, Assigned Officer, Created time, Deadline, Status badge, View/Assign actions — all 5 rows exactly (TSK-0891 through 0885).

**Screen 7 — AI Insights:**
- "AI Insights" title, subtitle "AI-generated predictions and recommendations — Demo Data — Not guaranteed facts," disclaimer banner: "All predictions are AI-generated estimates based on historical data, weather patterns, and real-time incident feed. These are recommendations, not confirmed facts. District Officer discretion required."
- Risk Predictions card: NH-27, NH-13, NH-306 entries exactly as shown, each with disruption probability %, bar, expected window, confidence, contributing-factor tags.
- Logistics Delay Predictions card: "6 logistics routes may experience delays" summary, then NH-2, NH-27, NH-306 entries with affected convoys, probability %, cause, estimated delay.
- Route Recommendations card: two entries exactly as shown (NH-27→NH-37 via Jorhat; NH-13 air transport via Tezpur) with benefit/risk-reduction and added distance.
- Resource Recommendations card: three entries exactly as shown (deploy 2 field teams to Barpeta; pre-position NDRF at Kohima; 1 logistics coordinator needed at Dimapur), each with "Act on Recommendation" + "Dismiss" buttons.

**Screen 8 — Alerts:**
- "Alerts" title, subtitle "Operational notification center — 3 unacknowledged," "Acknowledge All" button.
- Filter chips: All, Critical, Route Closure, Flood, Landslide, Logistics Delay, Escalation, AI Warning.
- Alert cards, all 6 exactly as shown: Flash flood warning NH-27 Barpeta, Bridge damage Tawang, 3 convoys at risk NH-2 Zone (all with View/Acknowledge/Assign/Escalate actions), plus the three already-acknowledged ones (INC-2026-043 SLA exceeded, increased landslide probability NH-306, NH-13 closed indefinitely) shown in muted/acknowledged state.

**Screen 9 — Reports:**
- "Reports" title, subtitle "Generate and export operational reports."
- Report Configuration form: Report Type dropdown (Daily Situation Report), Date picker, District field, Incident Type dropdown, Severity Filter dropdown, "Generate Report" button.
- Output/preview panel: empty state "Configure and generate a report — Select report type and parameters on the left" until generated — stack this below the config form on mobile rather than side-by-side.

**Screen 10 — Analytics:**
- "Analytics" title, subtitle "Decision-focused district performance analytics — Demo Data."
- KPI tiles: Total Incidents 7d (24, +14%), Avg Response Time (42m, -8% week), Route Accessibility (52%, -5% week), Logistics On-Time (68%), Unresolved >24h (7, +3 week).
- Incident Trend line chart (Mon–Today).
- Route Accessibility stacked bar chart per route (NH-27, NH-2, NH-306, NH-6, NH-40) with accessible/restricted % legend.
- Average Response Time line chart with 35-minute target dashed line.
- District Risk Score Trend line chart with callout: "Risk trend increasing — 74/100 today vs 42/100 last Monday. Monsoon season contributing factor."
- District Performance Comparison table (cards on mobile): District, State, Incidents, Avg Response, Route Access, Logistics Delays, Unresolved — all 5 rows exactly (Kamrup Metro, Kohima, Aizawl, East Khasi Hills, Tawang) with their exact values.

**Mobile adaptation rules (layout only, never content):**
- Convert every desktop table to stacked cards.
- Convert side-by-side panels (filters + map, config + preview) to vertically stacked sections.
- Sidebar → drawer, as specified above.
- Charts remain the same chart types, resized to full mobile width, horizontally scrollable if data density requires it rather than cropped.
- Minimum 44px touch targets on every button/action.
- Preserve every KPI number, every named entity (route names, district names, incident IDs, vehicle IDs, officer IDs), every badge label and color exactly as in the reference screenshots — this is a faithful port, not a redesign.