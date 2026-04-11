/**
 * Formatters — display helpers for currency, dates, and percentages.
 *
 * All functions are pure and stateless. Callers are responsible for
 * passing locale/symbol values sourced from settings.json.
 */

/**
 * Format a number as a currency string.
 * Always pass Math.abs(amount) — sign/color is handled by the component.
 */
export function currency(amount: number, symbol = '$', locale = 'en-US'): string {
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${symbol}${formatted}`
}

/**
 * Format a YYYY-MM-DD date string as a long display date.
 * Returns '' for falsy input.
 */
export function date(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a YYYY-MM-DD date string as a compact date (no year).
 */
export function shortDate(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a YYYY-MM-DD date string as 'Month YYYY' for headings.
 * Also accepts 'YYYY-MM' format.
 */
export function monthYear(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format a number as a percentage string.
 * The caller is responsible for computing the percentage value (0–100).
 */
export function percent(value: number, decimals = 0): string {
  return `${Number(value).toFixed(decimals)}%`
}

/**
 * Format a YYYY-MM-DD date string as a human-readable relative time.
 * Falls back to date() for dates older than ~2 months.
 */
export function relativeDate(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000)

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7)  return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 60) return '1 month ago'
  return date(dateStr)
}

export const Formatters = { currency, date, shortDate, monthYear, percent, relativeDate }
