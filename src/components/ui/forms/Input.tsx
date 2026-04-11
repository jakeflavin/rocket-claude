import type { InputHTMLAttributes } from 'react'
import { VStack } from '../layout/VStack'
import { Label } from '../typography/Label'
import { Caption } from '../typography/Caption'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ className = '', label, error, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <VStack gap="gap-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <input
        id={inputId}
        className={`bg-raised border rounded-lg px-3 py-2 text-sm text-fg
          placeholder-faint focus:outline-none transition-colors
          ${error ? 'border-rose-500 focus:border-rose-400' : 'border-rim focus:border-[#10b981]'}
          ${className}`}
        {...props}
      />
      {error && <Caption className="text-rose-400">{error}</Caption>}
    </VStack>
  )
}
