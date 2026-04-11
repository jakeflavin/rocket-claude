import type { SelectHTMLAttributes, ReactNode } from 'react'
import { VStack } from '../layout/VStack'
import { Label } from '../typography/Label'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:    string
  children?: ReactNode
}

export function Select({ className = '', label, id, children, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <VStack gap="gap-1.5">
      {label && <Label htmlFor={selectId}>{label}</Label>}
      <select
        id={selectId}
        className={`bg-raised border border-rim rounded-lg px-3 py-2 text-sm
          text-fg focus:outline-none focus:border-[#10b981] transition-colors cursor-pointer
          ${className}`}
        {...props}
      >
        {children}
      </select>
    </VStack>
  )
}
