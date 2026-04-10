/**
 * DataErrorState — full-page error UI for CSV load/parse failures.
 *
 * @prop error    {string}   Error message from useTransactions
 * @prop onRetry  {Function} Calls reload() to re-fetch the CSV
 */
function DataErrorState({ error, onRetry }) {
  return (
    <Center className="h-full">
      <VStack gap="gap-6" className="items-center text-center px-6 max-w-md">
        <div className="w-14 h-14 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <Icon name="FileX" size={24} className="text-rose-400" />
        </div>
        <VStack gap="gap-2" className="items-center">
          <Heading level={3} className="text-base font-semibold text-[#f0f0fa]">
            Could not load transactions
          </Heading>
          <Caption className="leading-relaxed">
            {error || 'An unknown error occurred while reading transactions.csv.'}
          </Caption>
          <Caption className="leading-relaxed text-[#555575]">
            Make sure the app is served via HTTP (<span className="font-mono text-[#9090b0]">npx serve .</span>) and that <span className="font-mono text-[#9090b0]">data/transactions.csv</span> exists.
          </Caption>
        </VStack>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <Icon name="RefreshCw" size={14} className="mr-1.5" />
            Retry
          </Button>
        )}
      </VStack>
    </Center>
  );
}

window.DataErrorState = DataErrorState;
