import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Categorizer, getStatus, nextDueDate } from './categorizer'
import type { Transaction } from '../types'

const makeTxn = (overrides: Partial<Transaction> = {}): Transaction => ({
  id:                     'x',
  date:                   '2026-01-15',
  description:            '',
  normalized_description: '',
  amount:                 -100,
  merchant:               'Hydro One',
  category:               'Utilities',
  subcategory:            'Electricity',
  account:                'TD Chequing',
  account_type:           'checking',
  source_file:            'td.csv',
  needs_review:           false,
  notes:                  '',
  created_at:             '',
  updated_at:             '',
  ...overrides,
})

describe('nextDueDate', () => {
  it('advances by one month', () => {
    expect(nextDueDate('2026-01-15')).toBe('2026-02-15')
  })
  it('handles December → January year rollover', () => {
    expect(nextDueDate('2026-12-01')).toBe('2027-01-01')
  })
})

describe('getStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-11T12:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns "paid" when lastPaidDate is in current month', () => {
    expect(getStatus('2026-04-05', '2026-05-05')).toBe('paid')
  })
  it('returns "overdue" when estimatedNextDue is in the past', () => {
    expect(getStatus('2026-02-15', '2026-03-15')).toBe('overdue')
  })
  it('returns "due_soon" when due within 7 days', () => {
    expect(getStatus('2026-03-15', '2026-04-15')).toBe('due_soon')
  })
  it('returns "upcoming" when due more than 7 days out', () => {
    expect(getStatus('2026-03-01', '2026-05-01')).toBe('upcoming')
  })
})

describe('Categorizer.getBills', () => {
  it('returns empty array when no Utilities/Housing transactions', () => {
    const txns = [makeTxn({ category: 'Groceries' })]
    expect(Categorizer.getBills(txns)).toHaveLength(0)
  })
  it('excludes merchants that appear in only 1 month', () => {
    const txns = [makeTxn({ date: '2026-01-15', merchant: 'Hydro One' })]
    expect(Categorizer.getBills(txns)).toHaveLength(0)
  })
  it('includes merchants that appear in 2+ distinct months', () => {
    const txns = [
      makeTxn({ date: '2026-01-15', merchant: 'Hydro One' }),
      makeTxn({ date: '2026-02-18', merchant: 'Hydro One' }),
    ]
    const bills = Categorizer.getBills(txns)
    expect(bills).toHaveLength(1)
    expect(bills[0].merchant).toBe('Hydro One')
  })
  it('sorts results by estimatedNextDue ascending', () => {
    const txns = [
      makeTxn({ date: '2025-11-01', merchant: 'Rogers',    category: 'Utilities' }),
      makeTxn({ date: '2025-12-01', merchant: 'Rogers',    category: 'Utilities' }),
      makeTxn({ date: '2025-10-15', merchant: 'Hydro One', category: 'Utilities' }),
      makeTxn({ date: '2025-11-15', merchant: 'Hydro One', category: 'Utilities' }),
    ]
    const bills = Categorizer.getBills(txns)
    expect(bills[0].estimatedNextDue <= bills[1].estimatedNextDue).toBe(true)
  })
})

describe('Categorizer.getSubscriptions', () => {
  it('excludes positive-amount (refund) transactions', () => {
    const txns = [makeTxn({ category: 'Subscriptions', amount: 10 })]
    expect(Categorizer.getSubscriptions(txns)).toHaveLength(0)
  })
  it('groups by merchant', () => {
    const txns = [
      makeTxn({ merchant: 'Spotify', category: 'Subscriptions', amount: -9.99 }),
      makeTxn({ merchant: 'Spotify', category: 'Subscriptions', amount: -9.99,
                date: '2026-02-01', id: 'y' }),
    ]
    expect(Categorizer.getSubscriptions(txns)).toHaveLength(1)
    expect(Categorizer.getSubscriptions(txns)[0].merchant).toBe('Spotify')
  })
  it('sorts alphabetically by merchant', () => {
    const txns = [
      makeTxn({ merchant: 'Spotify',  category: 'Subscriptions', amount: -9.99  }),
      makeTxn({ merchant: 'Netflix',  category: 'Subscriptions', amount: -15.99, id: 'n' }),
    ]
    const groups = Categorizer.getSubscriptions(txns)
    expect(groups.map(g => g.merchant)).toEqual(['Netflix', 'Spotify'])
  })
})
