import { useState, useCallback, useEffect, useMemo, Fragment } from 'react'
import {
  Box, VStack, HStack, Grid, Skeleton, Caption, Text, Badge,
  Card, CardBody, CardFooter, EmptyState, Select, Input, Switch,
  Table, Thead, Tbody, Tr, Th, Td, Icon, Tooltip, Button, PageHeader,
} from '../components/ui'
import { useSettings, useCategoryColorMap } from '../context/SettingsContext'
import { useTransactions } from '../hooks/useTransactions'
import { Formatters } from '../utils/formatters'
import { DataErrorState } from '../components/DataErrorState'
import type { Transaction } from '../types'

const SUBCATEGORIES: Record<string, string[]> = {
  'Income':         ['Salary','Bonus','Interest','Dividends','Refund','Other Income'],
  'Housing':        ['Rent','Mortgage','Property Tax','HOA','Home Maintenance'],
  'Utilities':      ['Electricity','Water','Gas','Internet','Phone'],
  'Groceries':      ['Supermarket','Wholesale Club'],
  'Food & Drink':   ['Coffee','Dining Out','Fast Food','Bars'],
  'Transportation': ['Gas','Public Transit','Parking','Rideshare','Car Maintenance'],
  'Subscriptions':  ['Streaming','Software','Memberships'],
  'Shopping':       ['General Merchandise','Clothing','Electronics','Home Goods'],
  'Health':         ['Medical','Pharmacy','Fitness'],
  'Travel':         ['Flights','Hotels','Rental Car','Activities'],
  'Entertainment':  ['Movies','Games','Events'],
  'Misc':           ['Uncategorized'],
}

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
  )
}

const PAGE_SIZE = 50

type SortKey = 'date' | 'merchant' | 'category' | 'account' | 'amount'
type SortDir = 'asc' | 'desc'

const SORT_COLS: { key: SortKey; label: string }[] = [
  { key: 'date',     label: 'Date'     },
  { key: 'merchant', label: 'Merchant' },
  { key: 'category', label: 'Category' },
  { key: 'account',  label: 'Account'  },
  { key: 'amount',   label: 'Amount'   },
]

export function Transactions() {
  const { settings } = useSettings()
  const { transactions, loading, error, reload } = useTransactions()

  const displayAccount = useCallback(
    (name: string) => settings.accountAliases?.[name]?.displayName ?? name,
    [settings.accountAliases]
  )

  // ─── Filter state ─────────────────────────────────────────────────────────
  const [search,         setSearch]         = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [accountFilter,  setAccountFilter]  = useState('')
  const [startDate,      setStartDate]      = useState('')
  const [endDate,        setEndDate]        = useState('')
  const [reviewOnly,     setReviewOnly]     = useState(false)

  // ─── Sort state ───────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // ─── Pagination ───────────────────────────────────────────────────────────
  const [page, setPage] = useState(1)

  // ─── Inline notes (in-memory) ─────────────────────────────────────────────
  const [notes,       setNotes]       = useState<Record<string, string>>({})
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState('')

  // ─── Inline category edits (in-memory) ───────────────────────────────────
  const [categoryEdits, setCategoryEdits] = useState<Record<string, string>>({})
  const [editingCatId,  setEditingCatId]  = useState<string | null>(null)

  // ─── Expandable rows ──────────────────────────────────────────────────────
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const accounts = useMemo(
    () => [...new Set(transactions.map(t => t.account))].sort(),
    [transactions]
  )

  const colorMap = useCategoryColorMap()
  const catColor = (name: string) => colorMap[name] ?? '#6b7280'

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (search) {
        const q    = search.toLowerCase()
        const note = (notes[t.id] ?? t.notes ?? '').toLowerCase()
        if (
          !t.merchant.toLowerCase().includes(q) &&
          !t.description.toLowerCase().includes(q) &&
          !note.includes(q)
        ) return false
      }
      if (categoryFilter && t.category !== categoryFilter) return false
      if (accountFilter  && t.account  !== accountFilter)  return false
      if (startDate      && t.date < startDate)            return false
      if (endDate        && t.date > endDate)              return false
      if (reviewOnly     && t.needs_review !== true)       return false
      return true
    })
  }, [transactions, search, categoryFilter, accountFilter, startDate, endDate, reviewOnly, notes])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number = a[sortKey as keyof Transaction] as string | number
      let bv: string | number = b[sortKey as keyof Transaction] as string | number
      if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv as string).toLowerCase() }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ?  1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search, categoryFilter, accountFilter, startDate, endDate, reviewOnly])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const startEdit = (t: Transaction) => {
    setEditingId(t.id)
    setEditingNote(notes[t.id] ?? t.notes ?? '')
  }
  const saveEdit = (id: string) => {
    setNotes(prev => ({ ...prev, [id]: editingNote }))
    setEditingId(null)
  }
  const cancelEdit = () => setEditingId(null)

  if (loading) return <TransactionsSkeleton />
  if (error)   return <DataErrorState error={error} onRetry={reload} />

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
                    <Th className="w-8"></Th>
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
                            : <Icon name="ChevronsUpDown" size={12} className="text-muted" />
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
                    const isEditing   = editingId === t.id
                    const isExpanded  = expandedRows.has(t.id)
                    const noteVal     = notes[t.id] ?? t.notes ?? ''
                    const amtColor    = t.amount < 0 ? 'text-rose-400' : 'text-emerald-400'
                    const amtPrefix   = t.amount < 0 ? '-' : '+'
                    const effectiveCat  = categoryEdits[t.id] ?? t.category
                    const subcatOptions = SUBCATEGORIES[effectiveCat] || []

                    return (
                      <Fragment key={t.id}>
                      <Tr className={isExpanded ? 'bg-surface' : ''}>
                        <Td className="w-8">
                          <button
                            onClick={() => toggleExpand(t.id)}
                            className="text-faint hover:text-muted transition-colors"
                          >
                            <Icon name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size={14} />
                          </button>
                        </Td>
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
                          {editingCatId === t.id ? (
                            <select
                              autoFocus
                              value={categoryEdits[t.id] ?? t.category}
                              onChange={e => {
                                setCategoryEdits(prev => ({ ...prev, [t.id]: e.target.value }))
                                setEditingCatId(null)
                              }}
                              onBlur={() => setEditingCatId(null)}
                              className="bg-raised border border-rim text-fg text-xs rounded px-2 py-1 outline-none focus:border-[#10b981]"
                            >
                              {settings.categories.map(c => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                          ) : (
                            <HStack gap="gap-1.5" className="items-center">
                              <Tooltip label="Click to edit category">
                                <Box
                                  className="cursor-pointer"
                                  onClick={() => setEditingCatId(t.id)}
                                >
                                  <Badge color={catColor(categoryEdits[t.id] ?? t.category)}>
                                    {categoryEdits[t.id] ?? t.category}
                                  </Badge>
                                </Box>
                              </Tooltip>
                              {categoryEdits[t.id] && categoryEdits[t.id] !== t.category && (
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Edited (session only)" />
                              )}
                            </HStack>
                          )}
                        </Td>

                        <Td className="text-sm text-muted whitespace-nowrap">{displayAccount(t.account)}</Td>

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
                                  if (e.key === 'Enter')  saveEdit(t.id)
                                  if (e.key === 'Escape') cancelEdit()
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
                              className="text-sm text-muted cursor-pointer hover:text-fg truncate max-w-[180px]"
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

                      {isExpanded && (
                        <Tr>
                          <Td colSpan={8} className="p-0">
                            <Box className="bg-surface border-t border-rim px-6 py-4">
                              <Grid cols={3} gap="gap-x-8 gap-y-3">
                                <VStack gap="gap-0.5">
                                  <Caption>Raw Description</Caption>
                                  <Text className="text-xs text-fg break-all">{t.description}</Text>
                                </VStack>
                                <VStack gap="gap-0.5">
                                  <Caption>Normalized</Caption>
                                  <Text className="text-xs text-fg">{t.normalized_description}</Text>
                                </VStack>
                                <VStack gap="gap-0.5">
                                  <Caption>Account Type</Caption>
                                  <Text className="text-xs text-fg capitalize">{t.account_type ? t.account_type.replace('_', ' ') : ''}</Text>
                                </VStack>
                                <VStack gap="gap-0.5">
                                  <Caption>Source File</Caption>
                                  <Text className="text-xs font-mono text-fg">{t.source_file}</Text>
                                </VStack>
                                <VStack gap="gap-0.5">
                                  <Caption>Imported</Caption>
                                  <Text className="text-xs text-fg">{t.created_at ? Formatters.date(new Date(t.created_at).toISOString().slice(0,10)) : '—'}</Text>
                                </VStack>
                                <VStack gap="gap-0.5">
                                  <Caption>Subcategory</Caption>
                                  {subcatOptions.length > 0 ? (
                                    <select
                                      defaultValue={t.subcategory ?? ''}
                                      className="bg-raised border border-rim text-fg text-xs rounded px-2 py-1 outline-none focus:border-[#10b981] w-full"
                                    >
                                      <option value="">None</option>
                                      {subcatOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                  ) : (
                                    <Text className="text-xs text-muted">—</Text>
                                  )}
                                </VStack>
                              </Grid>
                            </Box>
                          </Td>
                        </Tr>
                      )}
                      </Fragment>
                    )
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
  )
}
