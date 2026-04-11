import type { HTMLAttributes, ReactNode } from 'react'

interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export function Box({ className = '', children, ...props }: BoxProps) {
  return <div className={className} {...props}>{children}</div>
}
