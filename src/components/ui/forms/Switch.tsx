import { HStack } from '../layout/HStack'
import { Text } from '../typography/Text'

interface SwitchProps {
  checked?:   boolean
  onChange?:  (value: boolean) => void
  label?:     string
  className?: string
  disabled?:  boolean
}

export function Switch({ checked = false, onChange, label, className = '', disabled = false }: SwitchProps) {
  return (
    <HStack gap="gap-3" className={className}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange && onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full
          transition-colors focus:outline-none
          ${checked ? 'bg-[#10b981]' : 'bg-rim'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform
            ${checked ? 'translate-x-4' : 'translate-x-1'}`}
        />
      </button>
      {label && (
        <Text className={`text-sm ${disabled ? 'text-faint' : 'text-fg'}`}>
          {label}
        </Text>
      )}
    </HStack>
  )
}
