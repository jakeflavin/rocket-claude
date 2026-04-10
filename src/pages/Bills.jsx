/**
 * Bills — recurring Utilities + Housing transactions grouped by merchant,
 * sorted by estimated next due date ascending (most urgent first).
 */

function Bills() {
  const { billGroups, loading, error } = useTransactions();

  const monthlyEstimate = billGroups.reduce(
    (sum, b) => sum + Math.abs(b.averageAmount), 0
  );

  if (loading) return <Center className="h-full"><Spinner /></Center>;
  if (error)   return <Center className="h-full"><Alert variant="error" title="Failed to load transactions" /></Center>;

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
