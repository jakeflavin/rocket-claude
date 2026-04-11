import { useMemo } from 'react'
import {
  Card, CardHeader, CardBody,
  HStack, VStack,
  Heading, Caption, Text,
  Icon, Progress, EmptyState,
} from './ui'
import { useSettings } from '../context/SettingsContext'
import { Formatters } from '../utils/formatters'
import type { Transaction } from '../types'

interface BudgetProgressProps {
  transactions?: Transaction[]
  start?:        string
  end?:          string
  rangeLabel?:   string
}

export function BudgetProgress({ transactions = [], start, end, rangeLabel }: BudgetProgressProps) {
  const today       = new Date().toISOString().slice(0, 10)
  const activeStart = start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const activeEnd   = end || today
  const { settings } = useSettings()

  const rows = useMemo(() => {
    const { budgets, categories } = settings

    const spent: Record<string, number> = {}
    transactions
      .filter(t => t.amount < 0 && t.date && t.date >= activeStart && t.date <= activeEnd)
      .forEach(t => {
        const cat = t.category || 'Misc'
        spent[cat] = (spent[cat] || 0) + Math.abs(t.amount)
      })

    const meta: Record<string, { color: string; icon: string }> = {}
    categories.forEach(c => { meta[c.name] = { color: c.color, icon: c.icon } })

    return Object.entries(budgets)
      .map(([name, limit]) => ({
        name,
        limit,
        spent:  parseFloat((spent[name] || 0).toFixed(2)),
        color:  meta[name]?.color ?? '#6b7280',
        icon:   meta[name]?.icon  ?? 'MoreHorizontal',
      }))
      .sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit))
  }, [transactions, activeStart, activeEnd, settings])

  return (
    <Card>
      <CardHeader>
        <HStack className="items-center justify-between">
          <Heading level={3} className="text-sm font-semibold">
            Budget Progress
          </Heading>
          <Caption>{rangeLabel || 'This Month'}</Caption>
        </HStack>
      </CardHeader>
      <CardBody>
        {rows.length === 0 ? (
          <EmptyState
            icon="BarChart2"
            title="No budgets configured"
            description="Add budget limits in Settings to track spending."
          />
        ) : (
          <VStack gap="gap-4">
            {rows.map(row => {
              const over      = row.spent > row.limit
              const remaining = row.limit - row.spent

              return (
                <VStack key={row.name} gap="gap-1.5">
                  <HStack className="items-center justify-between">
                    <HStack gap="gap-2" className="items-center min-w-0">
                      <Icon name={row.icon} size={13} style={{ color: row.color }} />
                      <Text className="text-sm font-medium text-fg truncate">{row.name}</Text>
                    </HStack>
                    <HStack gap="gap-1.5" className="items-baseline shrink-0">
                      <Text className="text-xs font-mono text-fg">
                        {Formatters.currency(row.spent)}
                      </Text>
                      <Caption>/</Caption>
                      <Caption className="font-mono">{Formatters.currency(row.limit)}</Caption>
                    </HStack>
                  </HStack>

                  <Progress value={row.spent} max={row.limit} />

                  {over && (
                    <Text className="text-xs font-mono text-rose-400">
                      {Formatters.currency(Math.abs(remaining))} over budget
                    </Text>
                  )}
                </VStack>
              )
            })}
          </VStack>
        )}
      </CardBody>
    </Card>
  )
}
