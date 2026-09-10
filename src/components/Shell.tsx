import { useState } from 'react';
import type { Role } from '@/roles';
import ProfilePanel from '@/components/ProfilePanel';

const NAV = [
  { key: 'dashboard', label: 'Dashboard',     icon: '⊞' },
  { key: 'map',       label: 'District Map',  icon: '◉' },
  { key: 'incidents', label: 'Incidents',     icon: '◆', badge: 5 },
  { key: 'routes',    label: 'Routes',        icon: '→' },
  { key: 'logistics', label: 'Logistics',     icon: '⊟' },
  { key: 'tasks',     label: 'Tasks',         icon: '☑' },
  { key: 'ai',        label: 'AI Insights',   icon: '✦', gold: true },
  { key: 'alerts',    label: 'Alerts',        icon: '◬', badge: 3 },
  { key: 'reports',   label: 'Reports',       icon: '⊡' },
  { key: 'analytics', label: 'Analytics',     icon: '▨' },
];

const FO_NAV = [
  { key: 'fo-dashboard', label: 'Dashboard',       icon: '⊞' },
  { key: 'fo-tasks',     label: 'My Tasks',        icon: '☑' },
  { key: 'fo-report',    label: 'Report Incident', icon: '⊕', gold: true },
  { key: 'fo-routes',    label: 'Route Status',    icon: '→' },
  { key: 'fo-logistics', label: 'Logistics',       icon: '⊟' },
  { key: 'fo-alerts',    label: 'Alerts',          icon: '◬', badge: 2 },
  { key: 'fo-reports',   label: 'Reports',         icon: '⊡' },
];

const CR_NAV = [
  { key: 'cr-command', label: 'Command Center', icon: '◈', gold: true },
  { key: 'map',        label: 'Regional Map',   icon: '◉' },
  { key: 'logistics',  label: 'Live Logistics', icon: '⊟' },
  { key: 'ai',         label: 'AI Predictions', icon: '✦' },
  { key: 'incidents',  label: 'Incidents',      icon: '◆' },
  { key: 'routes',     label: 'Routes',         icon: '→' },
  { key: 'alerts',     label: 'Alerts',         icon: '◬' },
  { key: 'analytics',  label: 'Analytics',      icon: '▨' },
];

const TITLES: Record<string, string> = {
  'cr-command': 'Command Center',
  dashboard: 'Dashboard', map: 'District Map', incidents: 'Incidents',
  routes: 'Routes', logistics: 'Logistics',
  tasks: 'Tasks', ai: 'AI Insights', alerts: 'Alerts',
  reports: 'Reports', analytics: 'Analytics',
  'fo-dashboard': 'Field Dashboard', 'fo-tasks': 'My Tasks', 'fo-report': 'Report Incident',
  'fo-routes': 'Route Status', 'fo-logistics': 'Logistics', 'fo-alerts': 'Alerts',
  'fo-reports': 'Reports',
};

const ROLE_META: Record<Role, {
  label: string; short: string; subtitle: string; nav: typeof NAV;
  contextLabel: string; context: string; profileName: string; profileInitials: string;
  officerId: string; department: string; region: string; phone: string;
  email: string; lastLogin: string; status: string;
}> = {
  control: {
    label: 'Control Officer', short: 'CO', subtitle: 'NER Command Center', nav: CR_NAV,
    contextLabel: 'Active Region', context: 'North Eastern Region',
    profileName: 'Anjali Rao', profileInitials: 'AR',
    officerId: 'NER-CO-0087', department: 'Regional Command & Coordination',
    region: 'North Eastern Region (8 States)', phone: '+91 98640 12087',
    email: 'anjali.rao@ner.gov.in', lastLogin: 'Today, 08:14 AM IST', status: 'Active',
  },
  district: {
    label: 'District Officer', short: 'DO', subtitle: 'NER Operations Portal', nav: NAV,
    contextLabel: 'Active District', context: 'Kamrup Metro, Assam',
    profileName: 'Dinesh Joshi', profileInitials: 'DJ',
    officerId: 'NER-DO-0342', department: 'District Disaster & Logistics Management',
    region: 'Kamrup Metro, Assam', phone: '+91 94350 20342',
    email: 'dinesh.joshi@assam.gov.in', lastLogin: 'Today, 09:02 AM IST', status: 'Active',
  },
  field: {
    label: 'Field Officer', short: 'FO', subtitle: 'NER Field Operations', nav: FO_NAV,
    contextLabel: 'Assigned Area', context: 'Dimapur District, Nagaland',
    profileName: 'Ravi Kumar', profileInitials: 'RK',
    officerId: 'NER-FO-1024', department: 'Field Operations & Incident Response',
    region: 'Dimapur District, Nagaland', phone: '+91 88764 51024',
    email: 'ravi.kumar@nagaland.gov.in', lastLogin: 'Today, 10:05 AM IST', status: 'On Duty',
  },
};

interface ShellProps {
  role: Role;
  page: string;
  setPage: (p: string) => void;
  onSwitchRole: (r: Role) => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

const ROLE_SWITCHER: { key: Role; label: string; short: string }[] = [
  { key: 'field', label: 'Field Officer', short: 'FO' },
  { key: 'district', label: 'District Officer', short: 'DO' },
  { key: 'control', label: 'Control Officer', short: 'CO' },
];

export default function Shell({ role, page, setPage, onSwitchRole, onLogout, children }: ShellProps) {
  const meta = ROLE_META[role] ?? ROLE_META.district;
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [now] = useState(
    new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short',
    })
  );

  return (
    /*
      Root sits directly over the CSS gradient background defined in index.css.
      Sidebar is the only fully-opaque surface (solid navy per ops.md).
      Everything else lets the gradient show through via rgba/backdrop-blur.
    */
    <div className="flex h-full overflow-hidden">

      {/* ── Sidebar — solid navy, per ops.md ─────────────────────── */}
      <aside
        className="flex-shrink-0 flex flex-col h-full overflow-hidden transition-all duration-200"
        style={{
          width: collapsed ? 0 : 244,
          minWidth: collapsed ? 0 : 244,
          background: '#17324D',
          borderRight: '1px solid #0F2538',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: '#0F2538' }}>
          <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{ background: '#D7A73A', color: '#17212B' }}>
            {meta.short}
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight" style={{ color: '#FAF7F0' }}>
              {meta.label}
            </div>
            <div className="text-xs leading-tight" style={{ color: '#4A6A82' }}>
              {meta.subtitle}
            </div>
          </div>
        </div>

        {/* Active context */}
        <div className="px-5 py-3 border-b flex-shrink-0"
          style={{ background: '#122840', borderColor: '#0F2538' }}>
          <div className="text-xs uppercase tracking-widest mb-0.5"
            style={{ color: '#4A6A82', fontSize: 10 }}>
            {meta.contextLabel}
          </div>
          <div className="font-medium text-sm" style={{ color: '#FAF7F0' }}>
            {meta.context}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#5DBB8A' }} />
            <span className="text-xs" style={{ color: '#4A6A82' }}>System Online</span>
          </div>
        </div>

        {/* Nav — only the active role's menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <div className="text-xs uppercase tracking-widest mb-2 px-2"
            style={{ color: '#4A6A82', fontSize: 10 }}>
            Main Menu
          </div>
          <ul className="space-y-0.5">
            {meta.nav.map(item => {
              const active = page === item.key;
              return (
                <li key={item.key}>
                  <button
                    onClick={() => setPage(item.key)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all text-left"
                    style={{
                      background: active ? '#1C3F5A' : 'transparent',
                      color: active ? '#FAF7F0' : '#8AAFC8',
                      borderLeft: `3px solid ${active ? '#D7A73A' : 'transparent'}`,
                    }}
                    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#D6E4EF'; } }}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8AAFC8'; } }}
                  >
                    <span className="text-sm w-4 text-center flex-shrink-0"
                      style={{ color: (item as any).gold ? '#D7A73A' : active ? '#D7A73A' : '#4A6A82' }}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {(item as any).badge && (
                      <span className="text-xs rounded-full px-1.5 py-0.5 font-semibold min-w-[20px] text-center"
                        style={{ background: (item as any).badge > 2 ? '#BE2424' : '#D7A73A', color: 'white' }}>
                        {(item as any).badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t flex-shrink-0" style={{ borderColor: '#0F2538' }}>
          {/* Role switcher — the authenticated role is set here (no separate select page) */}
          <div className="mb-2">
            <div className="text-xs uppercase tracking-widest mb-1.5 px-1" style={{ color: '#4A6A82', fontSize: 10 }}>
              Viewing As
            </div>
            <div className="grid grid-cols-3 gap-1">
              {ROLE_SWITCHER.map(r => {
                const active = role === r.key;
                return (
                  <button key={r.key} onClick={() => onSwitchRole(r.key)} title={r.label}
                    className="py-1.5 rounded text-xs font-semibold transition-all"
                    style={{
                      background: active ? '#D7A73A' : '#122840',
                      color: active ? '#17212B' : '#8AAFC8',
                    }}>
                    {r.short}
                  </button>
                );
              })}
            </div>
          </div>
          {[
            { label: 'Help & Support', icon: '?' },
            { label: 'Logout',         icon: '→' },
          ].map(item => (
            <button key={item.label}
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-left transition-colors"
              style={{ color: '#4A6A82' }}
              onClick={item.label === 'Logout' ? onLogout : undefined}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#FAF7F0')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#4A6A82')}>
              <span className="w-4 text-center">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main column ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/*
          Header — semi-transparent so the gradient shows through.
          Matches the image's minimal top strip: breadcrumb left, status right.
        */}
        <header
          className="flex-shrink-0 flex items-center gap-3 px-5"
          style={{
            height: 52,
            background: 'rgba(245, 236, 220, 0.72)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(180,162,136,0.35)',
          }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 flex items-center justify-center rounded text-lg transition-colors"
            style={{ color: '#17324D' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(200,180,150,0.3)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            ≡
          </button>

          {/*
            Breadcrumb — small-caps, exactly matching the image's
            "MYTRACKER › FIELD OFFICER ACCESS" treatment.
          */}
          <nav className="flex items-center gap-1 min-w-0" style={{ fontSize: 10 }}>
            <span className="uppercase tracking-widest" style={{ color: 'rgba(90,102,112,0.8)' }}>NER PLATFORM</span>
            <span style={{ color: 'rgba(180,162,136,0.8)', margin: '0 2px' }}>›</span>
            <span className="uppercase tracking-widest" style={{ color: 'rgba(90,102,112,0.8)' }}>{meta.label.toUpperCase()}</span>
            <span style={{ color: 'rgba(180,162,136,0.8)', margin: '0 2px' }}>›</span>
            <span className="uppercase tracking-widest font-semibold" style={{ color: '#17324D' }}>
              {TITLES[page] ?? page.toUpperCase()}
            </span>
          </nav>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative hidden sm:block">
            <input
              placeholder="Search incidents, routes, officers…"
              className="pl-8 pr-4 py-1.5 rounded border text-xs outline-none"
              style={{
                background: 'rgba(245,236,220,0.6)',
                borderColor: 'rgba(180,162,136,0.5)',
                color: '#17212B',
                width: 220,
                backdropFilter: 'blur(8px)',
              }}
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: '#8A9098' }}>⊕</span>
          </div>

          {/* Time */}
          <div className="hidden md:block uppercase tracking-widest"
            style={{ fontSize: 10, color: 'rgba(90,102,112,0.8)' }}>
            {now} IST
          </div>

          {/* Notification */}
          <button className="relative w-8 h-8 flex items-center justify-center rounded transition-colors"
            style={{ background: 'rgba(245,236,220,0.5)', border: '1px solid rgba(180,162,136,0.4)' }}>
            <span style={{ color: '#17324D', fontSize: 14 }}>◬</span>
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full" style={{ background: '#BE2424' }} />
          </button>

          {/*
            Online status — exactly matches the image's "● ONLINE (1.2)" pill
            at top-right corner.
          */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border"
            style={{
              background: 'rgba(234,242,236,0.7)',
              borderColor: 'rgba(100,180,140,0.4)',
              color: '#2D6B4F',
              fontSize: 10,
              letterSpacing: '0.06em',
            }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#5DBB8A' }} />
            ONLINE
          </div>

          {/* Profile */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 ml-1 rounded-full border transition-all"
            style={{ borderColor: 'rgba(120,140,160,0.35)', background: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.7)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.45)')}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: '#17324D', color: 'white', boxShadow: '0 0 0 2px rgba(215,167,58,0.55)' }}>
              {meta.profileInitials}
            </span>
            <span className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-xs font-semibold whitespace-nowrap" style={{ color: '#16222E' }}>{meta.profileName}</span>
              <span className="whitespace-nowrap mt-0.5" style={{ fontSize: 10, color: '#6B7885' }}>{meta.label}</span>
            </span>
            <span className="hidden sm:block text-xs" style={{ color: '#8A9098' }}>▾</span>
          </button>
        </header>

        {/* Page content — transparent so the gradient shows as ambient bg */}
        <main className="flex-1 overflow-y-auto p-6" style={{ background: 'transparent' }}>
          <div key={page} className="ui-page">
            {children}
          </div>
        </main>
      </div>

      {/* Role-aware profile / settings slide-over */}
      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} meta={meta} />
    </div>
  );
}
