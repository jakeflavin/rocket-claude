import type { LabelHTMLAttributes, ReactNode } from 'react'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode
}

export function Label({ className = '', children, ...props }: LabelProps) {
  return (
    <label
      className={`text-xs font-medium text-muted uppercase tracking-wide ${className}`}
      {...props}
    >
      {children}
    </label>
  )
}
