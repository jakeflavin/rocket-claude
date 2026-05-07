export type Account = {
  id: string;
  name: string;
  institution: string;
  type: 'depository' | 'credit' | 'investment';
  subtype: 'checking' | 'savings' | 'credit card' | 'brokerage';
  currency: string;
  balance: number;
  available_balance: number | null;
  credit_limit: number | null;
  is_hidden: boolean;
  is_closed: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AccountGroup = {
  label: string;
  subtype: string;
  accounts: Account[];
};

export const SUBTYPE_GROUP_LABEL: Record<string, string> = {
  checking: 'Checking Accounts',
  savings: 'Savings Accounts',
  'credit card': 'Credit Cards',
};

export const GROUPED_SUBTYPES = ['checking', 'savings', 'credit card'] as const;
