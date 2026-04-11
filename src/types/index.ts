// ─── Transaction (matches CSV columns exactly) ────────────────────────────────

export interface Transaction {
  id:                     string
  date:                   string       // 'YYYY-MM-DD'
  description:            string
  normalized_description: string
  amount:                 number       // negative = expense, positive = income
  merchant:               string
  category:               string
  subcategory:            string
  account:                string
  account_type:           string       // 'checking' | 'savings' | 'credit_card' | 'credit'
  source_file:            string
  needs_review:           boolean
  notes:                  string
  created_at:             string
  updated_at:             string
}

// ─── Settings (matches settings.json shape) ───────────────────────────────────

export interface CategoryConfig {
  name:  string
  color: string   // hex, e.g. '#10b981'
  icon:  string   // Lucide icon name
}

export interface AccountConfig {
  name: string
  type: string
}

export interface AccountAlias {
  displayName: string
  type:        string
}

export interface Settings {
  user: {
    name:           string
    currency:       string
    currencySymbol: string
    locale:         string
    theme:          'dark' | 'light' | 'system'
  }
  dashboard: {
    recentTransactionsCount: number
    upcomingBillsCount:      number
  }
  budgets:       Record<string, number>
  categories:    CategoryConfig[]
  accounts:      AccountConfig[]
  notifications: {
    needsReview:   boolean
    overBudget:    boolean
    upcomingBills: boolean
    billDueSoon:   boolean
  }
  data: {
    csvPath: string
  }
  accountAliases?: Record<string, AccountAlias>
}

// ─── Categorizer output types ─────────────────────────────────────────────────

export type BillStatus = 'paid' | 'due_soon' | 'overdue' | 'upcoming'

export interface BillGroup {
  merchant:         string
  category:         string
  subcategory:      string
  account:          string
  lastPaidDate:     string
  lastAmount:       number
  averageAmount:    number
  estimatedNextDue: string
  status:           BillStatus
  transactions:     Transaction[]
}

export interface SubscriptionGroup {
  merchant:        string
  subcategory:     string
  account:         string
  lastChargedDate: string
  monthlyAmount:   number
  transactions:    Transaction[]
}

// ─── Chart types ──────────────────────────────────────────────────────────────

export interface ChartSlice {
  label:  string
  amount: number
  color:  string
}

// ─── useTransactions return type ──────────────────────────────────────────────

export interface UseTransactionsResult {
  transactions:       Transaction[]
  expenses:           Transaction[]
  income:             Transaction[]
  needsReview:        Transaction[]
  subscriptions:      Transaction[]
  bills:              Transaction[]
  billGroups:         BillGroup[]
  subscriptionGroups: SubscriptionGroup[]
  loading:            boolean
  error:              string | null
  reload:             () => void
}

// ─── SettingsContext ──────────────────────────────────────────────────────────

export interface SettingsContextValue {
  settings:    Settings
  setSettings: (updater: Settings | ((prev: Settings) => Settings)) => void
}
