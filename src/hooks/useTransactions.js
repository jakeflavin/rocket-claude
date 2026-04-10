/**
 * useTransactions — loads transactions.csv and exposes derived data views.
 *
 * Uses CsvParser.parse() for loading/validation and Categorizer for
 * grouped bill and subscription structures.
 *
 * Returns:
 *   transactions      {Array}    All valid rows, sorted date desc
 *   expenses          {Array}    Rows where amount < 0
 *   income            {Array}    Rows where amount > 0
 *   needsReview       {Array}    Rows where needs_review === true
 *   subscriptions     {Array}    Raw rows where category === 'Subscriptions'
 *   bills             {Array}    Raw rows where category is Utilities or Housing
 *   billGroups        {Array}    Recurring bills grouped by merchant (from Categorizer)
 *   subscriptionGroups{Array}    Subscriptions grouped by merchant (from Categorizer)
 *   loading           {boolean}
 *   error             {string|null}
 *   reload            {Function} Re-fetches the CSV from disk
 */
const useTransactions = () => {
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading]           = React.useState(true);
  const [error, setError]               = React.useState(null);
  const [version, setVersion]           = React.useState(0);

  React.useEffect(() => {
    setLoading(true);
    setError(null);

    CsvParser.parse(
      './data/transactions.csv',
      (rows) => {
        // Sort date descending so newest-first everywhere by default
        const sorted = rows.sort((a, b) => b.date.localeCompare(a.date));
        setTransactions(sorted);
        setLoading(false);
      },
      (errMsg) => {
        setError(errMsg);
        setLoading(false);
      }
    );
  }, [version]);

  // ─── Derived views (memoised to avoid recomputing on every render) ──────────

  const expenses = React.useMemo(
    () => transactions.filter(t => t.amount < 0),
    [transactions]
  );

  const income = React.useMemo(
    () => transactions.filter(t => t.amount > 0 && t.account_type !== 'credit_card'),
    [transactions]
  );

  const needsReview = React.useMemo(
    () => transactions.filter(t => t.needs_review === true),
    [transactions]
  );

  const subscriptions = React.useMemo(
    () => transactions.filter(t => t.category === 'Subscriptions'),
    [transactions]
  );

  const bills = React.useMemo(
    () => transactions.filter(t =>
      t.category === 'Utilities' || t.category === 'Housing'
    ),
    [transactions]
  );

  // Grouped structures for Bills and Subscriptions pages
  const billGroups = React.useMemo(
    () => Categorizer.getBills(transactions),
    [transactions]
  );

  const subscriptionGroups = React.useMemo(
    () => Categorizer.getSubscriptions(subscriptions),
    [subscriptions]
  );

  /** Re-fetch the CSV — call this after the Claude Code skill imports new data. */
  const reload = React.useCallback(() => setVersion(v => v + 1), []);

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
  };
};
