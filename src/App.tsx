import { useCallback, useEffect, useState } from 'react';
import { useSettings } from './features/settings/useSettings';
import { SettingsDrawer } from './features/settings/SettingsDrawer';
import { AppLayout } from './app/AppLayout';
import { TransactionsPage } from './features/transactions/TransactionsPage';
import { AccountOverviewPage } from './features/account-overview/AccountOverviewPage';
import { CategoryRulesPage } from './features/category-rules-management/CategoryRulesPage';
import { SubscriptionsPage } from './features/subscriptions/SubscriptionsPage';
import { SpendingPage } from './features/spending-analytics/SpendingPage';
import { BudgetsPage } from './features/budgets/BudgetsPage';
import { GoalsPage } from './features/goals/GoalsPage';
import { HomePage } from './features/home/HomePage';

const BREADCRUMBS: Record<string, string[]> = {
  home: ['Home'],
  transactions: ['Transactions'],
  accounts: ['Accounts'],
  'settings/categories/rules': ['Settings', 'Categories', 'Rules'],
  subscriptions: ['Subscriptions & Bills'],
  spending: ['Spending'],
  budgets: ['Budgets'],
  goals: ['Goals'],
};

function pathToPage(path: string): string {
  const pathname = path.split('?')[0];
  return pathname.replace(/^\//, '') || 'home';
}

function App() {
  const [page, setPage] = useState(() => pathToPage(window.location.pathname));
  const { appearance, setAppearance } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (window.location.pathname === '/') {
      history.replaceState(null, '', '/home');
      setPage('home');
    }
    function onPopState() {
      setPage(pathToPage(window.location.pathname));
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((path: string) => {
    history.pushState(null, '', path);
    setPage(pathToPage(path));
  }, []);

  return (
    <>
      <AppLayout currentPage={page} breadcrumbs={BREADCRUMBS[page] ?? []} onNavigate={navigate} onOpenSettings={() => setSettingsOpen(true)}>
        {page === 'home' && <HomePage onNavigate={navigate} />}
        {page === 'transactions' && <TransactionsPage />}
        {page === 'accounts' && <AccountOverviewPage onNavigate={navigate} />}
        {page === 'settings/categories/rules' && <CategoryRulesPage />}
        {page === 'subscriptions' && <SubscriptionsPage />}
        {page === 'spending' && <SpendingPage />}
        {page === 'budgets' && <BudgetsPage />}
        {page === 'goals' && <GoalsPage />}
      </AppLayout>
      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        appearance={appearance}
        onSetAppearance={setAppearance}
        onNavigate={navigate}
      />
    </>
  );
}

export default App;
