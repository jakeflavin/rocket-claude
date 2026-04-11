import type { ReactNode } from 'react'
import { HStack } from '../layout/HStack'
import { VStack } from '../layout/VStack'
import { Heading } from '../typography/Heading'
import { Text } from '../typography/Text'

interface PageHeaderProps {
  title?:     string
  subtitle?:  string
  children?:  ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, children, className = '' }: PageHeaderProps) {
  return (
    <HStack className={`mb-6 items-start ${className}`}>
      <VStack gap="gap-0.5" className="flex-1">
        <Heading level={2} className="text-xl">{title}</Heading>
        {subtitle && <Text className="text-sm text-muted">{subtitle}</Text>}
      </VStack>
      {children && <div className="shrink-0">{children}</div>}
    </HStack>
  )
}
