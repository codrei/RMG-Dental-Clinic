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
import { Check, Loader2, MessageSquareText, Phone, StickyNote, X } from 'lucide-react';
import { db } from '../../lib/firebase';
import { toDateKey } from '../../lib/booking';
import { formatTime } from '../../lib/hours';
import { clinic } from '../../config/clinic';
import type { Booking } from '../../types';

const longDate = new Intl.DateTimeFormat('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });

function slotIdOf(b: Booking): string {
  return `${b.date}_${b.time.replace(':', '')}`;
}

type ActionKind = 'confirmed' | 'declined' | 'cancelled';

function prettyDate(b: Booking): string {
  const [y, m, d] = b.date.split('-').map(Number);
  return longDate.format(new Date(y, m - 1, d));
}

/** Prefilled SMS the doctor can send with one tap after acting on a booking. */
function smsHref(b: Booking, kind: ActionKind): string {
  const first = b.patientName.trim().split(/\s+/)[0];
  const when = `${prettyDate(b)} at ${formatTime(b.time)}`;
  let body: string;
  if (kind === 'confirmed') {
    body = `Hi ${first}! This is ${clinic.name}. Your ${b.serviceName} appointment on ${when} is CONFIRMED. See you at the clinic! If you need to reschedule, call us at ${clinic.contact.phones[0]}.`;
  } else if (kind === 'declined') {
    body = `Hi ${first}! This is ${clinic.name}. Sorry, we can't accommodate your ${b.serviceName} request for ${when}. Please pick another time at ${window.location.origin}/book or call us at ${clinic.contact.phones[0]}. Thank you po!`;
  } else {
    body = `Hi ${first}! This is ${clinic.name}. We're sorry, but we need to cancel your ${b.serviceName} appointment on ${when}. Please rebook at ${window.location.origin}/book or call us at ${clinic.contact.phones[0]}. Apologies po!`;
  }
  return `sms:${b.phone.replace(/[^\d+]/g, '')}?body=${encodeURIComponent(body)}`;
}

export function BookingsPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<{ b: Booking; kind: ActionKind } | null>(null);

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
      setLastAction({ b, kind: 'confirmed' });
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
      setLastAction({ b, kind: to });
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
      {lastAction && (
        <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary-soft p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <span className="font-semibold">
              {lastAction.kind === 'confirmed' ? 'Confirmed' : lastAction.kind === 'declined' ? 'Declined' : 'Cancelled'}
            </span>{' '}
            {lastAction.b.patientName}&apos;s {lastAction.b.serviceName} on {prettyDate(lastAction.b)} at{' '}
            {formatTime(lastAction.b.time)}. Let them know:
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={smsHref(lastAction.b, lastAction.kind)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
            >
              <MessageSquareText className="h-4 w-4" /> Text {lastAction.b.patientName.split(/\s+/)[0]}
            </a>
            <button
              onClick={() => setLastAction(null)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-surface"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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
                <a
                  href={smsHref(b, 'confirmed')}
                  className="flex items-center gap-1.5 rounded-lg border border-primary/30 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-soft"
                >
                  <MessageSquareText className="h-4 w-4" /> Text
                </a>
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
