import { describe, it, expect } from 'vitest'
import { CsvParser } from './csvParser'

const makeRow = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  id:                     'abc123',
  date:                   '2026-01-15',
  amount:                 '-42.50',
  description:            'STARBUCKS',
  normalized_description: 'Starbucks',
  merchant:               'Starbucks',
  category:               'Food & Drink',
  account:                'Chase Checking',
  account_type:           'checking',
  source_file:            'chase.csv',
  needs_review:           'false',
  notes:                  '',
  subcategory:            'Coffee',
  created_at:             '2026-01-15T00:00:00Z',
  updated_at:             '2026-01-15T00:00:00Z',
  ...overrides,
})

describe('CsvParser.isValid', () => {
  it('returns true for a complete row', () => {
    expect(CsvParser.isValid(makeRow())).toBe(true)
  })
  it('returns false when a required field is missing', () => {
    const row = makeRow()
    delete row.merchant
    expect(CsvParser.isValid(row)).toBe(false)
  })
  it('returns false when a required field is empty string', () => {
    expect(CsvParser.isValid(makeRow({ id: '' }))).toBe(false)
  })
  it('returns false for null input', () => {
    expect(CsvParser.isValid(null)).toBe(false)
  })
  it('returns false for non-object input', () => {
    expect(CsvParser.isValid('string')).toBe(false)
  })
})

describe('CsvParser.normalize', () => {
  it('converts amount string to number', () => {
    const result = CsvParser.normalize(makeRow({ amount: '-42.50' }))
    expect(result.amount).toBe(-42.5)
    expect(typeof result.amount).toBe('number')
  })
  it('converts needs_review "true" string to boolean true', () => {
    const result = CsvParser.normalize(makeRow({ needs_review: 'true' }))
    expect(result.needs_review).toBe(true)
  })
  it('converts needs_review "false" string to boolean false', () => {
    const result = CsvParser.normalize(makeRow({ needs_review: 'false' }))
    expect(result.needs_review).toBe(false)
  })
  it('converts needs_review boolean true', () => {
    const result = CsvParser.normalize(makeRow({ needs_review: true }))
    expect(result.needs_review).toBe(true)
  })
  it('sets notes to empty string when null', () => {
    const result = CsvParser.normalize(makeRow({ notes: null }))
    expect(result.notes).toBe('')
  })
  it('sets subcategory to empty string when null', () => {
    const result = CsvParser.normalize(makeRow({ subcategory: null }))
    expect(result.subcategory).toBe('')
  })
  it('preserves existing string notes', () => {
    const result = CsvParser.normalize(makeRow({ notes: 'test note' }))
    expect(result.notes).toBe('test note')
  })
})
