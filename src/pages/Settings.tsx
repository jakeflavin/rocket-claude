import { useState, useEffect, useMemo } from 'react'
import {
  Box, VStack, HStack, Grid, Heading,
  Card, CardHeader, CardBody, EmptyState,
  Input, Select, Switch, Button,
  Table, Thead, Tbody, Tr, Th, Td, PageHeader,
} from '../components/ui'
import { useSettings } from '../context/SettingsContext'
import { useTransactions } from '../hooks/useTransactions'
import type { Settings as SettingsType } from '../types'

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'checking',    label: 'Checking' },
  { value: 'savings',     label: 'Savings' },
  { value: 'credit_card', label: 'Credit Card' },
]

const NOTIFICATION_LABELS: Record<string, string> = {
  needsReview:   'Flag transactions that need review',
  overBudget:    'Alert when a category exceeds budget',
  upcomingBills: 'Show upcoming bills on dashboard',
  billDueSoon:   'Alert when a bill is due within 7 days',
}

export function Settings() {
  const { settings, setSettings } = useSettings()
  const { transactions } = useTransactions()

  // ─── Accounts ────────────────────────────────────────────────────────────
  const csvAccounts = useMemo(() => {
    const map: Record<string, string> = {}
    transactions.forEach(t => { if (!map[t.account]) map[t.account] = t.account_type })
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
  }, [transactions])

  const [accountEdits, setAccountEdits] = useState<Record<string, { displayName: string; type: string }>>({})
  const [accountSaved, setAccountSaved] = useState(false)

  useEffect(() => {
    if (csvAccounts.length === 0) return
    const aliases = settings.accountAliases || {}
    const initial: Record<string, { displayName: string; type: string }> = {}
    csvAccounts.forEach(([name, type]) => {
      initial[name] = {
        displayName: aliases[name]?.displayName ?? name,
        type:        aliases[name]?.type        ?? type,
      }
    })
    setAccountEdits(initial)
  }, [csvAccounts.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveAccounts = () => {
    setSettings(s => ({ ...s, accountAliases: accountEdits }))
    setAccountSaved(true)
    setTimeout(() => setAccountSaved(false), 2000)
  }

  // ─── Budgets ──────────────────────────────────────────────────────────────
  const [budgets, setBudgets] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(settings.budgets).map(([k, v]) => [k, String(v)]))
  )
  const [budgetSaved, setBudgetSaved] = useState(false)

  const saveBudgets = () => {
    const parsed = Object.fromEntries(
      Object.entries(budgets).map(([k, v]) => [k, Math.max(0, parseFloat(v) || 0)])
    )
    setSettings(s => ({ ...s, budgets: parsed }))
    setBudgetSaved(true)
    setTimeout(() => setBudgetSaved(false), 2000)
  }

  // ─── Notifications ────────────────────────────────────────────────────────
  const setNotification = (key: string, val: boolean) =>
    setSettings(s => ({ ...s, notifications: { ...s.notifications, [key]: val } }))

  // ─── Imported Files ───────────────────────────────────────────────────────
  const sourceFiles = useMemo(() => {
    const counts: Record<string, number> = {}
    transactions.forEach(t => { counts[t.source_file] = (counts[t.source_file] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))
  }, [transactions])

  return (
    <Box className="p-6">
      <VStack gap="gap-6">

        <PageHeader title="Settings" />

        {/* ── 1. Accounts ── */}
        <Card>
          <CardHeader>
            <Heading level={3} className="text-sm font-semibold">Accounts</Heading>
          </CardHeader>
          <CardBody>
            {csvAccounts.length === 0 ? (
              <EmptyState icon="CreditCard" title="No accounts found" className="py-8" />
            ) : (
              <VStack gap="gap-4">
                <VStack gap="gap-3">
                  {csvAccounts.map(([original]) => (
                    <HStack key={original} gap="gap-3" className="items-end">
                      <Box className="flex-1">
                        <Input
                          label="Display Name"
                          value={accountEdits[original]?.displayName ?? original}
                          onChange={e => setAccountEdits(prev => ({
                            ...prev,
                            [original]: { ...prev[original], displayName: e.target.value },
                          }))}
                        />
                      </Box>
                      <Box className="w-40">
                        <Select
                          label="Type"
                          value={accountEdits[original]?.type ?? ''}
                          onChange={e => setAccountEdits(prev => ({
                            ...prev,
                            [original]: { ...prev[original], type: e.target.value },
                          }))}
                        >
                          {ACCOUNT_TYPE_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </Select>
                      </Box>
                    </HStack>
                  ))}
                </VStack>
                <HStack gap="gap-3">
                  <Button variant="primary" size="sm" onClick={saveAccounts}>
                    {accountSaved ? 'Saved!' : 'Save Accounts'}
                  </Button>
                </HStack>
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* ── 2. Budget Limits ── */}
        <Card>
          <CardHeader>
            <Heading level={3} className="text-sm font-semibold">Budget Limits</Heading>
          </CardHeader>
          <CardBody>
            <VStack gap="gap-4">
              <Grid cols={3} gap="gap-4">
                {Object.entries(budgets).map(([cat, val]) => (
                  <Input
                    key={cat}
                    label={cat}
                    type="number"
                    min="0"
                    step="10"
                    value={val}
                    onChange={e => setBudgets(prev => ({ ...prev, [cat]: e.target.value }))}
                  />
                ))}
              </Grid>
              <HStack gap="gap-3">
                <Button variant="primary" size="sm" onClick={saveBudgets}>
                  {budgetSaved ? 'Saved!' : 'Save Budgets'}
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* ── 3. Notifications ── */}
        <Card>
          <CardHeader>
            <Heading level={3} className="text-sm font-semibold">Notifications</Heading>
          </CardHeader>
          <CardBody>
            <VStack gap="gap-4">
              {(Object.entries(settings.notifications) as [string, boolean][]).map(([key, val]) => (
                <Switch
                  key={key}
                  checked={val}
                  onChange={v => setNotification(key, v)}
                  label={NOTIFICATION_LABELS[key] ?? key}
                />
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* ── 4. Appearance ── */}
        <Card>
          <CardHeader>
            <Heading level={3} className="text-sm font-semibold">Appearance</Heading>
          </CardHeader>
          <CardBody>
            <Select
              label="Theme"
              value={settings.user.theme || 'system'}
              onChange={e => setSettings(s => ({
                ...s,
                user: { ...s.user, theme: e.target.value as SettingsType['user']['theme'] },
              }))}
            >
              <option value="system">System</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </Select>
          </CardBody>
        </Card>

        {/* ── 5. Imported Files ── */}
        <Card>
          <CardHeader>
            <Heading level={3} className="text-sm font-semibold">Imported Files</Heading>
          </CardHeader>
          <CardBody className="p-0">
            {sourceFiles.length === 0 ? (
              <EmptyState icon="FileText" title="No imported files" className="py-8" />
            ) : (
              <Table>
                <Thead>
                  <Tr><Th>File</Th><Th>Transactions</Th></Tr>
                </Thead>
                <Tbody>
                  {sourceFiles.map(([file, count]) => (
                    <Tr key={file}>
                      <Td className="font-mono text-sm">{file}</Td>
                      <Td className="text-sm">{count}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>

      </VStack>
    </Box>
  )
}
