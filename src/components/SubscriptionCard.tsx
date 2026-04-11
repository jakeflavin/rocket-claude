import { Card, CardBody, HStack, VStack, Heading, Caption, Badge, Text } from './ui'
import { useSettings } from '../context/SettingsContext'
import { Formatters } from '../utils/formatters'
import type { SubscriptionGroup } from '../types'

interface SubscriptionCardProps {
  subscription: SubscriptionGroup
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const { settings } = useSettings()

  const subCat      = settings.categories.find(c => c.name === 'Subscriptions')
  const accentColor = subCat?.color ?? '#a78bfa'

  const { merchant, subcategory, lastChargedDate, monthlyAmount } = subscription
  const monthlyCost = Math.abs(monthlyAmount)

  return (
    <Card>
      <CardBody>
        <HStack className="justify-between items-start">
          <VStack gap="gap-1">
            <Heading level={4} className="text-sm font-medium">{merchant}</Heading>
            <Badge color={accentColor}>{subcategory}</Badge>
          </VStack>
          <VStack gap="gap-1" className="items-end">
            <Text className="font-mono text-sm font-semibold text-white">
              {Formatters.currency(monthlyCost)}/mo
            </Text>
            <Caption>Last: {Formatters.date(lastChargedDate)}</Caption>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  )
}
