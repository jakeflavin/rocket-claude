/**
 * NeedsReviewBanner — amber warning banner for flagged transactions.
 *
 * Renders nothing when there are zero needs_review transactions.
 * Shown at the top of the Dashboard.
 *
 * Globals: NeedsReviewBanner
 *
 * Props:
 *   count      {number}   number of needs_review transactions
 *   onNavigate {Function} app-level navigation callback (from App)
 *
 * Load order: must come after Alert (feedback.jsx).
 */

window.NeedsReviewBanner = ({ count, onNavigate }) => {
  if (!count || count < 1) return null;

  const label = count === 1
    ? '1 transaction needs your review.'
    : `${count} transactions need your review.`;

  return (
    <Alert
      variant="warning"
      title={label}
    >
      <button
        onClick={() => onNavigate && onNavigate('transactions')}
        className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors text-xs font-medium"
      >
        Review now →
      </button>
    </Alert>
  );
};
