/**
 * Typography primitives — text and heading components.
 *
 * Globals: Text, Heading, Label, Caption
 */

/**
 * Inline or block text.
 * @prop as {'span'|'p'|'div'|'li'|...} underlying element (default 'span')
 */
window.Text = ({ className = '', as: Tag = 'span', children, ...props }) => (
  <Tag className={className} {...props}>{children}</Tag>
);

/**
 * Section heading h1–h4 with sensible size defaults.
 * @prop level {1|2|3|4}
 */
window.Heading = ({ className = '', level = 2, children, ...props }) => {
  const Tag = `h${level}`;
  const sizes = { 1: 'text-3xl', 2: 'text-2xl', 3: 'text-xl', 4: 'text-lg' };
  return (
    <Tag
      className={`font-semibold text-fg ${sizes[level] || 'text-xl'} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

/** Form field label — uppercase, muted, small. */
window.Label = ({ className = '', children, ...props }) => (
  <label
    className={`text-xs font-medium text-muted uppercase tracking-wide ${className}`}
    {...props}
  >
    {children}
  </label>
);

/** De-emphasised helper or metadata text. */
window.Caption = ({ className = '', children, ...props }) => (
  <span className={`text-xs text-faint ${className}`} {...props}>{children}</span>
);
