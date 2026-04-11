import { Card, CardHeader, CardBody, HStack, VStack, Heading, Caption, Text, Badge, EmptyState, Box } from './ui'
import { useSettings, useCategoryColorMap } from '../context/SettingsContext'
import { Formatters } from '../utils/formatters'
import type { Transaction } from '../types'

interface RecentTransactionsProps {
  transactions?: Transaction[]
  count?:        number
  onNavigate?:   (page: string) => void
}

export function RecentTransactions({ transactions = [], count, onNavigate }: RecentTransactionsProps) {
  const { settings } = useSettings()
  const limit    = count || settings.dashboard.recentTransactionsCount || 10
  const colorMap = useCategoryColorMap()

  const recent = transactions.slice(0, limit)

  return (
    <Card>
      <CardHeader>
        <HStack className="justify-between">
          <Heading level={3} className="text-sm font-semibold">
            Recent Transactions
          </Heading>
          {onNavigate && (
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-faint hover:text-fg transition-colors cursor-pointer"
            >
              View all →
            </button>
          )}
        </HStack>
      </CardHeader>

      <CardBody className="p-0">
        {recent.length === 0 ? (
          <Box className="p-5">
            <EmptyState
              icon="Receipt"
              title="No transactions"
              description="Import a CSV to get started."
            />
          </Box>
        ) : (
          <div className="divide-y divide-rim">
            {recent.map(t => {
              const isExpense    = t.amount < 0
              const amountDisplay = isExpense
                ? `-${Formatters.currency(Math.abs(t.amount))}`
                : `+${Formatters.currency(t.amount)}`
              const amountClass = isExpense ? 'text-rose-400' : 'text-emerald-400'
              const catColor    = colorMap[t.category] || '#6b7280'
              const merchant    = t.merchant || t.normalized_description || 'Unknown'

              return (
                <HStack key={t.id} className="px-5 py-3 justify-between items-center">
                  <VStack gap="gap-0.5" className="min-w-0 flex-1">
                    <Text className="text-sm font-medium text-fg truncate">
                      {merchant}
                    </Text>
                    <HStack gap="gap-1" className="items-center">
                      <Caption>{Formatters.shortDate(t.date)}</Caption>
                      {t.account && (
                        <>
                          <Caption>·</Caption>
                          <Caption className="truncate">{t.account}</Caption>
                        </>
                      )}
                    </HStack>
                  </VStack>

                  <VStack gap="gap-1" className="items-end shrink-0 ml-4">
                    <Text className={`text-sm font-mono font-medium ${amountClass}`}>
                      {amountDisplay}
                    </Text>
                    {t.category && (
                      <Badge color={catColor} size="sm">{t.category}</Badge>
                    )}
                  </VStack>
                </HStack>
              )
            })}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
