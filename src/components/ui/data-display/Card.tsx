import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`bg-card border border-rim rounded-xl ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`px-5 pt-5 pb-4 border-b border-rim ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`p-5 ${className}`} {...props}>{children}</div>
  )
}

export function CardFooter({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`px-5 pb-5 pt-4 border-t border-rim ${className}`} {...props}>
      {children}
    </div>
  )
}
