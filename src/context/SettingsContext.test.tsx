import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { SettingsProvider, useSettings } from './SettingsContext'
import type { Settings } from '../types'

const mockSettings: Settings = {
  user: { name: 'Test', currency: 'USD', currencySymbol: '$', locale: 'en-US', theme: 'dark' },
  dashboard: { recentTransactionsCount: 10, upcomingBillsCount: 5 },
  budgets: {},
  categories: [{ name: 'Groceries', color: '#84cc16', icon: 'ShoppingCart' }],
  accounts: [],
  notifications: { needsReview: true, overBudget: true, upcomingBills: true, billDueSoon: true },
  data: { csvPath: './data/transactions.csv' },
}

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockSettings),
  })
  localStorage.clear()
})

function SettingsConsumer() {
  const { settings } = useSettings()
  return <div data-testid="name">{settings.user.name}</div>
}

function Wrapper({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>
}

describe('SettingsProvider', () => {
  it('fetches and exposes settings to consumers', async () => {
    render(<SettingsConsumer />, { wrapper: Wrapper })
    await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Test'))
  })

  it('shows error state when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    render(<SettingsConsumer />, { wrapper: Wrapper })
    await waitFor(() => expect(screen.getByText(/Failed to load settings/)).toBeInTheDocument())
  })

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}))
    render(<SettingsConsumer />, { wrapper: Wrapper })
    expect(screen.getByText(/loading settings/)).toBeInTheDocument()
  })
})

describe('useSettings', () => {
  it('throws when used outside SettingsProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<SettingsConsumer />)).toThrow('useSettings must be used inside SettingsProvider')
    spy.mockRestore()
  })
})
