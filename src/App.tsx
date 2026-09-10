import { useEffect, useState } from 'react';
import LoginTab from './auth/LoginTab';
import CreateAccountTab from './auth/CreateAccountTab';
import IdentityPanel from './auth/IdentityPanel';
import FormShell from './auth/FormShell';
import TransitionOverlay from './auth/TransitionOverlay';
import GlassFilters from './auth/GlassFilters';
import Shell from '@/components/Shell';
import type { Role } from '@/roles';
import Dashboard from '@/pages/Dashboard';
import DistrictMap from '@/pages/DistrictMap';
import Incidents from '@/pages/Incidents';
import Routes from '@/pages/Routes';
import Logistics from '@/pages/Logistics';
import FieldOfficerDashboard from '@/pages/FieldOfficerDashboard';
import FOMyTasks from '@/pages/fo/MyTasks';
import FOReportIncident from '@/pages/fo/ReportIncident';
import FORouteStatus from '@/pages/fo/RouteStatus';
import FOLogistics from '@/pages/fo/Logistics';
import FOAlerts from '@/pages/fo/Alerts';
import FOReports from '@/pages/fo/Reports';
import CommandCenter from '@/pages/control/CommandCenter';
import Tasks from '@/pages/Tasks';
import AIInsights from '@/pages/AIInsights';
import Alerts from '@/pages/Alerts';
import Reports from '@/pages/Reports';
import Analytics from '@/pages/Analytics';

type Screen = 'splash' | 'login' | 'create';
type Dir = 'forward' | 'back';
type Transition = { to: Screen; dir: Dir; stage: 'cover' | 'reveal' };

const DEFAULT_PAGE: Record<Role, string> = {
  control: 'cr-command',
  district: 'dashboard',
  field: 'fo-dashboard',
};

function roleFromIdentity(identity: string): Role {
  const value = identity.toLowerCase();
  if (value.includes('field') || value.includes('fo-') || value.includes('fo@')) return 'field';
  if (value.includes('control') || value.includes('co-') || value.includes('co@')) return 'control';
  return 'district';
}

function roleFromPath(pathname: string): Role | null {
  if (pathname.endsWith('/field')) return 'field';
  if (pathname.endsWith('/control')) return 'control';
  if (pathname.endsWith('/district')) return 'district';
  return null;
}

function dashboardPath(role: Role) {
  return `/dashboard/${role}`;
}

function screenFromPath(pathname: string): Screen {
  if (pathname === '/login') return 'login';
  if (pathname === '/create-account') return 'create';
  if (pathname.startsWith('/dashboard/')) return 'login';
  return 'splash';
}

export default function App() {
  const [session, setSession] = useState<Role | null>(() => {
    const saved = window.localStorage.getItem('ner-session-role') as Role | null;
    const requested = roleFromPath(window.location.pathname);
    return saved && (!requested || saved === requested) ? saved : null;
  });
  const [screen, setScreen] = useState<Screen>(() => screenFromPath(window.location.pathname));
  const [trans, setTrans] = useState<Transition | null>(null);

  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const handlePopState = () => {
      const pathRole = roleFromPath(window.location.pathname);
      if (pathRole && session === pathRole) return;
      setScreen(screenFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [session]);

  const navigate = (to: Screen, dir: Dir) => {
    if (trans) return;
    const path = to === 'login' ? '/login' : to === 'create' ? '/create-account' : '/';
    window.history.pushState({}, '', path);
    if (prefersReduced) {
      setScreen(to);
      return;
    }
    setTrans({ to, dir, stage: 'cover' });
  };

  const swap = (to: Screen) => {
    if (trans) return;
    window.history.pushState({}, '', to === 'login' ? '/login' : '/create-account');
    setScreen(to);
  };

  useEffect(() => {
    if (!trans) return;
    if (trans.stage === 'cover') {
      const timer = setTimeout(() => {
        setScreen(trans.to);
        setTrans((current) => current ? { ...current, stage: 'reveal' } : null);
      }, 850);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setTrans(null), 950);
    return () => clearTimeout(timer);
  }, [trans]);

  const login = (identity: string) => {
    const role = roleFromIdentity(identity);
    window.localStorage.setItem('ner-session-role', role);
    setSession(role);
    window.history.pushState({}, '', dashboardPath(role));
  };

  const logout = () => {
    window.localStorage.removeItem('ner-session-role');
    setSession(null);
    window.history.pushState({}, '', '/');
    setScreen('splash');
  };

  if (session) {
    return <DashboardApp initialRole={session} onLogout={logout} />;
  }

  return (
    <>
      <div key={screen}>
        {screen === 'login' && (
          <FormShell
            onBack={() => navigate('splash', 'back')}
            title="Access your workspace"
            footerLink={{ label: "Don't have access?", action: 'Create an account', onClick: () => swap('create') }}
          >
            <LoginTab onLogin={login} />
          </FormShell>
        )}
        {screen === 'create' && (
          <FormShell
            onBack={() => navigate('splash', 'back')}
            title="Request platform access"
            footerLink={{ label: 'Already have access?', action: 'Log in', onClick: () => swap('login') }}
          >
            <CreateAccountTab />
          </FormShell>
        )}
        {screen === 'splash' && <IdentityPanel onLogin={() => navigate('login', 'forward')} onCreate={() => navigate('create', 'forward')} />}
      </div>
      {trans && <TransitionOverlay stage={trans.stage} dir={trans.dir} />}
      <GlassFilters />
    </>
  );
}

function DashboardApp({ initialRole, onLogout }: { initialRole: Role; onLogout: () => void }) {
  const [role, setRole] = useState<Role>(initialRole);
  const [page, setPage] = useState(DEFAULT_PAGE[initialRole]);

  const switchRole = (nextRole: Role) => {
    if (nextRole !== initialRole) return;
    setRole(nextRole);
    setPage(DEFAULT_PAGE[nextRole]);
    window.history.replaceState({}, '', dashboardPath(nextRole));
    window.localStorage.setItem('ner-session-role', nextRole);
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard setPage={setPage} />;
      case 'map': return <DistrictMap />;
      case 'incidents': return <Incidents />;
      case 'routes': return <Routes />;
      case 'logistics': return <Logistics />;
      case 'tasks': return <Tasks />;
      case 'ai': return <AIInsights />;
      case 'alerts': return <Alerts />;
      case 'reports': return <Reports />;
      case 'analytics': return <Analytics />;
      case 'fo-dashboard': return <FieldOfficerDashboard setPage={setPage} />;
      case 'fo-tasks': return <FOMyTasks />;
      case 'fo-report': return <FOReportIncident setPage={setPage} />;
      case 'fo-routes': return <FORouteStatus />;
      case 'fo-logistics': return <FOLogistics />;
      case 'fo-alerts': return <FOAlerts />;
      case 'fo-reports': return <FOReports />;
      case 'cr-command': return <CommandCenter setPage={setPage} />;
      default: return <Dashboard setPage={setPage} />;
    }
  };

  return (
    <Shell role={role} page={page} setPage={setPage} onSwitchRole={switchRole} onLogout={onLogout}>
      {renderPage()}
    </Shell>
  );
}
