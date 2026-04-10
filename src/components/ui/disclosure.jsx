/**
 * Disclosure primitives — collapsible / expandable content.
 *
 * Globals: Accordion, AccordionItem, Collapsible, Tabs, Tab, TabPanel
 *
 * Load order: must come after layout.jsx, typography.jsx, media.jsx.
 */

// ─── Accordion ───────────────────────────────────────────────────────────────

/** Wrapper that provides visual dividers between AccordionItems. */
window.Accordion = ({ children, className = '' }) => (
  <div className={`divide-y divide-[#2a2a3d] ${className}`}>{children}</div>
);

/**
 * A single collapsible accordion section.
 *
 * @prop title       {string}
 * @prop defaultOpen {boolean}
 */
window.AccordionItem = ({ title, children, defaultOpen = false, className = '' }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={className}>
      <HStack
        className="py-3 cursor-pointer hover:text-[#f0f0fa] transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <Text className="flex-1 text-sm font-medium text-[#f0f0fa]">{title}</Text>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-[#555575] shrink-0" />
      </HStack>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
};

// ─── Collapsible ─────────────────────────────────────────────────────────────

/**
 * Simple show/hide wrapper — no animation, no header.
 * Useful for progressive disclosure of secondary content.
 *
 * @prop isOpen {boolean}
 */
window.Collapsible = ({ isOpen, children }) => {
  if (!isOpen) return null;
  return <div>{children}</div>;
};

// ─── Tabs ────────────────────────────────────────────────────────────────────

/**
 * Controlled horizontal tab bar.
 *
 * Usage:
 *   const [tab, setTab] = React.useState('all');
 *   <Tabs value={tab} onChange={setTab}>
 *     <Tab value="all">All</Tab>
 *     <Tab value="streaming">Streaming</Tab>
 *   </Tabs>
 *   <TabPanel value="all" active={tab}>…</TabPanel>
 */
window.Tabs = ({ value, onChange, children, className = '' }) => (
  <HStack
    gap="gap-1"
    className={`border-b border-[#2a2a3d] ${className}`}
  >
    {React.Children.map(children, child =>
      child ? React.cloneElement(child, { _activeTab: value, _onChange: onChange }) : null
    )}
  </HStack>
);

/**
 * A single tab button inside Tabs.
 * (Internal props _activeTab/_onChange injected by Tabs.)
 *
 * @prop value {string}
 */
window.Tab = ({ value, children, _activeTab, _onChange, className = '' }) => {
  const isActive = value === _activeTab;
  return (
    <button
      onClick={() => _onChange && _onChange(value)}
      className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer
        ${isActive
          ? 'border-[#10b981] text-[#f0f0fa]'
          : 'border-transparent text-[#9090b0] hover:text-[#f0f0fa]'}
        ${className}`}
    >
      {children}
    </button>
  );
};

/**
 * Content panel shown when its value matches the active tab.
 *
 * @prop value  {string}
 * @prop active {string} current active tab value
 */
window.TabPanel = ({ value, active, children, className = '' }) => {
  if (value !== active) return null;
  return <div className={className}>{children}</div>;
};
