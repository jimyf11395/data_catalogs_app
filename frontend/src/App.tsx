import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { usersApi, UserRole } from './lib/usersApi';
import AuthPage from './pages/AuthPage';
import CatalogPage from './pages/CatalogPage';
import KpiCatalogPage from './pages/KpiCatalogPage';
import GlossaryPage from './pages/GlossaryPage';
import LineagePage from './pages/LineagePage';
import ReportsPage from './pages/ReportsPage';
import DqRulesPage from './pages/DqRulesPage';
import UsersPage from './pages/UsersPage';

type Tab = 'catalog' | 'kpis' | 'glossary' | 'lineage' | 'reports' | 'dq-rules' | 'users';

const CATALOG_TABS: { id: Tab; label: string }[] = [
  { id: 'catalog', label: 'Table Catalog' },
  { id: 'kpis', label: 'KPI Catalog' },
  { id: 'glossary', label: 'Business Glossary' },
  { id: 'lineage', label: 'Data Lineage' },
  { id: 'reports', label: 'Report Catalog' },
  { id: 'dq-rules', label: 'Data Quality' },
];

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('catalog');
  const [myRole, setMyRole] = useState<UserRole>('Viewer');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    usersApi.getMyRole(session.access_token)
      .then(({ role }) => setMyRole(role))
      .catch(() => setMyRole('Viewer'));
  }, [session]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!session) return <AuthPage />;

  const tabs = myRole === 'Admin'
    ? [...CATALOG_TABS, { id: 'users' as Tab, label: 'Users' }]
    : CATALOG_TABS;

  return (
    <div>
      <nav className="app-nav">
        <div className="nav-inner">
          <div className="nav-tabs">
            {tabs.map(t => (
              <button key={t.id} className={`nav-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="nav-user">
            <span>{session.user.email}</span>
            {myRole !== 'Viewer' && <span className={`role-badge role-${myRole.toLowerCase()}`}>{myRole}</span>}
            <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
          </div>
        </div>
      </nav>

      {tab === 'catalog' && <CatalogPage session={session} />}
      {tab === 'kpis' && <KpiCatalogPage session={session} />}
      {tab === 'glossary' && <GlossaryPage session={session} />}
      {tab === 'lineage' && <LineagePage session={session} />}
      {tab === 'reports' && <ReportsPage session={session} />}
      {tab === 'dq-rules' && <DqRulesPage session={session} />}
      {tab === 'users' && myRole === 'Admin' && <UsersPage session={session} />}
    </div>
  );
}
