import { VStack } from '../layout/VStack'
import { HStack } from '../layout/HStack'
import { Label } from '../typography/Label'
import { Text } from '../typography/Text'
import { Caption } from '../typography/Caption'
import { Icon } from '../media/Icon'

interface StatProps {
  label?:         string
  value?:         string
  delta?:         string | null
  deltaPositive?: boolean
  className?:     string
}

export function Stat({ label, value, delta, deltaPositive, className = '' }: StatProps) {
  return (
    <VStack gap="gap-1" className={className}>
      <Label>{label}</Label>
      <Text className="text-2xl font-bold font-mono text-fg">{value}</Text>
      {delta !== undefined && delta !== null && (
        <HStack gap="gap-1">
          <Icon
            name={deltaPositive ? 'TrendingUp' : 'TrendingDown'}
            size={12}
            className={deltaPositive ? 'text-emerald-400' : 'text-rose-400'}
          />
          <Caption className={deltaPositive ? 'text-emerald-400' : 'text-rose-400'}>
            {delta}
          </Caption>
        </HStack>
      )}
    </VStack>
  )
}
