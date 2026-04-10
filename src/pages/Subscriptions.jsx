/**
 * Subscriptions — grouped by merchant with subcategory filter tabs.
 *
 * Layout:
 *   PageHeader with monthly total
 *   Tabs: All | Streaming | Software | Memberships
 *   Grid of SubscriptionCards
 */

const SUBCATEGORY_TABS = ['All', 'Streaming', 'Software', 'Memberships'];

function Subscriptions() {
  const { subscriptionGroups, loading, error } = useTransactions();

  const [tab, setTab] = React.useState('All');

  const monthlyTotal = subscriptionGroups.reduce(
    (sum, s) => sum + Math.abs(s.monthlyAmount), 0
  );

  const visible = tab === 'All'
    ? subscriptionGroups
    : subscriptionGroups.filter(s => s.subcategory === tab);

  if (loading) return <Center className="h-full"><Spinner /></Center>;
  if (error)   return <Center className="h-full"><Alert variant="error" title="Failed to load transactions" /></Center>;

  return (
    <Box className="p-6">
      <VStack gap="gap-6">

        <HStack className="justify-between items-start">
          <PageHeader title="Subscriptions" subtitle={`${subscriptionGroups.length} active`} />
          <Stat label="Monthly Total" value={`${Formatters.currency(monthlyTotal)}/mo`} />
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
  );
}

window.Subscriptions = Subscriptions;
