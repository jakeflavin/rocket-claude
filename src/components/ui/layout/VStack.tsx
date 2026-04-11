import type { HTMLAttributes, ReactNode } from 'react'

interface VStackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: string
  children?: ReactNode
}

export function VStack({ className = '', gap = 'gap-4', children, ...props }: VStackProps) {
  return (
    <div className={`flex flex-col ${gap} ${className}`} {...props}>{children}</div>
  )
}
