import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTransactions } from './useTransactions'
import type { Transaction } from '../types'

vi.mock('../utils/csvParser', () => ({
  CsvParser: {
    parse: vi.fn(),
  },
}))

import { CsvParser } from '../utils/csvParser'

const makeTxn = (overrides: Partial<Transaction> = {}): Transaction => ({
  id:                     '1',
  date:                   '2026-04-10',
  description:            '',
  normalized_description: '',
  amount:                 -50,
  merchant:               'Starbucks',
  category:               'Food & Drink',
  subcategory:            '',
  account:                'Chase',
  account_type:           'checking',
  source_file:            'chase.csv',
  needs_review:           false,
  notes:                  '',
  created_at:             '',
  updated_at:             '',
  ...overrides,
})

const mockTransactions: Transaction[] = [
  makeTxn({ id: '1', date: '2026-04-10', amount: -50 }),
  makeTxn({ id: '2', date: '2026-04-09', amount: 2000, category: 'Income', account_type: 'checking' }),
  makeTxn({ id: '3', date: '2026-04-08', amount: -9.99, category: 'Subscriptions' }),
  makeTxn({ id: '4', date: '2026-04-07', amount: -120, category: 'Utilities' }),
]

beforeEach(() => {
  vi.mocked(CsvParser.parse).mockImplementation((_path, onComplete) => {
    onComplete(mockTransactions)
  })
})

describe('useTransactions', () => {
  it('starts loading and then resolves', async () => {
    const { result } = renderHook(() => useTransactions())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
  })

  it('returns all transactions sorted date descending', async () => {
    const { result } = renderHook(() => useTransactions())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const dates = result.current.transactions.map(t => t.date)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it('filters expenses (amount < 0, not Transfers/Payments)', async () => {
    const { result } = renderHook(() => useTransactions())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.expenses.every(t => t.amount < 0)).toBe(true)
  })

  it('filters income (amount > 0, not credit, not Transfers/Payments)', async () => {
    const { result } = renderHook(() => useTransactions())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.income.every(t => t.amount > 0)).toBe(true)
    expect(result.current.income).toHaveLength(1)
  })

  it('filters subscriptions by category', async () => {
    const { result } = renderHook(() => useTransactions())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.subscriptions.every(t => t.category === 'Subscriptions')).toBe(true)
  })

  it('sets error state when parse fails', async () => {
    vi.mocked(CsvParser.parse).mockImplementationOnce((_path, _onComplete, onError) => {
      onError('File not found')
    })
    const { result } = renderHook(() => useTransactions())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('File not found')
    expect(result.current.transactions).toHaveLength(0)
  })
})
