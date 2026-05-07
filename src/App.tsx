import { useCallback, useEffect, useState } from 'react';
import { AppLayout } from './app/AppLayout';
import { TransactionsPage } from './features/transactions/TransactionsPage';
import { AccountOverviewPage } from './features/account-overview/AccountOverviewPage';
import { AccountManagementPage } from './features/account-management/AccountManagementPage';
import { CategoriesOverviewPage } from './features/categories-tags-overview/CategoriesOverviewPage';
import { CategoryRulesPage } from './features/category-rules-management/CategoryRulesPage';

const BREADCRUMBS: Record<string, string[]> = {
  transactions: ['Transactions'],
  accounts: ['Accounts'],
  'accounts/settings': ['Accounts', 'Settings'],
  categories: ['Categories'],
  'categories/rules': ['Categories', 'Rules'],
};

function pathToPage(path: string): string {
  const pathname = path.split('?')[0];
  return pathname.replace(/^\//, '') || 'transactions';
}

function App() {
  const [page, setPage] = useState(() => pathToPage(window.location.pathname));

  useEffect(() => {
    if (window.location.pathname === '/') {
      history.replaceState(null, '', '/transactions');
      setPage('transactions');
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
      {page === 'transactions' && <TransactionsPage />}
      {page === 'accounts' && <AccountOverviewPage onNavigate={navigate} />}
      {page === 'accounts/settings' && <AccountManagementPage />}
      {page === 'categories' && <CategoriesOverviewPage />}
      {page === 'categories/rules' && <CategoryRulesPage />}
    </AppLayout>
  );
}

export default App;
