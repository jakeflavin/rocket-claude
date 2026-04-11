import { describe, it, expect } from 'vitest'
import { Formatters } from './formatters'

describe('Formatters.currency', () => {
  it('formats positive amounts with default $ symbol', () => {
    expect(Formatters.currency(1234.56)).toBe('$1,234.56')
  })
  it('formats zero', () => {
    expect(Formatters.currency(0)).toBe('$0.00')
  })
  it('accepts a custom symbol', () => {
    expect(Formatters.currency(100, '€')).toBe('€100.00')
  })
})

describe('Formatters.date', () => {
  it('formats YYYY-MM-DD to long display date', () => {
    expect(Formatters.date('2026-01-15')).toBe('Jan 15, 2026')
  })
  it('returns empty string for empty input', () => {
    expect(Formatters.date('')).toBe('')
  })
})

describe('Formatters.shortDate', () => {
  it('omits year', () => {
    expect(Formatters.shortDate('2026-01-15')).toBe('Jan 15')
  })
  it('returns empty string for empty input', () => {
    expect(Formatters.shortDate('')).toBe('')
  })
})

describe('Formatters.monthYear', () => {
  it('returns full month and year', () => {
    expect(Formatters.monthYear('2026-01-15')).toBe('January 2026')
  })
  it('works with YYYY-MM format', () => {
    expect(Formatters.monthYear('2026-01')).toBe('January 2026')
  })
  it('returns empty string for empty input', () => {
    expect(Formatters.monthYear('')).toBe('')
  })
})

describe('Formatters.percent', () => {
  it('defaults to 0 decimal places', () => {
    expect(Formatters.percent(75)).toBe('75%')
  })
  it('respects decimal parameter', () => {
    expect(Formatters.percent(75.5, 1)).toBe('75.5%')
  })
  it('formats zero', () => {
    expect(Formatters.percent(0)).toBe('0%')
  })
})

describe('Formatters.relativeDate', () => {
  it('returns empty string for empty input', () => {
    expect(Formatters.relativeDate('')).toBe('')
  })
  it('falls back to long date for old dates', () => {
    expect(Formatters.relativeDate('2020-01-01')).toBe('Jan 1, 2020')
  })
})
