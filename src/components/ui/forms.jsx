/**
 * Form primitives — interactive input controls.
 *
 * Globals: Button, Input, Select, Textarea, Switch, Checkbox
 *
 * Load order: must come after layout.jsx, typography.jsx, media.jsx.
 */

// ─── Button ─────────────────────────────────────────────────────────────────

const _BUTTON_VARIANTS = {
  primary:   'bg-[#10b981] text-white hover:bg-emerald-400 border border-transparent',
  secondary: 'bg-raised text-fg border border-rim hover:bg-rim',
  ghost:     'bg-transparent text-muted border border-transparent hover:bg-raised hover:text-fg',
  danger:    'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25',
};

const _BUTTON_SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-sm rounded-xl',
};

/**
 * @prop variant {'primary'|'secondary'|'ghost'|'danger'}
 * @prop size    {'sm'|'md'|'lg'}
 */
window.Button = ({
  variant = 'secondary',
  size = 'md',
  className = '',
  disabled = false,
  children,
  ...props
}) => (
  <button
    disabled={disabled}
    className={`inline-flex items-center gap-2 font-medium transition-colors cursor-pointer
      disabled:opacity-50 disabled:cursor-not-allowed
      ${_BUTTON_VARIANTS[variant] || _BUTTON_VARIANTS.secondary}
      ${_BUTTON_SIZES[size] || _BUTTON_SIZES.md}
      ${className}`}
    {...props}
  >
    {children}
  </button>
);

// ─── Input ───────────────────────────────────────────────────────────────────

/**
 * Text input with optional label and error message.
 * @prop label {string}
 * @prop error {string}
 */
window.Input = ({ className = '', label, error, id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <VStack gap="gap-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <input
        id={inputId}
        className={`bg-raised border rounded-lg px-3 py-2 text-sm text-fg
          placeholder-faint focus:outline-none transition-colors
          ${error ? 'border-rose-500 focus:border-rose-400' : 'border-rim focus:border-[#10b981]'}
          ${className}`}
        {...props}
      />
      {error && <Caption className="text-rose-400">{error}</Caption>}
    </VStack>
  );
};

// ─── Select ──────────────────────────────────────────────────────────────────

/**
 * Dropdown select with optional label.
 * @prop label {string}
 */
window.Select = ({ className = '', label, id, children, ...props }) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <VStack gap="gap-1.5">
      {label && <Label htmlFor={selectId}>{label}</Label>}
      <select
        id={selectId}
        className={`bg-raised border border-rim rounded-lg px-3 py-2 text-sm
          text-fg focus:outline-none focus:border-[#10b981] transition-colors cursor-pointer
          ${className}`}
        {...props}
      >
        {children}
      </select>
    </VStack>
  );
};

// ─── Textarea ────────────────────────────────────────────────────────────────

/**
 * Multi-line text input.
 * @prop label {string}
 * @prop error {string}
 */
window.Textarea = ({ className = '', label, error, id, rows = 3, ...props }) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <VStack gap="gap-1.5">
      {label && <Label htmlFor={textareaId}>{label}</Label>}
      <textarea
        id={textareaId}
        rows={rows}
        className={`bg-raised border rounded-lg px-3 py-2 text-sm text-fg
          placeholder-faint focus:outline-none transition-colors resize-none
          ${error ? 'border-rose-500 focus:border-rose-400' : 'border-rim focus:border-[#10b981]'}
          ${className}`}
        {...props}
      />
      {error && <Caption className="text-rose-400">{error}</Caption>}
    </VStack>
  );
};

// ─── Switch ──────────────────────────────────────────────────────────────────

/**
 * Toggle switch for boolean settings.
 * @prop checked  {boolean}
 * @prop onChange {(value: boolean) => void}
 * @prop label    {string}
 */
window.Switch = ({ checked = false, onChange, label, className = '', disabled = false }) => (
  <HStack gap="gap-3" className={className}>
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange && onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full
        transition-colors focus:outline-none
        ${checked ? 'bg-[#10b981]' : 'bg-rim'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform
          ${checked ? 'translate-x-4' : 'translate-x-1'}`}
      />
    </button>
    {label && (
      <Text className={`text-sm ${disabled ? 'text-faint' : 'text-fg'}`}>
        {label}
      </Text>
    )}
  </HStack>
);

// ─── Checkbox ────────────────────────────────────────────────────────────────

/**
 * Checkbox with optional label.
 * @prop checked  {boolean}
 * @prop onChange {(value: boolean) => void}
 * @prop label    {string}
 */
window.Checkbox = ({ checked = false, onChange, label, className = '', disabled = false }) => (
  <HStack
    gap="gap-2"
    className={`${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    onClick={() => !disabled && onChange && onChange(!checked)}
  >
    <div
      className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors
        ${checked ? 'bg-[#10b981] border-[#10b981]' : 'border-rim bg-raised'}`}
    >
      {checked && <Icon name="Check" size={10} color="white" strokeWidth={3} />}
    </div>
    {label && <Text className="text-sm text-muted select-none">{label}</Text>}
  </HStack>
);
