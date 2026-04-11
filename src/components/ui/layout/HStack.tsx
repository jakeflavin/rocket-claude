import type { HTMLAttributes, ReactNode } from 'react'

interface HStackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: string
  children?: ReactNode
}

export function HStack({ className = '', gap = 'gap-4', children, ...props }: HStackProps) {
  return (
    <div className={`flex flex-row items-center ${gap} ${className}`} {...props}>{children}</div>
  )
}
