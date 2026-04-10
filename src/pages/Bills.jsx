function BillsSkeleton() {
  return (
    <Box className="p-6">
      <VStack gap="gap-6">
        <HStack className="justify-between items-start">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </HStack>
        <Grid cols={2} gap="gap-4">
          {[0,1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </Grid>
      </VStack>
    </Box>
  );
}

/**
 * Bills — recurring Utilities + Housing transactions grouped by merchant,
 * sorted by estimated next due date ascending (most urgent first).
 */

function Bills() {
  const { billGroups, loading, error, reload } = useTransactions();

  const monthlyEstimate = billGroups.reduce(
    (sum, b) => sum + Math.abs(b.averageAmount), 0
  );

  if (loading) return <BillsSkeleton />;
  if (error)   return <DataErrorState error={error} onRetry={reload} />;

  return (
    <Box className="p-6">
      <VStack gap="gap-6">

        <HStack className="justify-between items-start">
          <PageHeader title="Bills" subtitle={`${billGroups.length} recurring`} />
          <Stat label="Est. Monthly Total" value={Formatters.currency(monthlyEstimate)} />
        </HStack>

        {billGroups.length === 0 ? (
          <EmptyState
            icon="FileText"
            title="No recurring bills found"
            description="Bills appear when a merchant in Housing or Utilities charges you in 2+ months."
          />
        ) : (
          <Grid cols={2} gap="gap-4">
            {billGroups.map(bill => (
              <BillItem key={bill.merchant} bill={bill} />
            ))}
          </Grid>
        )}

      </VStack>
    </Box>
  );
}

window.Bills = Bills;
