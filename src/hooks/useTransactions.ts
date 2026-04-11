import { useCallback, useEffect, useMemo, useState } from 'react'
import { CsvParser } from '../utils/csvParser'
import { Categorizer } from '../utils/categorizer'
import type { Transaction, UseTransactionsResult } from '../types'

export function useTransactions(): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [version, setVersion]           = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)

    CsvParser.parse(
      '/data/transactions.csv',
      (rows) => {
        const sorted = rows.sort((a, b) => b.date.localeCompare(a.date))
        setTransactions(sorted)
        setLoading(false)
      },
      (errMsg) => {
        setError(errMsg)
        setLoading(false)
      }
    )
  }, [version])

  const expenses = useMemo(
    () => transactions.filter(t => t.amount < 0 && t.category !== 'Transfers' && t.category !== 'Payments'),
    [transactions]
  )

  const income = useMemo(
    () => transactions.filter(t =>
      t.amount > 0 &&
      t.account_type !== 'credit_card' &&
      t.account_type !== 'credit' &&
      t.category !== 'Transfers' &&
      t.category !== 'Payments'
    ),
    [transactions]
  )

  const needsReview = useMemo(
    () => transactions.filter(t => t.needs_review === true),
    [transactions]
  )

  const subscriptions = useMemo(
    () => transactions.filter(t => t.category === 'Subscriptions'),
    [transactions]
  )

  const bills = useMemo(
    () => transactions.filter(t => t.category === 'Utilities' || t.category === 'Housing'),
    [transactions]
  )

  const billGroups = useMemo(
    () => Categorizer.getBills(transactions),
    [transactions]
  )

  const subscriptionGroups = useMemo(
    () => Categorizer.getSubscriptions(subscriptions),
    [subscriptions]
  )

  const reload = useCallback(() => setVersion(v => v + 1), [])

  return {
    transactions,
    expenses,
    income,
    needsReview,
    subscriptions,
    bills,
    billGroups,
    subscriptionGroups,
    loading,
    error,
    reload,
  }
}
