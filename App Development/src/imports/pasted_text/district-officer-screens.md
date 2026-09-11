Add District Officer mobile screens as new frames in the existing Figma file (same file as Login, Splash, Field Officer).

*Design system (reuse only, no new tokens):* navy-900, navy-700, paper-50, saffron-600, signal-red-700, deep-green-700, slate-500 · Public Sans (headings/UI) + Noto Sans (body) · flat cards, hairline borders, 4–6px radius, no shadows · reuse RiskBadge, SyncStatusChip, AlertBanner, MapLegend, ConnectivityStatusRow.

*Role-gating (redirect at auth, not toggle):* Field officer→bottom-nav shell · District officer→this set, own district only · Control room→same shell + full-region data + broadcast compose · User→read-only lightweight view.

*Nav shell:* existing Dashboard shell, drawer (<900px)/side rail (≥900px). Items: Overview, District Map, Incidents, Routes, Logistics, Field Officers, Tasks, AI Insights, Alerts, Reports, Analytics, Settings.

*Visual tone:* navy-900 primary/nav/headers · saffron-600 caution/medium · signal-red-700 critical-only · deep-green-700 clear/resolved. No gradients/glassmorphism/neon/illustrations — gov control-room, not SaaS.

*Mobile rules:* tables→stacked cards · hover→tap/press · multi-col→single-column scroll · side panels→full-screen/bottom-sheet modals.

*Screens:*
1. *Overview* – district header; KPI grid (Active Incidents, Blocked Routes, High-Risk Routes, Active Logistics, Pending Reports, Avg Response Time); tappable cards → Map, Critical Alerts, Incident queue, Logistics, AI Insights.
2. *District Map* – boundary/roads/blocked roads/risk zones/flood-landslide zones/incidents/vehicles/infra/alternates; bottom-sheet/top-bar controls (search, layers, filters, MapLegend); tap route → sheet (name, RiskBadge, accessibility score, status, delay, weather, flood/landslide risk, AI recommendation).
3. *Incidents* – tabs (All/Pending Verification/Active/Escalated/Resolved); cards (ID, type, location, severity badge, reporter/time, verification, officer, status); tap → detail (info, evidence, map, impact, AI risk card labeled "AI-generated estimate," actions: Verify/Assign Officer/Create Task/Escalate/Update Status/Resolve).
4. *Pending Verification* – priority-sorted cards (incident, severity, evidence, reporter, time, location); actions View Evidence/Verify/Reject/Request More Info; critical items top + stronger badge.
5. *Active Incidents* – cards (incident, severity, location, officer, response status, elapsed time, SLA) + timeline strip (Reported→Verified→Assigned→In Progress→Resolved).
6. *Escalated* – cards, restrained red accents (not full-red bg): ID, escalation reason, severity, district impact, time unresolved, team, "Escalated to Control Officer" label.
7. *Resolved* – filter sheet (date/type/severity/location); condensed cols: incident, type, location, reported/resolved time, response time, resolved by; tap → resolution summary.
8. *Routes* – cards (name, distance, accessibility score, RiskBadge, status, weather, ETA, delay, updated); tap → detail (score/risk/weather/flood-landslide/condition/traffic/incidents/history) + Current-vs-Alternative comparison cards + labeled AI Recommendation card.
9. *Logistics* – KPI row (Active Vehicles, Delayed, At-Risk Shipments, Completed); map card w/ vehicle markers; cards (ID, cargo, origin/destination, location, route, ETA, delay, risk, status chip); tap → vehicle detail.
10. *Field Officers* – KPI row (Total, Available, On Task, Offline, Emergency Response); status-colored map; cards (ID, name, location, task, status, last update, response time); tap → officer detail (assignment, history, location, incidents).
11. *Tasks* – tabs (All/New/In Progress/Completed/Escalated); cards (ID, task, location, priority, officer, created/deadline, status); actions Assign/Reassign/View/Escalate/Complete; tap → detail (description, location, incident link, officer, deadline, evidence, progress timeline).
12. *AI Insights* – all outputs labeled estimate/prediction/recommendation + confidence%. Cards: Risk Predictions (route, probability, window, confidence, factors), Logistics Prediction, Route Recommendation, Resource Recommendation. What-if: "Simulate Route Closure" → select route → result card (affected districts, logistics impact, added delay, alternates, recommended response).
13. *Alerts* – AlertBanner/inbox pattern; scroll-strip tabs (Critical/Route Closure/Flood/Landslide/Logistics Delay/Task/Escalation/AI Warning); card (severity, title, location, time, description, source, actions: View/Acknowledge/Assign/Escalate).
14. *Reports* – type list (Daily Situation, District Logistics, Route Risk, Incident, Disruption, AI Risk) → filter sheet (date/district/type/route/severity) → preview (title, date, KPIs, incident/route/logistics/risk summaries, AI recs, map, footer) → Generate/Export PDF/CSV.
15. *Analytics* – single-column full-width charts: Incident Trend (line), Route Accessibility (bar), Logistics Delays (bar/line), Response Time (trend), Risk Trend, District Performance.

*Global standards:*
- *Accessibility Score* (everywhere routes appear): 0–25 Good, 26–50 Moderate, 51–75 Restricted, 76–100 Critical — number + band label always, never color alone.
- *Incident Priority*: Critical/High/Medium/Low — badge + label always, never color alone.
- *Demo data*: fictional NER (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Tripura, Sikkim) — always tagged "DEMO DATA."
- *Accessibility*: high contrast, visible focus states, mobile-readable type, icon+text per status, 44px touch targets, screen-reader labels.

*Non-negotiable:* identical colors, fonts, components, icons, nav pattern to Login/Splash/Field Officer — District, Field, Control Room read as one platform, not three apps.