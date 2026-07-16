import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { CalendarOff, Loader2, Plus, Trash2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { toDateKey } from '../../lib/booking';

const longDate = new Intl.DateTimeFormat('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export function DaysOffPanel() {
  const [dates, setDates] = useState<string[]>([]);
  const [picked, setPicked] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    return onSnapshot(doc(db, 'settings', 'daysOff'), (snap) => {
      const list = ((snap.data()?.dates as string[] | undefined) ?? []).slice().sort();
      setDates(list);
      setLoading(false);
    });
  }, []);

  async function save(next: string[]) {
    if (!db) return;
    setBusy(true);
    try {
      await setDoc(doc(db, 'settings', 'daysOff'), { dates: next });
    } finally {
      setBusy(false);
    }
  }

  function add() {
    if (!picked) return;
    if (dates.includes(picked)) return;
    save([...dates, picked].sort());
    setPicked('');
  }

  const today = toDateKey(new Date());
  const upcoming = dates.filter((d) => d >= today);

  return (
    <div className="max-w-lg">
      <h2 className="font-serif text-xl font-semibold">Days off</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Block dates when the clinic is closed (holidays, seminars, emergencies). Blocked days disappear
        from the patient booking calendar immediately.
      </p>

      <div className="mt-5 flex gap-2">
        <input
          type="date"
          min={today}
          value={picked}
          onChange={(e) => setPicked(e.target.value)}
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={add}
          disabled={!picked || busy}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Block this day
        </button>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : upcoming.length === 0 ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarOff className="h-4 w-4" /> No upcoming days off.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {upcoming.map((d) => {
            const [y, m, day] = d.split('-').map(Number);
            return (
              <li key={d} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5 text-sm">
                <span className="font-medium">{longDate.format(new Date(y, m - 1, day))}</span>
                <button
                  onClick={() => save(dates.filter((x) => x !== d))}
                  disabled={busy}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  aria-label={`Remove ${d} from days off`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
