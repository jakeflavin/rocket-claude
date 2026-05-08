import { useCallback, useEffect, useState } from 'react';
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
  'categories/rules': ['Transactions', 'Rules'],
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
    <AppLayout currentPage={page} breadcrumbs={BREADCRUMBS[page] ?? []} onNavigate={navigate}>
      {page === 'home' && <HomePage onNavigate={navigate} />}
      {page === 'transactions' && <TransactionsPage />}
      {page === 'accounts' && <AccountOverviewPage onNavigate={navigate} />}
      {page === 'categories/rules' && <CategoryRulesPage />}
      {page === 'subscriptions' && <SubscriptionsPage />}
      {page === 'spending' && <SpendingPage />}
      {page === 'budgets' && <BudgetsPage />}
      {page === 'goals' && <GoalsPage />}
    </AppLayout>
  );
}

export default App;
