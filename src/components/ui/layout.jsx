/**
 * Layout primitives — structural building blocks.
 *
 * Globals: Box, VStack, HStack, Center, Grid, Spacer, Container, Divider
 */

/** Generic div wrapper. */
window.Box = ({ className = '', children, ...props }) => (
  <div className={className} {...props}>{children}</div>
);

/** Vertical flex stack. @prop gap {string} Tailwind gap class (default 'gap-4') */
window.VStack = ({ className = '', gap = 'gap-4', children, ...props }) => (
  <div className={`flex flex-col ${gap} ${className}`} {...props}>{children}</div>
);

/** Horizontal flex stack, vertically centered. @prop gap {string} */
window.HStack = ({ className = '', gap = 'gap-4', children, ...props }) => (
  <div className={`flex flex-row items-center ${gap} ${className}`} {...props}>{children}</div>
);

/** Flex center — both axes. */
window.Center = ({ className = '', children, ...props }) => (
  <div className={`flex items-center justify-center ${className}`} {...props}>{children}</div>
);

/**
 * CSS grid wrapper.
 * @prop cols       {1|2|3|4} number of columns
 * @prop gap        {string}  Tailwind gap class
 * @prop responsive {boolean} if true, stacks to 1-col on mobile and steps up:
 *                            cols=4 → grid-cols-2 md:grid-cols-4
 *                            cols=2 → grid-cols-1 md:grid-cols-2
 *                            cols=3 → grid-cols-1 md:grid-cols-3
 */
window.Grid = ({ className = '', cols = 2, gap = 'gap-4', responsive = false, children }) => {
  let colsClass;
  if (responsive) {
    const responsiveMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      4: 'grid-cols-2 lg:grid-cols-4',
    };
    colsClass = responsiveMap[cols] || 'grid-cols-1 md:grid-cols-2';
  } else {
    const colsMap = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };
    colsClass = colsMap[cols] || 'grid-cols-2';
  }
  return (
    <div className={`grid ${colsClass} ${gap} ${className}`}>
      {children}
    </div>
  );
};

/** Pushes siblings apart in a flex container. */
window.Spacer = () => <div className="flex-1" />;

/** Max-width content wrapper. */
window.Container = ({ className = '', children, ...props }) => (
  <div className={`max-w-7xl mx-auto w-full ${className}`} {...props}>{children}</div>
);

/**
 * Horizontal or vertical rule.
 * @prop orientation {'horizontal'|'vertical'}
 */
window.Divider = ({ className = '', orientation = 'horizontal', ...props }) =>
  orientation === 'vertical'
    ? <div className={`w-px bg-[#2a2a3d] self-stretch ${className}`} {...props} />
    : <hr className={`border-[#2a2a3d] ${className}`} {...props} />;
