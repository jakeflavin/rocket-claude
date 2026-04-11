import type { HTMLAttributes, ReactNode } from 'react'

const BADGE_SIZES: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?:    string
  size?:     'sm' | 'md' | 'lg'
  children?: ReactNode
}

export function Badge({ color = '#9090b0', size = 'md', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full
        ${BADGE_SIZES[size] ?? BADGE_SIZES.md} ${className}`}
      style={{ backgroundColor: `${color}26`, color }}
      {...props}
    >
      {children}
    </span>
  )
}
