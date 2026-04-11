/**
 * RecentTransactions — list of the most recent N transactions.
 *
 * Shows merchant, date, account, category badge, and amount.
 * Amount is rose for expenses, emerald for income, always font-mono.
 * Category colors sourced from settings.json.
 *
 * Globals: RecentTransactions
 *
 * Props:
 *   transactions {Array}    full transaction list from useTransactions (date-desc sorted)
 *   count        {number}   rows to show — defaults to settings.dashboard.recentTransactionsCount
 *   onNavigate   {Function} optional — renders "View all →" link to Transactions page
 *
 * Load order: must come after Card family (data-display), Badge (data-display),
 *             Text/Heading/Caption (typography), EmptyState (other),
 *             Formatters (formatters.js), SettingsContext.
 */

window.RecentTransactions = ({ transactions = [], count, onNavigate }) => {
  const { settings } = useSettings();
  const limit = count || settings.dashboard.recentTransactionsCount || 10;
  const colorMap = useCategoryColorMap();

  const recent = transactions.slice(0, limit);

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

      {/* Zero-padding on CardBody so rows touch the card edges */}
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
              const isExpense = t.amount < 0;
              const amountDisplay = isExpense
                ? `-${Formatters.currency(Math.abs(t.amount))}`
                : `+${Formatters.currency(t.amount)}`;
              const amountClass = isExpense ? 'text-rose-400' : 'text-emerald-400';
              const catColor = colorMap[t.category] || '#6b7280';
              const merchant = t.merchant || t.normalized_description || 'Unknown';

              return (
                <HStack key={t.id} className="px-5 py-3 justify-between items-center">
                  {/* Left: merchant + date/account */}
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

                  {/* Right: amount + category badge */}
                  <VStack gap="gap-1" className="items-end shrink-0 ml-4">
                    <Text className={`text-sm font-mono font-medium ${amountClass}`}>
                      {amountDisplay}
                    </Text>
                    {t.category && (
                      <Badge color={catColor} size="sm">{t.category}</Badge>
                    )}
                  </VStack>
                </HStack>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
