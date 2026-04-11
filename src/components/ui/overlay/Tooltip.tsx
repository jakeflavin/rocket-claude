import { useState, type ReactNode } from 'react'

const PLACEMENTS: Record<string, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full  left-1/2 -translate-x-1/2 mt-1.5',
  left:   'right-full top-1/2 -translate-y-1/2  mr-1.5',
  right:  'left-full  top-1/2 -translate-y-1/2  ml-1.5',
}

interface TooltipProps {
  label?:     string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  children?:  ReactNode
}

export function Tooltip({ label, placement = 'top', children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && label && (
        <div
          className={`absolute z-50 px-2 py-1 bg-raised border border-rim rounded
            text-xs text-fg whitespace-nowrap pointer-events-none shadow-lg
            ${PLACEMENTS[placement] ?? PLACEMENTS.top}`}
        >
          {label}
        </div>
      )}
    </div>
  )
}
