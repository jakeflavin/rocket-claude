/**
 * Media & Icons primitives — Icon (Lucide wrapper), Img, Avatar.
 *
 * Globals: Icon, Img, Avatar
 *
 * Load order: must come after layout.jsx and typography.jsx.
 */

/**
 * Lucide React icon wrapper.
 * Icon names come from settings.json — never hardcode them in components.
 *
 * @prop name        {string} Lucide icon name, e.g. 'TrendingUp'
 * @prop size        {number} px size (default 16)
 * @prop strokeWidth {number} (default 2)
 * @prop color       {string} CSS colour value
 */
window.Icon = ({ name, size = 16, className = '', color, strokeWidth = 2, ...props }) => {
  const IconComponent = LucideReact[name];
  if (!IconComponent) {
    console.warn(`[Icon] Unknown Lucide icon: "${name}"`);
    return null;
  }
  return React.createElement(IconComponent, { size, className, color, strokeWidth, ...props });
};

/**
 * Image with error fallback.
 * @prop src      {string}
 * @prop alt      {string}
 * @prop fallback {React.ReactNode} rendered when src fails to load
 */
window.Img = ({ src, alt = '', className = '', fallback = null, ...props }) => {
  const [errored, setErrored] = React.useState(false);
  if (errored && fallback) return fallback;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      {...props}
    />
  );
};

/**
 * Circular avatar — shows image if provided, falls back to initials.
 * @prop name {string} used for initials and alt text
 * @prop src  {string} optional image URL
 * @prop size {'sm'|'md'|'lg'}
 */
window.Avatar = ({ name = '', src = '', size = 'md', className = '' }) => {
  const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const [imgErrored, setImgErrored] = React.useState(false);

  return (
    <div
      className={`rounded-full bg-[#1a1a26] border border-[#2a2a3d] flex items-center justify-center overflow-hidden shrink-0 ${sizeMap[size] || sizeMap.md} ${className}`}
    >
      {src && !imgErrored ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgErrored(true)}
        />
      ) : (
        <span className="font-medium text-[#9090b0]">{initials}</span>
      )}
    </div>
  );
};
