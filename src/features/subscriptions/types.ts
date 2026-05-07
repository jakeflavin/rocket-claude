export type RecurringFrequency = 'monthly' | 'biweekly' | 'weekly' | 'annual';
export type RecurringType = 'bill' | 'income' | 'all';
export type RecurringStatus = 'active' | 'cancelled' | 'all';

export type RecurringTransaction = {
  id: string;
  merchant: string;
  amount: number;
  frequency: RecurringFrequency;
  next_due_date: string; // 'YYYY-MM-DD'
  category_id: string;
  category_name: string;
  category_color: string;
  account_id: string;
  account_name: string;
  confidence: number;
  active: boolean;
  created_at: string;
};

export type RecurringFilters = {
  type: RecurringType;
  status: RecurringStatus;
  frequency: RecurringFrequency | 'all';
};

export type RecurringSummary = {
  totalMonthlyExpense: number;
  totalMonthlyIncome: number;
  activeCount: number;
  cancelledCount: number;
  dueThisWeekCount: number;
};

export type RecurringSort = {
  key: keyof RecurringTransaction;
  dir: 'asc' | 'desc';
};

export const DEFAULT_FILTERS: RecurringFilters = {
  type: 'all',
  status: 'active',
  frequency: 'all',
};

export const DEFAULT_SORT: RecurringSort = {
  key: 'next_due_date',
  dir: 'asc',
};
