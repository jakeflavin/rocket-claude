export type SpendingPeriod = 'monthly' | 'yearly';

export type PeriodPoint = {
  label: string; // e.g. "Jan 2025" or "2025"
  expenses: number; // absolute value (positive)
  income: number;   // positive
  net: number;      // income - expenses (can be negative)
};

export type MerchantSpend = {
  merchant: string;
  total: number;    // absolute value of expenses
  count: number;
};

export type MerchantDetail = {
  merchant: string;
  total: number;
  count: number;
  average: number;
  trend: { label: string; value: number }[]; // monthly spend trend
};

export type SpendingSummary = {
  avgMonthlyExpense: number;
  savingsRate: number;    // 0–100 percentage
  netCashFlow: number;    // income - expenses for the period
};
