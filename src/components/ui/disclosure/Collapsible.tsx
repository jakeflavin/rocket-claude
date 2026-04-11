import type { ReactNode } from 'react'

interface CollapsibleProps {
  isOpen:    boolean
  children?: ReactNode
}

export function Collapsible({ isOpen, children }: CollapsibleProps) {
  if (!isOpen) return null
  return <div>{children}</div>
}
