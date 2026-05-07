import { type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CalendarGridProps<T> = {
  year: number;
  month: number; // 0-indexed
  items: T[];
  getItemDate: (item: T) => string; // 'YYYY-MM-DD'
  renderItem: (item: T) => ReactNode;
  onMonthChange: (year: number, month: number) => void;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function CalendarGrid<T>({
  year,
  month,
  items,
  getItemDate,
  renderItem,
  onMonthChange,
}: CalendarGridProps<T>) {
  function handlePrev() {
    if (month === 0) onMonthChange(year - 1, 11);
    else onMonthChange(year, month - 1);
  }

  function handleNext() {
    if (month === 11) onMonthChange(year + 1, 0);
    else onMonthChange(year, month + 1);
  }

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group items by day-of-month
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  const byDay = new Map<number, T[]>();
  for (const item of items) {
    const d = getItemDate(item);
    if (d.startsWith(prefix)) {
      const day = parseInt(d.slice(8, 10), 10);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(item);
    }
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Build grid cells: leading empty cells + day cells
  const cells: (number | null)[] = [
    ...Array<null>(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last row
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    cells.push(...Array<null>(7 - remainder).fill(null));
  }

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <button
          type="button"
          onClick={handlePrev}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-hover hover:text-text transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-text">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          onClick={handleNext}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-hover hover:text-text transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 border-b border-border bg-canvas">
        {DAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-medium text-muted uppercase tracking-[0.04em]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 flex-1">
        {cells.map((day, idx) => {
          const isToday = isCurrentMonth && day === today.getDate();
          const dayItems = day !== null ? (byDay.get(day) ?? []) : [];
          const isLastRow = idx >= cells.length - 7;
          const isLastCol = (idx % 7) === 6;

          return (
            <div
              key={idx}
              className={[
                'min-h-[96px] p-1.5 flex flex-col gap-1',
                !isLastRow ? 'border-b border-border' : '',
                !isLastCol ? 'border-r border-border' : '',
                day === null ? 'bg-canvas/50' : '',
              ].join(' ')}
            >
              {day !== null && (
                <>
                  <span
                    className={[
                      'text-xs font-medium self-start w-6 h-6 flex items-center justify-center rounded-full leading-none',
                      isToday
                        ? 'bg-brand text-white'
                        : 'text-muted',
                    ].join(' ')}
                  >
                    {day}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {dayItems.map((item, i) => (
                      <div key={i}>{renderItem(item)}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
