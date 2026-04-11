import type { TextareaHTMLAttributes } from 'react'
import { VStack } from '../layout/VStack'
import { Label } from '../typography/Label'
import { Caption } from '../typography/Caption'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  rows?:  number
}

export function Textarea({ className = '', label, error, id, rows = 3, ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <VStack gap="gap-1.5">
      {label && <Label htmlFor={textareaId}>{label}</Label>}
      <textarea
        id={textareaId}
        rows={rows}
        className={`bg-raised border rounded-lg px-3 py-2 text-sm text-fg
          placeholder-faint focus:outline-none transition-colors resize-none
          ${error ? 'border-rose-500 focus:border-rose-400' : 'border-rim focus:border-[#10b981]'}
          ${className}`}
        {...props}
      />
      {error && <Caption className="text-rose-400">{error}</Caption>}
    </VStack>
  )
}
