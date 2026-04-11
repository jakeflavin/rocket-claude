/**
 * CsvParser — PapaParse wrapper for transactions.csv.
 *
 * Handles loading, row validation, and normalization so the
 * useTransactions hook receives a clean, typed array every time.
 */
import Papa from 'papaparse'
import type { Transaction } from '../types'

const REQUIRED_FIELDS: (keyof Transaction)[] = [
  'id', 'date', 'amount', 'description',
  'normalized_description', 'merchant', 'category',
  'account', 'account_type', 'source_file',
]

function isValid(row: unknown): boolean {
  if (!row || typeof row !== 'object') return false
  const r = row as Record<string, unknown>
  return REQUIRED_FIELDS.every(field => {
    const val = r[field]
    return val !== undefined && val !== null && String(val).trim() !== ''
  })
}

function normalize(row: Record<string, unknown>): Transaction {
  return {
    ...(row as Omit<Transaction, 'amount' | 'needs_review' | 'notes' | 'subcategory'>),
    amount:       Number(row.amount),
    needs_review: String(row.needs_review).trim().toLowerCase() === 'true',
    notes:        row.notes       != null ? String(row.notes)       : '',
    subcategory:  row.subcategory != null ? String(row.subcategory) : '',
  } as Transaction
}

function parse(
  path: string,
  onComplete: (rows: Transaction[]) => void,
  onError: (msg: string) => void
): void {
  Papa.parse(path, {
    download:        true,
    header:          true,
    dynamicTyping:   true,
    skipEmptyLines:  true,
    complete({ data, errors }) {
      if (errors.length > 0) {
        const critical = errors.filter(e => e.type === 'Delimiter' || e.type === 'Quotes')
        if (critical.length > 0) {
          onError(`CSV parse error: ${critical[0].message}`)
          return
        }
      }

      const rows = data as Record<string, unknown>[]
      const valid = rows
        .filter(row => isValid(row))
        .map(row  => normalize(row))

      const dropped = rows.length - valid.length
      if (dropped > 0) {
        console.warn(`[CsvParser] Dropped ${dropped} malformed row(s) from ${path}`)
      }

      onComplete(valid)
    },
    error(err) {
      onError(err.message || 'Failed to load transactions.csv')
    },
  })
}

export const CsvParser = { REQUIRED_FIELDS, isValid, normalize, parse }
