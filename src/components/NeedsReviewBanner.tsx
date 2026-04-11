import { useState } from 'react'
import { Alert } from './ui'

interface NeedsReviewBannerProps {
  count:      number
  onNavigate: (page: string) => void
}

export function NeedsReviewBanner({ count, onNavigate }: NeedsReviewBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (!count || count < 1 || dismissed) return null

  const label = count === 1
    ? '1 transaction needs your review.'
    : `${count} transactions need your review.`

  return (
    <Alert
      variant="warning"
      title={label}
      onClose={() => setDismissed(true)}
    >
      <button
        onClick={() => onNavigate('transactions')}
        className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors text-xs font-medium"
      >
        Review now →
      </button>
    </Alert>
  )
}
