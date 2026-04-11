import type { ElementType, ReactNode } from 'react'

interface TextProps {
  className?: string
  as?:        ElementType
  children?:  ReactNode
  [key: string]: unknown
}

export function Text({ className = '', as: Tag = 'span', children, ...props }: TextProps) {
  return <Tag className={className} {...props}>{children}</Tag>
}
