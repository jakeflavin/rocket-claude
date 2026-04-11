/**
 * ViewToggle — 3-button toggle for List / Chart / Calendar views.
 *
 * Used by Bills.jsx and Subscriptions.jsx to switch between display modes.
 *
 * Globals: ViewToggle
 *
 * Props:
 *   view     {string}   active view: 'list' | 'chart' | 'calendar'
 *   onChange {Function} called with the new view string on click
 *
 * Load order: must come after Button, HStack, Icon (forms, layout, media).
 */

window.ViewToggle = ({ view, onChange }) => {
  const views = [
    { value: 'list',     icon: 'List',         label: 'List'     },
    { value: 'chart',    icon: 'PieChart',      label: 'Chart'    },
    { value: 'calendar', icon: 'CalendarDays',  label: 'Calendar' },
  ];

  return (
    <HStack gap="gap-0" className="bg-raised rounded-lg p-1">
      {views.map(({ value, icon, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
            view === value ? 'bg-rim text-fg' : 'text-muted hover:text-fg'
          }`}
        >
          <Icon name={icon} size={13} />
          {label}
        </button>
      ))}
    </HStack>
  );
};
