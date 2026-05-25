import { useEffect, useState } from 'react';
import {
  queryDashboardSummary,
  queryDashboardCashFlow,
  queryDashboardAccounts,
  queryDashboardBudgets,
  queryDashboardRecentTransactions,
  queryDashboardUpcomingBills,
} from './queries';
import type { DashboardData } from './types';

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const summary = await queryDashboardSummary();
        const cashFlow = await queryDashboardCashFlow();
        const accounts = await queryDashboardAccounts();
        const budgets = await queryDashboardBudgets();
        const recentTransactions = await queryDashboardRecentTransactions();
        const upcomingBills = await queryDashboardUpcomingBills();
        if (!cancelled) {
          setData({ summary, cashFlow, accounts, budgets, recentTransactions, upcomingBills });
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}
