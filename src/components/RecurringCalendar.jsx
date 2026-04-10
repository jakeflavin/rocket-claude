/**
 * RecurringCalendar — shared monthly calendar grid for recurring items.
 *
 * Props:
 *   items  {Array<{merchant, dueDate, color, tooltipLabel}>}
 *          dueDate is a YYYY-MM-DD string. Items outside the displayed month are ignored.
 */
const RECURRING_CAL_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function RecurringCalendar({ items }) {
  const [calDate, setCalDate] = React.useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const prevMonth = () => setCalDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCalDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const year         = calDate.getFullYear();
  const month        = calDate.getMonth();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const itemsByDay = React.useMemo(() => {
    const map = {};
    items.forEach(item => {
      if (!item.dueDate) return;
      const due = new Date(item.dueDate + 'T12:00:00');
      if (due.getFullYear() === year && due.getMonth() === month) {
        const day = due.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(item);
      }
    });
    return map;
  }, [items, year, month]);

  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const day = i - firstWeekday + 1;
    cells.push(day >= 1 && day <= daysInMonth ? day : null);
  }

  const today   = new Date();
  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const monthLabel = calDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Card>
      <CardHeader>
        <HStack className="justify-between items-center">
          <button onClick={prevMonth} className="text-muted hover:text-fg transition-colors p-1">
            <Icon name="ChevronLeft" size={16} />
          </button>
          <Heading level={3} className="text-sm font-semibold">{monthLabel}</Heading>
          <button onClick={nextMonth} className="text-muted hover:text-fg transition-colors p-1">
            <Icon name="ChevronRight" size={16} />
          </button>
        </HStack>
      </CardHeader>
      <CardBody className="p-3">
        <div className="grid grid-cols-7 mb-1">
          {RECURRING_CAL_DAYS.map(d => (
            <div key={d} className="text-center text-xs text-faint font-medium py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px">
          {cells.map((day, i) => {
            const dayItems = day ? (itemsByDay[day] || []) : [];
            return (
              <div
                key={i}
                className={`min-h-[72px] rounded p-1 ${
                  day ? 'bg-surface' : 'bg-transparent'
                } ${isToday(day) ? 'ring-1 ring-emerald-500' : ''}`}
              >
                {day && (
                  <VStack gap="gap-1">
                    <Text className={`text-xs font-medium text-right pr-0.5 ${
                      isToday(day) ? 'text-emerald-400' : 'text-muted'
                    }`}>
                      {day}
                    </Text>
                    {dayItems.map((item, idx) => (
                      <Tooltip key={`${item.merchant}-${idx}`} label={item.tooltipLabel}>
                        <div
                          className="text-[10px] leading-tight rounded px-1 py-0.5 truncate cursor-default"
                          style={{ backgroundColor: `${item.color}33`, color: item.color }}
                        >
                          {item.merchant}
                        </div>
                      </Tooltip>
                    ))}
                  </VStack>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

window.RecurringCalendar = RecurringCalendar;
