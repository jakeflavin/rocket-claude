/**
 * BudgetProgress — per-category budget progress bars for a date range.
 *
 * Budget limits and category metadata (color, icon) come exclusively
 * from settings.json. Progress bar color shifts at 75 % and 90 % via
 * the existing Progress primitive.
 *
 * Globals: BudgetProgress
 *
 * Props:
 *   transactions {Array}  full transaction list from useTransactions
 *   start        {string} YYYY-MM-DD range start
 *   end          {string} YYYY-MM-DD range end
 *   rangeLabel   {string} display label for the range (caption)
 *
 * Load order: must come after Card/CardHeader/CardBody (data-display),
 *             Progress (feedback), Icon (media), Heading, Caption, Label
 *             (typography), EmptyState (other), Formatters, SettingsContext.
 */

window.BudgetProgress = ({ transactions = [], start, end, rangeLabel }) => {
  const today = new Date().toISOString().slice(0, 10);
  const activeStart = start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const activeEnd   = end || today;
  const { settings } = useSettings();

  // ─── Build per-category spend totals for the range ──────────────────────────
  const rows = React.useMemo(() => {
    const { budgets, categories } = settings;

    // Sum expenses per category for this range
    const spent = {};
    transactions
      .filter(t => t.amount < 0 && t.date && t.date >= activeStart && t.date <= activeEnd)
      .forEach(t => {
        const cat = t.category || 'Misc';
        spent[cat] = (spent[cat] || 0) + Math.abs(t.amount);
      });

    // Build a metadata lookup
    const meta = {};
    categories.forEach(c => { meta[c.name] = { color: c.color, icon: c.icon }; });

    // One row per budgeted category
    return Object.entries(budgets)
      .map(([name, limit]) => ({
        name,
        limit,
        spent:  parseFloat((spent[name] || 0).toFixed(2)),
        color:  meta[name]?.color || '#6b7280',
        icon:   meta[name]?.icon  || 'MoreHorizontal',
      }))
      .sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit));
  }, [transactions, activeStart, activeEnd, settings]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader>
        <HStack className="items-center justify-between">
          <Heading level={3} className="text-sm font-semibold text-[#f0f0fa]">
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
              const pct     = row.limit > 0 ? (row.spent / row.limit) * 100 : 0;
              const over    = row.spent > row.limit;
              const remaining = row.limit - row.spent;

              return (
                <VStack key={row.name} gap="gap-1.5">
                  {/* Category label row */}
                  <HStack className="items-center justify-between">
                    <HStack gap="gap-2" className="items-center min-w-0">
                      <Icon
                        name={row.icon}
                        size={13}
                        style={{ color: row.color }}
                      />
                      <Text className="text-sm font-medium text-[#f0f0fa] truncate">
                        {row.name}
                      </Text>
                    </HStack>
                    <HStack gap="gap-1.5" className="items-baseline shrink-0">
                      <Text className="text-xs font-mono text-[#f0f0fa]">
                        {Formatters.currency(row.spent)}
                      </Text>
                      <Caption>/</Caption>
                      <Caption className="font-mono">{Formatters.currency(row.limit)}</Caption>
                    </HStack>
                  </HStack>

                  {/* Progress bar */}
                  <Progress value={row.spent} max={row.limit} />

                  {/* Over-budget warning */}
                  {over && (
                    <Text className="text-xs font-mono text-rose-400">
                      {Formatters.currency(Math.abs(remaining))} over budget
                    </Text>
                  )}
                </VStack>
              );
            })}
          </VStack>
        )}
      </CardBody>
    </Card>
  );
};
