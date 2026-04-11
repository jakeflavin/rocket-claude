import type { HTMLAttributes, ReactNode } from 'react'

interface CenterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export function Center({ className = '', children, ...props }: CenterProps) {
  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>{children}</div>
  )
}
