/**
 * Formatters — display helpers for currency, dates, and percentages.
 *
 * All functions are pure and stateless. Callers are responsible for
 * passing locale/symbol values sourced from settings.json.
 *
 * Exposed on window.Formatters so all components can access without imports.
 */
window.Formatters = {

  /**
   * Format a number as a currency string.
   * Always pass Math.abs(amount) — sign/color is handled by the component.
   *
   * @param {number} amount - Absolute value of the amount
   * @param {string} [symbol='$'] - Currency symbol from settings.user.currencySymbol
   * @param {string} [locale='en-US'] - Locale from settings.user.locale
   * @returns {string} e.g. '$1,234.56'
   */
  currency(amount, symbol = '$', locale = 'en-US') {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${symbol}${formatted}`;
  },

  /**
   * Format a YYYY-MM-DD date string as a long display date.
   *
   * @param {string} dateStr - 'YYYY-MM-DD'
   * @returns {string} e.g. 'Jan 15, 2026'
   */
  date(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  },

  /**
   * Format a YYYY-MM-DD date string as a compact date (no year).
   *
   * @param {string} dateStr - 'YYYY-MM-DD'
   * @returns {string} e.g. 'Jan 15'
   */
  shortDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  },

  /**
   * Format a YYYY-MM-DD date string as 'Month YYYY' for headings.
   *
   * @param {string} dateStr - 'YYYY-MM-DD' or 'YYYY-MM'
   * @returns {string} e.g. 'January 2026'
   */
  monthYear(dateStr) {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  },

  /**
   * Format a number as a percentage string. The caller is responsible
   * for computing the percentage value (0–100).
   *
   * @param {number} value - Percentage value, e.g. 75.5
   * @param {number} [decimals=0] - Decimal places to show
   * @returns {string} e.g. '75%' or '75.5%'
   */
  percent(value, decimals = 0) {
    return `${Number(value).toFixed(decimals)}%`;
  },

  /**
   * Format a YYYY-MM-DD date string as a human-readable relative time.
   * Falls back to Formatters.date() for dates older than ~2 months.
   *
   * @param {string} dateStr - 'YYYY-MM-DD'
   * @returns {string} e.g. 'today', 'yesterday', '3 days ago', 'Jan 15, 2026'
   */
  relativeDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - date) / 86400000);

    if (diffDays === 0)  return 'today';
    if (diffDays === 1)  return 'yesterday';
    if (diffDays < 7)   return `${diffDays} days ago`;
    if (diffDays < 14)  return '1 week ago';
    if (diffDays < 30)  return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 60)  return '1 month ago';
    return window.Formatters.date(dateStr);
  },
};
