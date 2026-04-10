/**
 * Settings — 5 sections:
 *   1. Profile editor
 *   2. Accounts list (derived from CSV)
 *   3. Budget limits editor (updates runtime settings via setSettings)
 *   4. Notifications toggles
 *   5. Imported Files table (unique source_file + transaction counts)
 */

const ACCOUNT_TYPE_LABELS = {
  checking:    'Checking',
  savings:     'Savings',
  credit_card: 'Credit Card',
};

const NOTIFICATION_LABELS = {
  needsReview:   'Flag transactions that need review',
  overBudget:    'Alert when a category exceeds budget',
  upcomingBills: 'Show upcoming bills on dashboard',
  billDueSoon:   'Alert when a bill is due within 7 days',
};

function Settings() {
  const { settings, setSettings } = useSettings();
  const { transactions } = useTransactions();

  // ─── Profile ──────────────────────────────────────────────────────────────
  const [profileName,  setProfileName]  = React.useState(settings.user.name);
  const [profileSaved, setProfileSaved] = React.useState(false);

  const saveProfile = () => {
    setSettings(s => ({ ...s, user: { ...s.user, name: profileName } }));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  // ─── Budgets ──────────────────────────────────────────────────────────────
  const [budgets,      setBudgets]      = React.useState(
    Object.fromEntries(Object.entries(settings.budgets).map(([k, v]) => [k, String(v)]))
  );
  const [budgetSaved,  setBudgetSaved]  = React.useState(false);

  const saveBudgets = () => {
    const parsed = Object.fromEntries(
      Object.entries(budgets).map(([k, v]) => [k, Math.max(0, parseFloat(v) || 0)])
    );
    setSettings(s => ({ ...s, budgets: parsed }));
    setBudgetSaved(true);
    setTimeout(() => setBudgetSaved(false), 2000);
  };

  // ─── Notifications ────────────────────────────────────────────────────────
  const setNotification = (key, val) =>
    setSettings(s => ({ ...s, notifications: { ...s.notifications, [key]: val } }));

  // ─── Accounts (from CSV) ──────────────────────────────────────────────────
  const accounts = React.useMemo(() => {
    const map = {};
    transactions.forEach(t => { if (!map[t.account]) map[t.account] = t.account_type; });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [transactions]);

  // ─── Imported Files (from CSV) ────────────────────────────────────────────
  const sourceFiles = React.useMemo(() => {
    const counts = {};
    transactions.forEach(t => { counts[t.source_file] = (counts[t.source_file] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  }, [transactions]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box className="p-6">
      <VStack gap="gap-6">

        <PageHeader title="Settings" />

        {/* ── 1. Profile ── */}
        <Card>
          <CardHeader>
            <Heading level={3} className="text-sm font-semibold">Profile</Heading>
          </CardHeader>
          <CardBody>
            <VStack gap="gap-4">
              <Box className="max-w-sm">
                <Input
                  label="Name"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveProfile()}
                />
              </Box>
              <HStack gap="gap-3">
                <Button variant="primary" size="sm" onClick={saveProfile}>
                  {profileSaved ? 'Saved!' : 'Save'}
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* ── 2. Accounts ── */}
        <Card>
          <CardHeader>
            <Heading level={3} className="text-sm font-semibold">Accounts</Heading>
          </CardHeader>
          <CardBody className="p-0">
            {accounts.length === 0 ? (
              <EmptyState icon="CreditCard" title="No accounts found" className="py-8" />
            ) : (
              <Table>
                <Thead>
                  <Tr><Th>Account</Th><Th>Type</Th></Tr>
                </Thead>
                <Tbody>
                  {accounts.map(([name, type]) => (
                    <Tr key={name}>
                      <Td className="text-sm">{name}</Td>
                      <Td className="text-sm text-[#9090b0]">
                        {ACCOUNT_TYPE_LABELS[type] ?? type}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>

        {/* ── 3. Budget Limits ── */}
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

        {/* ── 4. Notifications ── */}
        <Card>
          <CardHeader>
            <Heading level={3} className="text-sm font-semibold">Notifications</Heading>
          </CardHeader>
          <CardBody>
            <VStack gap="gap-4">
              {Object.entries(settings.notifications).map(([key, val]) => (
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
  );
}

window.Settings = Settings;
