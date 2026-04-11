import type { HTMLAttributes, ReactNode } from 'react'

interface CaptionProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode
}

export function Caption({ className = '', children, ...props }: CaptionProps) {
  return (
    <span className={`text-xs text-faint ${className}`} {...props}>{children}</span>
  )
}
