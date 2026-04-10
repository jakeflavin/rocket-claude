/**
 * UI Primitives — lightweight layout and text wrappers.
 *
 * Replaces Gluestack UI (not CDN-compatible) with equivalent thin
 * components that compose Tailwind classes. All components accept a
 * className prop for overrides and spread remaining props onto the
 * underlying element.
 *
 * Available globals:
 *   Box, VStack, HStack, Center, Text, Heading, Divider
 */

/**
 * @param {{ className?: string, children?: any, [key: string]: any }} props
 */
window.Box = ({ className = '', children, ...props }) => (
  <div className={className} {...props}>{children}</div>
);

/**
 * @param {{ className?: string, gap?: string, children?: any, [key: string]: any }} props
 */
window.VStack = ({ className = '', gap = 'gap-4', children, ...props }) => (
  <div className={`flex flex-col ${gap} ${className}`} {...props}>{children}</div>
);

/**
 * @param {{ className?: string, gap?: string, children?: any, [key: string]: any }} props
 */
window.HStack = ({ className = '', gap = 'gap-4', children, ...props }) => (
  <div className={`flex flex-row items-center ${gap} ${className}`} {...props}>{children}</div>
);

/**
 * @param {{ className?: string, children?: any, [key: string]: any }} props
 */
window.Center = ({ className = '', children, ...props }) => (
  <div className={`flex items-center justify-center ${className}`} {...props}>{children}</div>
);

/**
 * @param {{ className?: string, as?: string, children?: any, [key: string]: any }} props
 */
window.Text = ({ className = '', as: Tag = 'span', children, ...props }) => (
  <Tag className={className} {...props}>{children}</Tag>
);

/**
 * @param {{ className?: string, level?: 1|2|3|4, children?: any, [key: string]: any }} props
 */
window.Heading = ({ className = '', level = 2, children, ...props }) => {
  const Tag = `h${level}`;
  const defaultSize = ['', 'text-3xl', 'text-2xl', 'text-xl', 'text-lg'][level] || 'text-xl';
  return (
    <Tag className={`font-semibold text-[#f0f0fa] ${defaultSize} ${className}`} {...props}>
      {children}
    </Tag>
  );
};

/**
 * @param {{ className?: string }} props
 */
window.Divider = ({ className = '' }) => (
  <hr className={`border-[#2a2a3d] ${className}`} />
);
