import type { ReactNode } from 'react'
import { Center } from '../layout/Center'
import { VStack } from '../layout/VStack'
import { Text } from '../typography/Text'
import { Caption } from '../typography/Caption'
import { Icon } from '../media/Icon'

interface EmptyStateProps {
  icon?:        string
  title?:       string
  description?: string
  action?:      ReactNode
  className?:   string
}

export function EmptyState({
  icon = 'Inbox',
  title = 'Nothing here',
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <Center className={`py-16 ${className}`}>
      <VStack gap="gap-4" className="items-center text-center">
        <div className="w-12 h-12 rounded-xl bg-raised border border-rim flex items-center justify-center">
          <Icon name={icon} size={20} className="text-faint" />
        </div>
        <VStack gap="gap-1.5" className="items-center">
          <Text className="text-sm font-medium text-muted">{title}</Text>
          {description && (
            <Caption className="max-w-xs leading-relaxed">{description}</Caption>
          )}
        </VStack>
        {action && <div>{action}</div>}
      </VStack>
    </Center>
  )
}
