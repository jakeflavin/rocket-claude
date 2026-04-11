import type { ReactNode } from 'react'

interface GridProps {
  className?:  string
  cols?:       1 | 2 | 3 | 4
  gap?:        string
  responsive?: boolean
  children?:   ReactNode
}

export function Grid({ className = '', cols = 2, gap = 'gap-4', responsive = false, children }: GridProps) {
  let colsClass: string
  if (responsive) {
    const responsiveMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      4: 'grid-cols-2 lg:grid-cols-4',
    }
    colsClass = responsiveMap[cols] ?? 'grid-cols-1 md:grid-cols-2'
  } else {
    const colsMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    }
    colsClass = colsMap[cols] ?? 'grid-cols-2'
  }
  return (
    <div className={`grid ${colsClass} ${gap} ${className}`}>
      {children}
    </div>
  )
}
