import type { HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return <div className={`bg-raised rounded animate-pulse ${className}`} {...props} />
}
