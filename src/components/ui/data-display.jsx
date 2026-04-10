/**
 * Data display primitives — Card, Badge, Table.
 *
 * Globals: Card, CardHeader, CardBody, CardFooter,
 *          Badge, Table, Thead, Tbody, Tr, Th, Td
 *
 * Load order: must come after layout.jsx, typography.jsx.
 */

// ─── Card ────────────────────────────────────────────────────────────────────

/** Surface container with border and rounded corners. */
window.Card = ({ className = '', children, ...props }) => (
  <div
    className={`bg-card border border-rim rounded-xl ${className}`}
    {...props}
  >
    {children}
  </div>
);

/** Card top section with bottom border. */
window.CardHeader = ({ className = '', children, ...props }) => (
  <div className={`px-5 pt-5 pb-4 border-b border-rim ${className}`} {...props}>
    {children}
  </div>
);

/** Card main content area. */
window.CardBody = ({ className = '', children, ...props }) => (
  <div className={`p-5 ${className}`} {...props}>{children}</div>
);

/** Card bottom section with top border. */
window.CardFooter = ({ className = '', children, ...props }) => (
  <div className={`px-5 pb-5 pt-4 border-t border-rim ${className}`} {...props}>
    {children}
  </div>
);

// ─── Badge ───────────────────────────────────────────────────────────────────

const _BADGE_SIZES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

/**
 * Coloured pill — used for categories and status indicators.
 * Pass hex color from settings.json; background is auto-computed at ~15 % opacity.
 *
 * @prop color {string} hex colour, e.g. '#10b981'
 * @prop size  {'sm'|'md'|'lg'}
 */
window.Badge = ({ color = '#9090b0', size = 'md', className = '', children, ...props }) => (
  <span
    className={`inline-flex items-center gap-1.5 font-medium rounded-full
      ${_BADGE_SIZES[size] || _BADGE_SIZES.md} ${className}`}
    style={{ backgroundColor: `${color}26`, color }}
    {...props}
  >
    {children}
  </span>
);

// ─── Table ───────────────────────────────────────────────────────────────────

/** Scrollable table wrapper. */
window.Table = ({ className = '', children, ...props }) => (
  <div className={`w-full overflow-x-auto ${className}`}>
    <table className="w-full text-sm" {...props}>{children}</table>
  </div>
);

/** Table head section with bottom divider. */
window.Thead = ({ className = '', children, ...props }) => (
  <thead className={`border-b border-rim ${className}`} {...props}>{children}</thead>
);

/** Table body with row dividers. */
window.Tbody = ({ className = '', children, ...props }) => (
  <tbody className={`divide-y divide-rim ${className}`} {...props}>{children}</tbody>
);

/** Table row with subtle hover. */
window.Tr = ({ className = '', children, ...props }) => (
  <tr
    className={`transition-colors hover:bg-raised ${className}`}
    {...props}
  >
    {children}
  </tr>
);

/** Table header cell — uppercase, muted. */
window.Th = ({ className = '', children, ...props }) => (
  <th
    className={`px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide whitespace-nowrap ${className}`}
    {...props}
  >
    {children}
  </th>
);

/** Table data cell. */
window.Td = ({ className = '', children, ...props }) => (
  <td className={`px-4 py-3 text-fg ${className}`} {...props}>{children}</td>
);
