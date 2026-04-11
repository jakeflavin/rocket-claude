import type { ReactNode } from 'react'

interface HeadingProps {
  className?: string
  level?:     1 | 2 | 3 | 4
  children?:  ReactNode
  [key: string]: unknown
}

export function Heading({ className = '', level = 2, children, ...props }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'
  const sizes: Record<number, string> = { 1: 'text-3xl', 2: 'text-2xl', 3: 'text-xl', 4: 'text-lg' }
  return (
    <Tag
      className={`font-semibold text-fg ${sizes[level] ?? 'text-xl'} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
