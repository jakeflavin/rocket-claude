import { VStack } from '../layout/VStack'
import { Text } from '../typography/Text'

interface ProgressProps {
  value?:      number
  max?:        number
  className?:  string
  showLabel?:  boolean
}

export function Progress({ value = 0, max = 100, className = '', showLabel = false }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const barColor = pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <VStack gap="gap-1" className={className}>
      <div className="h-2 w-full bg-rim rounded-full overflow-hidden">
        {/* Inline style is unavoidable here — dynamic width cannot be a static Tailwind class */}
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <Text className="text-xs text-muted">{Math.round(pct)}%</Text>
      )}
    </VStack>
  )
}
