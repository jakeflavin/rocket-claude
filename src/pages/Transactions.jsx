/**
 * Transactions — full transaction list with filters, sorting, pagination,
 * and inline notes editing.
 *
 * Filters: search, category, account, date range, needs_review toggle
 * Sort: date, merchant, category, account, amount (click column header)
 * Pagination: 50 rows/page
 * Notes: in-memory edits (no backend write)
 */

function TransactionsSkeleton() {
  return (
    <Box className="p-6">
      <VStack gap="gap-6">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-28 rounded-xl" />
        <VStack gap="gap-px">
          <Skeleton className="h-10 rounded-t-xl" />
          {[0,1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-14" />)}
        </VStack>
      </VStack>
    </Box>
  );
}

const PAGE_SIZE = 50;

const SORT_COLS = [
  { key: 'date',     label: 'Date'     },
  { key: 'merchant', label: 'Merchant' },
  { key: 'category', label: 'Category' },
  { key: 'account',  label: 'Account'  },
  { key: 'amount',   label: 'Amount'   },
];

function Transactions() {
  const { settings } = useSettings();
  const { transactions, loading, error, reload } = useTransactions();

  // ─── Account alias helper ──────────────────────────────────────────────────
  const displayAccount = React.useCallback(
    name => settings.accountAliases?.[name]?.displayName ?? name,
    [settings.accountAliases]
  );

  // ─── Filter state ──────────────────────────────────────────────────────────
  const [search,          setSearch]          = React.useState('');
  const [categoryFilter,  setCategoryFilter]  = React.useState('');
  const [accountFilter,   setAccountFilter]   = React.useState('');
  const [startDate,       setStartDate]       = React.useState('');
  const [endDate,         setEndDate]         = React.useState('');
  const [reviewOnly,      setReviewOnly]      = React.useState(false);

  // ─── Sort state ────────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = React.useState('date');
  const [sortDir, setSortDir] = React.useState('desc');

  // ─── Pagination ────────────────────────────────────────────────────────────
  const [page, setPage] = React.useState(1);

  // ─── Inline notes (in-memory) ──────────────────────────────────────────────
  const [notes,       setNotes]       = React.useState({});
  const [editingId,   setEditingId]   = React.useState(null);
  const [editingNote, setEditingNote] = React.useState('');

  // ─── Derived: unique accounts ──────────────────────────────────────────────
  const accounts = React.useMemo(
    () => [...new Set(transactions.map(t => t.account))].sort(),
    [transactions]
  );

  // ─── Category color lookup ─────────────────────────────────────────────────
  const catColor = React.useCallback((name) => {
    const cat = settings.categories.find(c => c.name === name);
    return cat?.color ?? '#6b7280';
  }, [settings.categories]);

  // ─── Filtered ─────────────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    return transactions.filter(t => {
      if (search) {
        const q = search.toLowerCase();
        const note = (notes[t.id] ?? t.notes ?? '').toLowerCase();
        if (
          !t.merchant.toLowerCase().includes(q) &&
          !t.description.toLowerCase().includes(q) &&
          !note.includes(q)
        ) return false;
      }
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (accountFilter  && t.account  !== accountFilter)  return false;
      if (startDate      && t.date < startDate)            return false;
      if (endDate        && t.date > endDate)              return false;
      if (reviewOnly     && t.needs_review !== true)       return false;
      return true;
    });
  }, [transactions, search, categoryFilter, accountFilter, startDate, endDate, reviewOnly, notes]);

  // ─── Sorted ───────────────────────────────────────────────────────────────
  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  // ─── Paginated ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 whenever filters change
  React.useEffect(() => { setPage(1); }, [search, categoryFilter, accountFilter, startDate, endDate, reviewOnly]);

  // ─── Sort handler ─────────────────────────────────────────────────────────
  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  // ─── Notes handlers ───────────────────────────────────────────────────────
  const startEdit = (t) => {
    setEditingId(t.id);
    setEditingNote(notes[t.id] ?? t.notes ?? '');
  };
  const saveEdit = (id) => {
    setNotes(prev => ({ ...prev, [id]: editingNote }));
    setEditingId(null);
  };
  const cancelEdit = () => setEditingId(null);

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) return <TransactionsSkeleton />;
  if (error)   return <DataErrorState error={error} onRetry={reload} />;

  return (
    <Box className="p-6">
      <VStack gap="gap-6">

        <PageHeader title="Transactions" subtitle={`${sorted.length} rows`} />

        {/* ── Filters ── */}
        <Card>
          <CardBody>
            <Grid cols={3} gap="gap-4">
              <Input
                label="Search"
                placeholder="Merchant, description, notes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Select label="Category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="">All categories</option>
                {settings.categories.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </Select>
              <Select label="Account" value={accountFilter} onChange={e => setAccountFilter(e.target.value)}>
                <option value="">All accounts</option>
                {accounts.map(a => <option key={a} value={a}>{displayAccount(a)}</option>)}
              </Select>
              <Input label="From" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              <Input label="To"   type="date" value={endDate}   onChange={e => setEndDate(e.target.value)}   />
              <HStack gap="gap-3" className="items-end pb-1">
                <Switch checked={reviewOnly} onChange={setReviewOnly} label="Needs review only" />
              </HStack>
            </Grid>
          </CardBody>
        </Card>

        {/* ── Table ── */}
        <Card>
          <CardBody className="p-0 overflow-x-auto">
            {paginated.length === 0 ? (
              <EmptyState
                icon="SearchX"
                title="No transactions match"
                description="Try adjusting your filters."
                className="py-12"
              />
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    {SORT_COLS.map(({ key, label }) => (
                      <Th
                        key={key}
                        className="cursor-pointer select-none whitespace-nowrap"
                        onClick={() => handleSort(key)}
                      >
                        <HStack gap="gap-1" className="inline-flex items-center">
                          {label}
                          {sortKey === key
                            ? <Icon name={sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={12} className="text-emerald-400" />
                            : <Icon name="ChevronsUpDown" size={12} className="text-[#6060a0]" />
                          }
                        </HStack>
                      </Th>
                    ))}
                    <Th>Notes</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginated.map(t => {
                    const isEditing  = editingId === t.id;
                    const noteVal    = notes[t.id] ?? t.notes ?? '';
                    const amtColor   = t.amount < 0 ? 'text-rose-400' : 'text-emerald-400';
                    const amtPrefix  = t.amount < 0 ? '-' : '+';

                    return (
                      <Tr key={t.id}>
                        <Td className="whitespace-nowrap text-sm">{Formatters.date(t.date)}</Td>

                        <Td className="text-sm">
                          <VStack gap="gap-0.5">
                            <Text className="text-sm max-w-[160px] truncate">{t.merchant}</Text>
                            {t.needs_review && (
                              <Caption className="text-amber-400">Needs review</Caption>
                            )}
                          </VStack>
                        </Td>

                        <Td>
                          <Badge color={catColor(t.category)}>{t.category}</Badge>
                        </Td>

                        <Td className="text-sm text-[#9090b0] whitespace-nowrap">{displayAccount(t.account)}</Td>

                        <Td className={`font-mono text-sm whitespace-nowrap ${amtColor}`}>
                          {amtPrefix}{Formatters.currency(Math.abs(t.amount))}
                        </Td>

                        <Td className="max-w-[200px]">
                          {isEditing ? (
                            <HStack gap="gap-1">
                              <Input
                                value={editingNote}
                                onChange={e => setEditingNote(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter')  saveEdit(t.id);
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                              />
                              <Button variant="ghost" size="sm" onClick={() => saveEdit(t.id)}>
                                <Icon name="Check" size={14} className="text-emerald-400" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                                <Icon name="X" size={14} className="text-rose-400" />
                              </Button>
                            </HStack>
                          ) : (
                            <Text
                              className="text-sm text-[#9090b0] cursor-pointer hover:text-[#f0f0fa] truncate max-w-[180px]"
                              onClick={() => startEdit(t)}
                            >
                              {noteVal || <span className="italic opacity-40">Add note…</span>}
                            </Text>
                          )}
                        </Td>

                        <Td>
                          {t.needs_review && (
                            <Tooltip label="Needs review">
                              <Icon name="AlertCircle" size={14} className="text-amber-400" />
                            </Tooltip>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            )}
          </CardBody>

          {totalPages > 1 && (
            <CardFooter>
              <HStack gap="gap-3" className="justify-between w-full">
                <Caption>
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
                </Caption>
                <HStack gap="gap-2">
                  <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <Icon name="ChevronLeft" size={16} />
                  </Button>
                  <Caption>Page {page} of {totalPages}</Caption>
                  <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    <Icon name="ChevronRight" size={16} />
                  </Button>
                </HStack>
              </HStack>
            </CardFooter>
          )}
        </Card>

      </VStack>
    </Box>
  );
}

window.Transactions = Transactions;
