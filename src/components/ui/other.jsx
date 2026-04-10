/**
 * Other primitives — composed helpers that don't fit a single category.
 *
 * Globals: EmptyState, PageHeader, Stat
 *
 * Load order: must come after all other UI files.
 */

// ─── EmptyState ──────────────────────────────────────────────────────────────

/**
 * Friendly placeholder for empty lists and zero-result searches.
 *
 * @prop icon        {string}          Lucide icon name (default 'Inbox')
 * @prop title       {string}
 * @prop description {string}          optional sub-text
 * @prop action      {React.ReactNode} optional call-to-action button
 */
window.EmptyState = ({
  icon = 'Inbox',
  title = 'Nothing here',
  description,
  action,
  className = '',
}) => (
  <Center className={`py-16 ${className}`}>
    <VStack gap="gap-4" className="items-center text-center">
      <div className="w-12 h-12 rounded-xl bg-raised border border-rim flex items-center justify-center">
        <Icon name={icon} size={20} className="text-faint" />
      </div>
      <VStack gap="gap-1.5" className="items-center">
        <Text className="text-sm font-medium text-muted">{title}</Text>
        {description && (
          <Caption className="max-w-xs leading-relaxed">{description}</Caption>
        )}
      </VStack>
      {action && <div>{action}</div>}
    </VStack>
  </Center>
);

// ─── PageHeader ──────────────────────────────────────────────────────────────

/**
 * Consistent page title row used at the top of every page.
 *
 * @prop title    {string}
 * @prop subtitle {string}          optional description line
 * @prop children {React.ReactNode} optional right-side actions
 */
window.PageHeader = ({ title, subtitle, children, className = '' }) => (
  <HStack className={`mb-6 items-start ${className}`}>
    <VStack gap="gap-0.5" className="flex-1">
      <Heading level={2} className="text-xl">{title}</Heading>
      {subtitle && <Text className="text-sm text-muted">{subtitle}</Text>}
    </VStack>
    {children && <div className="shrink-0">{children}</div>}
  </HStack>
);

// ─── Stat ────────────────────────────────────────────────────────────────────

/**
 * KPI stat block — label, large mono value, optional delta.
 * Used inside a Card for the Dashboard KPI row.
 *
 * @prop label         {string}
 * @prop value         {string}  formatted display value (e.g. '$1,234')
 * @prop delta         {string}  optional change string (e.g. '+12%')
 * @prop deltaPositive {boolean} true = emerald, false = rose
 */
window.Stat = ({ label, value, delta, deltaPositive, className = '' }) => (
  <VStack gap="gap-1" className={className}>
    <Label>{label}</Label>
    <Text className="text-2xl font-bold font-mono text-fg">{value}</Text>
    {delta !== undefined && delta !== null && (
      <HStack gap="gap-1">
        <Icon
          name={deltaPositive ? 'TrendingUp' : 'TrendingDown'}
          size={12}
          className={deltaPositive ? 'text-emerald-400' : 'text-rose-400'}
        />
        <Caption className={deltaPositive ? 'text-emerald-400' : 'text-rose-400'}>
          {delta}
        </Caption>
      </HStack>
    )}
  </VStack>
);
