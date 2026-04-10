/**
 * Overlay primitives — Portal, Modal, AlertDialog, Tooltip, Popover, Menu.
 *
 * Globals: Portal, Modal, AlertDialog, Tooltip, Popover, Menu, MenuItem
 *
 * Load order: must come after layout.jsx, typography.jsx, media.jsx, forms.jsx.
 * Portal must be defined first in this file — Modal depends on it.
 */

// ─── Portal ──────────────────────────────────────────────────────────────────

/**
 * Renders children into document.body, outside the React tree.
 * Used by Modal and Tooltip to avoid z-index / overflow clipping issues.
 */
window.Portal = ({ children }) => {
  const elRef = React.useRef(null);
  if (!elRef.current) elRef.current = document.createElement('div');

  React.useEffect(() => {
    const el = elRef.current;
    document.body.appendChild(el);
    return () => document.body.removeChild(el);
  }, []);

  return ReactDOM.createPortal(children, elRef.current);
};

// ─── Modal ───────────────────────────────────────────────────────────────────

const _MODAL_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/**
 * Centered dialog overlaying the page.
 *
 * @prop isOpen  {boolean}
 * @prop onClose {Function}
 * @prop title   {string}   optional header
 * @prop size    {'sm'|'md'|'lg'|'xl'}
 */
window.Modal = ({ isOpen, onClose, title, size = 'md', children }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Panel */}
        <div
          className={`relative bg-[#12121a] border border-[#2a2a3d] rounded-xl shadow-2xl w-full ${_MODAL_SIZES[size] || _MODAL_SIZES.md}`}
        >
          {title && (
            <HStack className="px-5 py-4 border-b border-[#2a2a3d] justify-between">
              <Heading level={3} className="text-base">{title}</Heading>
              <button
                onClick={onClose}
                className="text-[#555575] hover:text-[#f0f0fa] transition-colors p-0.5 rounded"
              >
                {React.createElement(LucideReact.X, { size: 18 })}
              </button>
            </HStack>
          )}
          <div className="p-5">{children}</div>
        </div>
      </div>
    </Portal>
  );
};

// ─── AlertDialog ─────────────────────────────────────────────────────────────

/**
 * Confirmation dialog for potentially destructive actions.
 *
 * @prop isOpen        {boolean}
 * @prop onClose       {Function}
 * @prop onConfirm     {Function}
 * @prop title         {string}
 * @prop description   {string}
 * @prop confirmLabel  {string}  default 'Confirm'
 * @prop confirmVariant{'danger'|'primary'} default 'danger'
 */
window.AlertDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
}) => (
  <Modal isOpen={isOpen} onClose={onClose} size="sm">
    <VStack gap="gap-5">
      <VStack gap="gap-1.5">
        <Text className="font-semibold text-[#f0f0fa]">{title}</Text>
        {description && (
          <Text as="p" className="text-sm text-[#9090b0]">{description}</Text>
        )}
      </VStack>
      <HStack gap="gap-2" className="justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button
          variant={confirmVariant}
          size="sm"
          onClick={() => { onConfirm?.(); onClose(); }}
        >
          {confirmLabel}
        </Button>
      </HStack>
    </VStack>
  </Modal>
);

// ─── Tooltip ─────────────────────────────────────────────────────────────────

const _TOOLTIP_PLACEMENTS = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full  left-1/2 -translate-x-1/2 mt-1.5',
  left:   'right-full top-1/2 -translate-y-1/2  mr-1.5',
  right:  'left-full  top-1/2 -translate-y-1/2  ml-1.5',
};

/**
 * Hover tooltip.
 *
 * @prop label     {string}
 * @prop placement {'top'|'bottom'|'left'|'right'}
 */
window.Tooltip = ({ label, placement = 'top', children }) => {
  const [visible, setVisible] = React.useState(false);
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && label && (
        <div
          className={`absolute z-50 px-2 py-1 bg-[#1a1a26] border border-[#2a2a3d] rounded
            text-xs text-[#f0f0fa] whitespace-nowrap pointer-events-none shadow-lg
            ${_TOOLTIP_PLACEMENTS[placement] || _TOOLTIP_PLACEMENTS.top}`}
        >
          {label}
        </div>
      )}
    </div>
  );
};

// ─── Popover ─────────────────────────────────────────────────────────────────

/**
 * Click-triggered floating panel.
 *
 * @prop trigger {React.ReactNode} the element that opens the popover
 * @prop align   {'left'|'right'}  alignment relative to trigger (default 'right')
 */
window.Popover = ({ trigger, children, align = 'right', className = '' }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const alignClass = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div onClick={() => setOpen(o => !o)} className="cursor-pointer">{trigger}</div>
      {open && (
        <div
          className={`absolute z-40 top-full mt-2 ${alignClass} bg-[#12121a] border border-[#2a2a3d] rounded-xl shadow-2xl p-4 min-w-56`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Menu ────────────────────────────────────────────────────────────────────

/**
 * Dropdown context menu.
 *
 * @prop trigger {React.ReactNode}
 * @prop align   {'left'|'right'}
 */
window.Menu = ({ trigger, children, align = 'right', className = '' }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const alignClass = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div onClick={() => setOpen(o => !o)} className="cursor-pointer">{trigger}</div>
      {open && (
        <div
          className={`absolute z-40 top-full mt-1 ${alignClass} min-w-40 bg-[#1a1a26] border border-[#2a2a3d] rounded-lg shadow-xl py-1`}
        >
          {React.Children.map(children, child =>
            child
              ? React.cloneElement(child, {
                  onClick: () => { child.props.onClick?.(); setOpen(false); },
                })
              : null
          )}
        </div>
      )}
    </div>
  );
};

/**
 * A single option inside a Menu.
 * @prop icon {string} optional Lucide icon name
 */
window.MenuItem = ({ icon, className = '', children, ...props }) => (
  <button
    className={`w-full text-left px-3 py-2 text-sm text-[#9090b0]
      hover:bg-[#2a2a3d] hover:text-[#f0f0fa] transition-colors
      flex items-center gap-2 ${className}`}
    {...props}
  >
    {icon && <Icon name={icon} size={14} />}
    {children}
  </button>
);
