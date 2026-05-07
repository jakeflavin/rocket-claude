export type DashboardSummary = {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthIncome: number;
  monthExpenses: number;
  monthNet: number;
};

export type DashboardCashFlowPoint = {
  label: string;
  income: number;
  expenses: number;
  net: number;
};

export type DashboardAccountRow = {
  id: string;
  name: string;
  institution: string;
  type: string;
  balance: number;
  sparklineData: number[];
};

export type DashboardBudgetRow = {
  id: string;
  category_name: string;
  category_color: string;
  amount: number;
  spent: number;
  utilization: number;
};

export type DashboardTransaction = {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category_name: string;
};

export type DashboardBill = {
  id: string;
  merchant: string;
  amount: number;
  frequency: string;
  next_due_date: string;
  category_name: string;
};

export type DashboardData = {
  summary: DashboardSummary;
  cashFlow: DashboardCashFlowPoint[];
  accounts: DashboardAccountRow[];
  budgets: DashboardBudgetRow[];
  recentTransactions: DashboardTransaction[];
  upcomingBills: DashboardBill[];
};
