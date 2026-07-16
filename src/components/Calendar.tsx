import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clinic } from '../config/clinic';
import { toDateKey } from '../lib/booking';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const monthLabel = new Intl.DateTimeFormat('en-PH', { month: 'long', year: 'numeric' });

/** How far ahead patients may book. */
const MAX_ADVANCE_DAYS = 60;

interface CalendarProps {
  selected: Date | null;
  onSelect: (d: Date) => void;
  daysOff: Set<string>;
}

export function Calendar({ selected, onSelect, daysOff }: CalendarProps) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const maxDate = useMemo(() => {
    const m = new Date(today);
    m.setDate(m.getDate() + MAX_ADVANCE_DAYS);
    return m;
  }, [today]);

  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const canGoPrev = view > new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoNext = new Date(view.getFullYear(), view.getMonth() + 1, 1) <= maxDate;

  const cells = useMemo(() => {
    const firstWeekday = view.getDay(); // 0 = Sunday
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const out: (Date | null)[] = Array.from({ length: firstWeekday }, () => null);
    for (let d = 1; d <= daysInMonth; d++) {
      out.push(new Date(view.getFullYear(), view.getMonth(), d));
    }
    return out;
  }, [view]);

  function isSelectable(d: Date): boolean {
    if (d < today || d > maxDate) return false;
    const sessions = clinic.hours[DAY_KEYS[d.getDay()]] ?? [];
    if (sessions.length === 0) return false;
    return !daysOff.has(toDateKey(d));
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-4">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
          disabled={!canGoPrev}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-serif text-base font-semibold">{monthLabel.format(view)}</div>
        <button
          type="button"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
          disabled={!canGoNext}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="mt-3 grid grid-cols-7 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-xs font-semibold text-muted-foreground">
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`pad-${i}`} />;
          const selectable = isSelectable(d);
          const isSelected = selected !== null && toDateKey(d) === toDateKey(selected);
          const isToday = toDateKey(d) === toDateKey(today);
          return (
            <button
              key={d.getDate()}
              type="button"
              disabled={!selectable}
              onClick={() => onSelect(d)}
              aria-pressed={isSelected}
              className={[
                'relative grid h-10 place-items-center rounded-lg text-sm tabular-nums transition-colors',
                isSelected
                  ? 'bg-primary font-bold text-primary-fg'
                  : selectable
                    ? 'font-medium text-foreground hover:bg-primary-soft'
                    : 'text-muted-foreground/35 line-through decoration-transparent',
                isToday && !isSelected ? 'ring-1 ring-inset ring-accent' : '',
              ].join(' ')}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Open Monday–Saturday · closed Sundays. Book up to {MAX_ADVANCE_DAYS} days ahead.
      </p>
    </div>
  );
}
