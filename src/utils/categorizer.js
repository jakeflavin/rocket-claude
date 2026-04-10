/**
 * Categorizer — identifies recurring bill merchants from transaction data.
 *
 * A merchant is "recurring" when it appears in 2+ distinct calendar months.
 * Only Utilities and Housing categories are considered bills.
 *
 * Exposed on window.Categorizer.
 */
window.Categorizer = {

  /**
   * Extract recurring bill groups from a transaction array.
   * Returns one entry per merchant that appears in 2+ distinct months,
   * sorted by estimatedNextDue ascending (most urgent first).
   *
   * @param {Array} transactions - full transaction list (all categories)
   * @returns {Array<BillGroup>}
   *
   * @typedef {Object} BillGroup
   * @property {string}  merchant         - Merchant name
   * @property {string}  category         - 'Utilities' or 'Housing'
   * @property {string}  subcategory      - e.g. 'Electricity'
   * @property {string}  account          - Account name
   * @property {string}  lastPaidDate     - 'YYYY-MM-DD' of most recent charge
   * @property {number}  lastAmount       - Amount of most recent charge (negative)
   * @property {number}  averageAmount    - Average charge amount (negative)
   * @property {string}  estimatedNextDue - 'YYYY-MM-DD' estimated next charge
   * @property {string}  status           - 'paid' | 'due_soon' | 'overdue' | 'upcoming'
   * @property {Array}   transactions     - All matching transactions, date desc
   */
  getBills(transactions) {
    const billTxns = transactions.filter(t =>
      t.category === 'Utilities' || t.category === 'Housing'
    );

    // Group by merchant
    const byMerchant = billTxns.reduce((acc, t) => {
      if (!acc[t.merchant]) acc[t.merchant] = [];
      acc[t.merchant].push(t);
      return acc;
    }, {});

    const bills = [];

    Object.entries(byMerchant).forEach(([merchant, txns]) => {
      // Only include recurring merchants (appear in 2+ distinct months)
      const distinctMonths = new Set(txns.map(t => t.date.slice(0, 7)));
      if (distinctMonths.size < 2) return;

      const sorted = [...txns].sort((a, b) => b.date.localeCompare(a.date));
      const latest = sorted[0];
      const avgAmount = txns.reduce((sum, t) => sum + t.amount, 0) / txns.length;
      const estimatedNextDue = window.Categorizer._nextDueDate(latest.date);

      bills.push({
        merchant,
        category:        latest.category,
        subcategory:     latest.subcategory || '',
        account:         latest.account,
        lastPaidDate:    latest.date,
        lastAmount:      latest.amount,
        averageAmount:   avgAmount,
        estimatedNextDue,
        status:          window.Categorizer._getStatus(latest.date, estimatedNextDue),
        transactions:    sorted,
      });
    });

    // Sort by estimatedNextDue ascending (most urgent first)
    return bills.sort((a, b) => a.estimatedNextDue.localeCompare(b.estimatedNextDue));
  },

  /**
   * Group subscription transactions by merchant.
   * Returns one entry per merchant with the most recent charge and monthly cost.
   * Sorted by merchant name ascending.
   *
   * @param {Array} transactions - pre-filtered to category === 'Subscriptions'
   * @returns {Array<SubscriptionGroup>}
   *
   * @typedef {Object} SubscriptionGroup
   * @property {string} merchant      - Merchant name
   * @property {string} subcategory   - 'Streaming' | 'Software' | 'Memberships'
   * @property {string} account       - Account name
   * @property {string} lastChargedDate
   * @property {number} monthlyAmount - Most recent charge amount (negative)
   * @property {Array}  transactions  - All charges, date desc
   */
  getSubscriptions(transactions) {
    const byMerchant = transactions.reduce((acc, t) => {
      if (!acc[t.merchant]) acc[t.merchant] = [];
      acc[t.merchant].push(t);
      return acc;
    }, {});

    return Object.entries(byMerchant)
      .map(([merchant, txns]) => {
        const sorted = [...txns].sort((a, b) => b.date.localeCompare(a.date));
        const latest = sorted[0];
        return {
          merchant,
          subcategory:      latest.subcategory || '',
          account:          latest.account,
          lastChargedDate:  latest.date,
          monthlyAmount:    latest.amount,
          transactions:     sorted,
        };
      })
      .sort((a, b) => a.merchant.localeCompare(b.merchant));
  },

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Estimate next due date: same day of month, one month later.
   * Passing the 1-based month directly to the Date constructor advances
   * by one month (JS Date month is 0-based). Overflow (e.g. Jan 31 → Mar 3)
   * is acceptable for estimation purposes.
   *
   * @param {string} dateStr - 'YYYY-MM-DD'
   * @returns {string} 'YYYY-MM-DD'
   */
  _nextDueDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    // month is 1-based; passing it to Date gives month+1 (next month)
    const next = new Date(year, month, day);
    const y = next.getFullYear();
    const m = String(next.getMonth() + 1).padStart(2, '0');
    const d = String(next.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  /**
   * Determine bill status relative to today.
   *
   * @param {string} lastPaidDate
   * @param {string} estimatedNextDue
   * @returns {'paid' | 'overdue' | 'due_soon' | 'upcoming'}
   */
  _getStatus(lastPaidDate, estimatedNextDue) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);
    const currentMonth = todayStr.slice(0, 7);

    if (lastPaidDate.slice(0, 7) === currentMonth) return 'paid';
    if (estimatedNextDue < todayStr) return 'overdue';

    const diffDays = Math.round(
      (new Date(estimatedNextDue + 'T00:00:00') - today) / 86400000
    );
    if (diffDays <= 7) return 'due_soon';
    return 'upcoming';
  },
};
