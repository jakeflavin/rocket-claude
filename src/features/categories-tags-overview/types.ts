export type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  icon: string | null;
  color: string;
  system: boolean;
  created_at: string;
};

export type CategorySpending = {
  category_id: string;
  category_name: string;
  color: string;
  total: number;
  transaction_count: number;
};

export type SubcategorySpending = {
  subcategory_id: string;
  subcategory_name: string;
  parent_id: string;
  color: string;
  total: number;
  transaction_count: number;
};

export type UncategorizedTransaction = {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  account_id: string;
};

export type SpendingPeriod = 'month' | 'quarter' | 'year';

export type PanelState =
  | { mode: 'category'; category: Category }
  | { mode: 'subcategory'; category: Category; parent: Category }
  | { mode: 'newCategory' }
  | { mode: 'newSubcategory'; parent: Category }
  | null;
