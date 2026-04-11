import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ReactNode } from 'react'

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  className?: string
  children?:  ReactNode
}

export function Table({ className = '', children, ...props }: TableProps) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-sm" {...props}>{children}</table>
    </div>
  )
}

interface THeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  children?: ReactNode
}

export function Thead({ className = '', children, ...props }: THeadProps) {
  return (
    <thead className={`border-b border-rim ${className}`} {...props}>{children}</thead>
  )
}

export function Tbody({ className = '', children, ...props }: THeadProps) {
  return (
    <tbody className={`divide-y divide-rim ${className}`} {...props}>{children}</tbody>
  )
}

interface TrProps extends HTMLAttributes<HTMLTableRowElement> {
  children?: ReactNode
}

export function Tr({ className = '', children, ...props }: TrProps) {
  return (
    <tr className={`transition-colors hover:bg-raised ${className}`} {...props}>
      {children}
    </tr>
  )
}

interface ThProps extends HTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode
}

export function Th({ className = '', children, ...props }: ThProps) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide whitespace-nowrap ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

interface TdProps extends TdHTMLAttributes<HTMLTableDataCellElement> {
  children?: ReactNode
}

export function Td({ className = '', children, ...props }: TdProps) {
  return (
    <td className={`px-4 py-3 text-fg ${className}`} {...props}>{children}</td>
  )
}
