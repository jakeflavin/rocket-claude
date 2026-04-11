import { Card, HStack, Stat, Icon } from './ui'

interface StatCardProps {
  label:         string
  value:         string
  delta?:        string
  deltaPositive?: boolean
  icon?:         string
  className?:    string
}

export function StatCard({ label, value, delta, deltaPositive, icon, className = '' }: StatCardProps) {
  return (
    <Card className={`p-5 ${className}`}>
      <HStack className="items-start justify-between gap-4">
        <Stat
          label={label}
          value={value}
          delta={delta}
          deltaPositive={deltaPositive}
        />
        {icon && (
          <div className="shrink-0 w-9 h-9 rounded-lg bg-raised border border-rim flex items-center justify-center">
            <Icon name={icon} size={16} className="text-faint" />
          </div>
        )}
      </HStack>
    </Card>
  )
}
