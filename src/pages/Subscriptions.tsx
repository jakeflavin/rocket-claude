import { useState, useMemo } from 'react'
import {
  Box, VStack, HStack, Grid, Skeleton, EmptyState, PageHeader, Stat,
  Tabs, Tab, RecurringDonut, ChartHelpers,
} from '../components/ui'
import { useSettings } from '../context/SettingsContext'
import { useTransactions } from '../hooks/useTransactions'
import { Formatters } from '../utils/formatters'
import { Categorizer } from '../utils/categorizer'
import { DataErrorState } from '../components/DataErrorState'
import { ViewToggle } from '../components/ViewToggle'
import { SubscriptionCard } from '../components/SubscriptionCard'
import { RecurringCalendar } from '../components/RecurringCalendar'

function SubscriptionsSkeleton() {
  return (
    <Box className="p-6">
      <VStack gap="gap-6">
        <HStack className="justify-between items-start">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </HStack>
        <Skeleton className="h-10 rounded" />
        <Grid cols={3} gap="gap-4">
          {[0,1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </Grid>
      </VStack>
    </Box>
  )
}

const SUBCATEGORY_TABS = ['All', 'Streaming', 'Software', 'Memberships']

type View = 'list' | 'chart' | 'calendar'

export function Subscriptions() {
  const { subscriptionGroups, loading, error, reload } = useTransactions()
  const { settings } = useSettings()

  const [tab,  setTab]  = useState('All')
  const [view, setView] = useState<View>('list')

  const monthlyTotal = subscriptionGroups.reduce(
    (sum, s) => sum + Math.abs(s.monthlyAmount), 0
  )

  const visible = tab === 'All'
    ? subscriptionGroups
    : subscriptionGroups.filter(s => s.subcategory === tab)

  const baseColor = useMemo(
    () => settings.categories.find(c => c.name === 'Subscriptions')?.color || '#6366f1',
    [settings.categories]
  )

  const subSlices = useMemo(
    () => ChartHelpers.hueRotatedSlices(visible, baseColor),
    [visible, baseColor]
  )

  const subCalItems = useMemo(() =>
    visible.flatMap(s => {
      if (!s.lastChargedDate) return []
      const due = Categorizer.nextDueDate(s.lastChargedDate)
      if (!due) return []
      return [{
        merchant:     s.merchant,
        dueDate:      due,
        color:        baseColor,
        tooltipLabel: `${s.merchant} — ${Formatters.currency(Math.abs(s.monthlyAmount))}/mo`,
      }]
    }),
    [visible, baseColor]
  )

  if (loading) return <SubscriptionsSkeleton />
  if (error)   return <DataErrorState error={error} onRetry={reload} />

  return (
    <Box className="p-6">
      <VStack gap="gap-6">

        <HStack className="justify-between items-start flex-wrap gap-3">
          <PageHeader title="Subscriptions" subtitle={`${subscriptionGroups.length} active`} />
          <HStack gap="gap-3">
            <ViewToggle view={view} onChange={setView} />
            <Stat label="Monthly Total" value={`${Formatters.currency(monthlyTotal)}/mo`} />
          </HStack>
        </HStack>

        <Box>
          <Tabs value={tab} onChange={setTab}>
            {SUBCATEGORY_TABS.map(t => <Tab key={t} value={t}>{t}</Tab>)}
          </Tabs>

          <Box className="pt-6">
            {visible.length === 0 ? (
              <EmptyState
                icon="CreditCard"
                title="No subscriptions"
                description={tab === 'All' ? 'No subscription transactions found.' : `No ${tab} subscriptions found.`}
              />
            ) : view === 'chart' ? (
              <RecurringDonut slices={subSlices} centerLabel="Monthly" tooltipSuffix="/mo" />
            ) : view === 'calendar' ? (
              <RecurringCalendar items={subCalItems} />
            ) : (
              <Grid cols={3} gap="gap-4">
                {visible.map(s => (
                  <SubscriptionCard key={s.merchant} subscription={s} />
                ))}
              </Grid>
            )}
          </Box>
        </Box>

      </VStack>
    </Box>
  )
}
