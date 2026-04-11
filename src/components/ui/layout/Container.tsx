import type { HTMLAttributes, ReactNode } from 'react'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export function Container({ className = '', children, ...props }: ContainerProps) {
  return (
    <div className={`max-w-7xl mx-auto w-full ${className}`} {...props}>{children}</div>
  )
}
