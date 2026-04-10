/**
 * Feedback primitives — loading, progress, and status indicators.
 *
 * Globals: Spinner, Skeleton, Progress, Alert
 *
 * Load order: must come after layout.jsx, typography.jsx, media.jsx.
 */

// ─── Spinner ─────────────────────────────────────────────────────────────────

/**
 * Animated loading spinner.
 * @prop size {'sm'|'md'|'lg'}
 */
window.Spinner = ({ size = 'md', className = '' }) => {
  const sizeMap = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-[3px]' };
  return (
    <div
      className={`${sizeMap[size] || sizeMap.md} border-[#2a2a3d] border-t-[#10b981] rounded-full animate-spin ${className}`}
    />
  );
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

/**
 * Pulsing placeholder block for loading states.
 * Size the element via className (e.g. "h-4 w-32").
 */
window.Skeleton = ({ className = '', ...props }) => (
  <div className={`bg-[#1a1a26] rounded animate-pulse ${className}`} {...props} />
);

// ─── Progress ────────────────────────────────────────────────────────────────

/**
 * Horizontal progress bar. Color shifts at 75 % and 90 % of max.
 *
 * @prop value     {number} current value
 * @prop max       {number} maximum value (default 100)
 * @prop showLabel {boolean} show percentage text below bar
 */
window.Progress = ({ value = 0, max = 100, className = '', showLabel = false }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <VStack gap="gap-1" className={className}>
      <div className="h-2 w-full bg-[#2a2a3d] rounded-full overflow-hidden">
        {/* Inline style is unavoidable here — dynamic width cannot be a static Tailwind class */}
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <Text className="text-xs text-[#9090b0]">{Math.round(pct)}%</Text>
      )}
    </VStack>
  );
};

// ─── Alert ───────────────────────────────────────────────────────────────────

const _ALERT_STYLES = {
  info:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    text: 'text-blue-400',   icon: 'Info'          },
  success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400',icon: 'CheckCircle'   },
  warning: { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-400',  icon: 'AlertTriangle' },
  error:   { bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    text: 'text-rose-400',   icon: 'XCircle'       },
};

/**
 * Inline alert banner.
 *
 * @prop variant {'info'|'success'|'warning'|'error'}
 * @prop title   {string}  bold heading line
 * @prop onClose {Function} if provided, renders a close button
 */
window.Alert = ({ variant = 'info', title, children, onClose, className = '' }) => {
  const s = _ALERT_STYLES[variant] || _ALERT_STYLES.info;
  return (
    <HStack
      gap="gap-3"
      className={`${s.bg} border ${s.border} rounded-lg p-3 items-start ${className}`}
    >
      <Icon name={s.icon} size={16} className={`${s.text} mt-0.5 shrink-0`} />
      <VStack gap="gap-0.5" className="flex-1 min-w-0">
        {title && <Text className={`text-sm font-medium ${s.text}`}>{title}</Text>}
        {children && <Text as="p" className="text-xs text-[#9090b0]">{children}</Text>}
      </VStack>
      {onClose && (
        <button
          onClick={onClose}
          className="text-[#555575] hover:text-[#9090b0] transition-colors shrink-0"
        >
          {React.createElement(LucideReact.X, { size: 14 })}
        </button>
      )}
    </HStack>
  );
};
