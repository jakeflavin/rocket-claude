/**
 * StatCard — KPI card for the Dashboard top row.
 *
 * Wraps the Stat primitive inside a Card with an optional icon badge.
 *
 * Globals: StatCard
 *
 * Props:
 *   label         {string}   e.g. 'Total Spent'
 *   value         {string}   formatted value, e.g. '$1,234.56'
 *   delta         {string}   optional change string, e.g. '+12%'
 *   deltaPositive {boolean}  true = emerald, false = rose
 *   icon          {string}   optional Lucide icon name shown in top-right badge
 *
 * Load order: must come after Card, Stat, Icon (data-display, other, media).
 */

window.StatCard = ({ label, value, delta, deltaPositive, icon, className = '' }) => (
  <Card className={`p-5 ${className}`}>
    <HStack className="items-start justify-between gap-4">
      <Stat
        label={label}
        value={value}
        delta={delta}
        deltaPositive={deltaPositive}
      />
      {icon && (
        <div className="shrink-0 w-9 h-9 rounded-lg bg-raised border border-rim flex items-center justify-center">
          <Icon name={icon} size={16} className="text-faint" />
        </div>
      )}
    </HStack>
  </Card>
);
