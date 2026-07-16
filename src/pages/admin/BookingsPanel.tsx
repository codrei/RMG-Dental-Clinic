import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Check, Loader2, Phone, StickyNote, X } from 'lucide-react';
import { db } from '../../lib/firebase';
import { toDateKey } from '../../lib/booking';
import { formatTime } from '../../lib/hours';
import type { Booking } from '../../types';

const longDate = new Intl.DateTimeFormat('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });

function slotIdOf(b: Booking): string {
  return `${b.date}_${b.time.replace(':', '')}`;
}

export function BookingsPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Live feed of today-and-future bookings; updates by itself when a
  // patient books — no refresh needed.
  useEffect(() => {
    if (!db) return;
    const today = toDateKey(new Date());
    const q = query(collection(db, 'bookings'), where('date', '>=', today), orderBy('date'));
    return onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, 'id'>) }));
      rows.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      setBookings(rows);
      setLoading(false);
    });
  }, []);

  const pending = useMemo(() => bookings.filter((b) => b.status === 'pending'), [bookings]);
  const confirmed = useMemo(() => bookings.filter((b) => b.status === 'confirmed'), [bookings]);

  async function confirm(b: Booking) {
    if (!db || !b.id) return;
    setBusyId(b.id);
    try {
      await updateDoc(doc(db, 'bookings', b.id), { status: 'confirmed' });
    } finally {
      setBusyId(null);
    }
  }

  /** Decline/cancel: mark the booking and free its slot so others can book it. */
  async function decline(b: Booking, to: 'declined' | 'cancelled') {
    if (!db || !b.id) return;
    if (!window.confirm(`${to === 'declined' ? 'Decline' : 'Cancel'} ${b.patientName}'s ${b.serviceName} on ${b.date} ${formatTime(b.time)}? The slot becomes bookable again.`)) return;
    setBusyId(b.id);
    try {
      await updateDoc(doc(db, 'bookings', b.id), { status: to });
      await deleteDoc(doc(db, 'bookedSlots', slotIdOf(b)));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading bookings…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-serif text-xl font-semibold">
          Requests waiting for you{' '}
          {pending.length > 0 && (
            <span className="ml-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-sm font-bold text-accent-ink">
              {pending.length}
            </span>
          )}
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No pending requests — you&apos;re all caught up.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {pending.map((b) => (
              <BookingCard key={b.id} b={b} busy={busyId === b.id}>
                <button
                  onClick={() => confirm(b)}
                  disabled={busyId === b.id}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-50"
                >
                  <Check className="h-4 w-4" /> Confirm
                </button>
                <button
                  onClick={() => decline(b, 'declined')}
                  disabled={busyId === b.id}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                >
                  <X className="h-4 w-4" /> Decline
                </button>
              </BookingCard>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold">Upcoming confirmed</h2>
        {confirmed.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing confirmed yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {confirmed.map((b) => (
              <BookingCard key={b.id} b={b} busy={busyId === b.id}>
                <button
                  onClick={() => decline(b, 'cancelled')}
                  disabled={busyId === b.id}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
              </BookingCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BookingCard({ b, busy, children }: { b: Booking; busy: boolean; children: ReactNode }) {
  const [y, m, d] = b.date.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-semibold">{b.patientName}</div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            {b.serviceName} · <span className="font-medium text-foreground">{longDate.format(dateObj)}</span> at{' '}
            <span className="font-medium text-foreground">{formatTime(b.time)}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1.5 font-medium text-accent-ink hover:underline">
              <Phone className="h-3.5 w-3.5" /> {b.phone}
            </a>
            {b.email && <span>{b.email}</span>}
          </div>
          {b.notes && (
            <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-ink" /> {b.notes}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">{busy ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : children}</div>
      </div>
    </div>
  );
}
