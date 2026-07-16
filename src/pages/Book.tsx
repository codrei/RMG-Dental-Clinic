import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CalendarDays, Check, ChevronLeft, Clock, Loader2, Phone, PartyPopper } from 'lucide-react';
import { Container, Button, Eyebrow } from '../components/ui';
import { clinic, type Service } from '../config/clinic';
import { firebaseReady } from '../lib/firebase';
import { formatTime } from '../lib/hours';
import {
  createBooking,
  fetchDaysOff,
  fetchTakenTimes,
  possibleStartTimes,
  toDateKey,
  upcomingOpenDays,
} from '../lib/booking';

type Step = 'service' | 'schedule' | 'details' | 'done';

const dayLabel = new Intl.DateTimeFormat('en-PH', { weekday: 'short' });
const dateLabel = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' });
const longDate = new Intl.DateTimeFormat('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });

export function Book() {
  const [step, setStep] = useState<Step>('service');
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [daysOff, setDaysOff] = useState<Set<string>>(new Set());
  useEffect(() => {
    fetchDaysOff().then(setDaysOff).catch(() => {});
  }, []);
  const days = useMemo(() => upcomingOpenDays(14, daysOff), [daysOff]);

  // Load taken times whenever the selected date changes.
  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoadingSlots(true);
    setTime(null);
    fetchTakenTimes(toDateKey(date))
      .then((t) => {
        if (!cancelled) setTaken(t);
      })
      .catch(() => {
        if (!cancelled) setTaken(new Set());
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  const slots = useMemo(() => {
    if (!date || !service) return [];
    return possibleStartTimes(date, service).map((t) => ({ time: t, taken: taken.has(t) }));
  }, [date, service, taken]);

  async function submit() {
    if (!service || !date || !time) return;
    if (patientName.trim().length < 2) return setError('Please enter your full name.');
    const digits = phone.replace(/[^\d]/g, '');
    if (!/^09\d{9}$/.test(digits))
      return setError('Please enter a valid PH mobile number — 11 digits starting with 09 (e.g. 0917 123 4567).');
    if (!consent) return setError('Please tick the consent box so we can process your booking.');

    setError('');
    setSubmitting(true);
    try {
      await createBooking({
        service,
        dateKey: toDateKey(date),
        time,
        patientName,
        phone,
        email: email || undefined,
        notes: notes || undefined,
      });
      setStep('done');
    } catch (e) {
      if (e instanceof Error && e.message === 'SLOT_TAKEN') {
        setError('Sorry — that time was just taken by another patient. Please pick a different slot.');
        setStep('schedule');
        setTaken((prev) => new Set(prev).add(time));
        setTime(null);
      } else {
        setError('Something went wrong while saving your booking. Please try again, or call the clinic.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Firebase not configured (e.g. fresh clone without .env.local): honest fallback.
  if (!firebaseReady) {
    return (
      <Container className="py-16">
        <Eyebrow>Online booking</Eyebrow>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Book an appointment</h1>
        <div className="mt-12 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-accent-ink/60" />
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Online booking is being set up. In the meantime you can reach the clinic directly.
          </p>
          <div className="mt-6 flex justify-center">
            <Button href={`tel:${clinic.contact.phonePrimary}`} variant="outline">
              <Phone className="h-4 w-4" />
              Call {clinic.contact.phones[0]}
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  if (step === 'done') {
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
            <PartyPopper className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold">Request received!</h1>
          <p className="mt-3 text-muted-foreground">
            {service && date && time && (
              <>
                <span className="font-semibold text-foreground">{service.name}</span> on{' '}
                <span className="font-semibold text-foreground">{longDate.format(date)}</span> at{' '}
                <span className="font-semibold text-foreground">{formatTime(time)}</span>.
              </>
            )}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Your appointment is <span className="font-semibold text-foreground">pending confirmation</span> — the
            clinic will contact you at your number to confirm. If you need to change anything, just call{' '}
            {clinic.contact.phones[0]}.
          </p>
          <div className="mt-8">
            <Button to="/">Back to home</Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-16">
      <Eyebrow>Online booking</Eyebrow>
      <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Book an appointment</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Three quick steps — pick a service, choose a time, tell us who you are.
      </p>

      {/* Step indicator */}
      <ol className="mt-8 flex items-center gap-2 text-xs font-semibold">
        {(['service', 'schedule', 'details'] as Step[]).map((s, i) => {
          const active = step === s;
          const done =
            (s === 'service' && step !== 'service') ||
            (s === 'schedule' && step === 'details');
          return (
            <li
              key={s}
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 ${
                active
                  ? 'bg-primary text-primary-fg'
                  : done
                    ? 'bg-primary-soft text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
              {s === 'service' ? 'Service' : s === 'schedule' ? 'Date & time' : 'Your details'}
            </li>
          );
        })}
      </ol>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STEP 1 — service */}
      {step === 'service' && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {clinic.services.map((s) => (
            <button
              key={s.slug}
              onClick={() => {
                setService(s);
                setStep('schedule');
                setError('');
              }}
              className={`rounded-2xl border p-5 text-left transition-colors hover:border-primary ${
                service?.slug === s.slug ? 'border-primary bg-primary-soft' : 'border-border bg-surface'
              }`}
            >
              <div className="font-serif text-lg font-semibold">{s.name}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-accent-ink" /> about {s.durationMinutes} minutes
              </div>
            </button>
          ))}
        </div>
      )}

      {/* STEP 2 — date & time */}
      {step === 'schedule' && service && (
        <div className="mt-8">
          <button
            onClick={() => setStep('service')}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> {service.name}
          </button>

          <h2 className="mt-5 font-serif text-xl font-semibold">Pick a day</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {days.map((d) => {
              const selected = date && toDateKey(d) === toDateKey(date);
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setDate(d)}
                  className={`flex min-w-[4.5rem] flex-col items-center rounded-xl border px-3 py-2.5 transition-colors ${
                    selected ? 'border-primary bg-primary text-primary-fg' : 'border-border bg-surface hover:border-primary'
                  }`}
                >
                  <span className={`text-xs font-semibold ${selected ? 'text-primary-fg/80' : 'text-muted-foreground'}`}>
                    {dayLabel.format(d)}
                  </span>
                  <span className="mt-0.5 text-sm font-bold">{dateLabel.format(d)}</span>
                </button>
              );
            })}
          </div>

          {date && (
            <>
              <h2 className="mt-7 font-serif text-xl font-semibold">Pick a time</h2>
              {loadingSlots ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking available times…
                </div>
              ) : slots.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No times available that day — try another date.
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      disabled={s.taken}
                      onClick={() => setTime(s.time)}
                      className={`rounded-lg border px-2 py-2.5 text-sm font-semibold transition-colors ${
                        s.taken
                          ? 'cursor-not-allowed border-border bg-muted text-muted-foreground/40 line-through'
                          : time === s.time
                            ? 'border-primary bg-primary text-primary-fg'
                            : 'border-border bg-surface hover:border-primary'
                      }`}
                    >
                      {formatTime(s.time)}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-8">
                <Button
                  onClick={() => {
                    if (time) {
                      setStep('details');
                      setError('');
                    }
                  }}
                  disabled={!time}
                >
                  Continue
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 3 — details */}
      {step === 'details' && service && date && time && (
        <div className="mt-8 max-w-xl">
          <button
            onClick={() => setStep('schedule')}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> {longDate.format(date)}, {formatTime(time)}
          </button>

          <div className="mt-5 space-y-4">
            <Field label="Full name *">
              <input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Juan Dela Cruz"
                maxLength={80}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>
            <Field label="Mobile number *">
              <input
                value={phone}
                onChange={(e) => {
                  // digits only, capped at 11, spaced as 0917 123 4567
                  const digits = e.target.value.replace(/[^\d]/g, '').slice(0, 11);
                  const parts = [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 11)].filter(Boolean);
                  setPhone(parts.join(' '));
                }}
                placeholder="0917 123 4567"
                inputMode="numeric"
                maxLength={13}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>
            <Field label="Email (optional)">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                type="email"
                maxLength={100}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>
            <Field label="Anything the dentist should know? (optional)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="e.g. tooth pain on the lower left since Monday"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>

            <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#26365f]"
              />
              I agree that {clinic.name} uses these details only to manage my appointment.
            </label>

            <Button onClick={submit} disabled={submitting} className="w-full sm:w-auto">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <CalendarDays className="h-4 w-4" /> Request this appointment
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              The clinic confirms every request personally — you&apos;ll get a call or text at the number above.
            </p>
          </div>
        </div>
      )}
    </Container>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}
