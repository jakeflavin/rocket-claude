import { HStack } from '../layout/HStack'
import { Text } from '../typography/Text'
import { Icon } from '../media/Icon'

interface CheckboxProps {
  checked?:   boolean
  onChange?:  (value: boolean) => void
  label?:     string
  className?: string
  disabled?:  boolean
}

export function Checkbox({ checked = false, onChange, label, className = '', disabled = false }: CheckboxProps) {
  return (
    <HStack
      gap="gap-2"
      className={`${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      onClick={() => !disabled && onChange && onChange(!checked)}
    >
      <div
        className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors
          ${checked ? 'bg-[#10b981] border-[#10b981]' : 'border-rim bg-raised'}`}
      >
        {checked && <Icon name="Check" size={10} color="white" strokeWidth={3} />}
      </div>
      {label && <Text className="text-sm text-muted select-none">{label}</Text>}
    </HStack>
  )
}
