import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Phone,
  ShieldCheck,
  HeartHandshake,
  Clock,
  Stethoscope,
  ArrowRight,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import { Container, Button, Eyebrow } from '../components/ui';
import { Reveal } from '../components/Reveal';
import { clinic } from '../config/clinic';

const trust = [
  { icon: HeartHandshake, title: 'Gentle, unhurried care', body: 'Comfort-first treatment for nervous and first-time patients.' },
  { icon: ShieldCheck, title: 'Clean & modern', body: 'Strict sterilisation and up-to-date equipment.' },
  { icon: Clock, title: 'Book in seconds', body: 'Pick a time online — no phone tag, confirmed by the clinic.' },
];

export function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-soft blur-3xl" aria-hidden="true" />
        <Container className="relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <div className="rise-in">
            <Eyebrow>{clinic.tagline}</Eyebrow>
            <h1 className="mt-5 text-4xl font-semibold sm:text-5xl lg:text-6xl">
              A healthier smile,{' '}
              <span className="text-accent-ink">without the wait.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Book your dental appointment online in under a minute. Choose a
              time that works for you and we&apos;ll confirm it right away.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/book">
                <CalendarDays className="h-4 w-4" />
                Book an appointment
              </Button>
              <Button href={`tel:${clinic.contact.phonePrimary}`} variant="outline">
                <Phone className="h-4 w-4" />
                Call the clinic
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
              <Stethoscope className="h-5 w-5 text-primary" />
              Cared for by <span className="font-semibold text-foreground">{clinic.dentist.name}, {clinic.dentist.credentials}</span>
            </div>
          </div>

          {/* Dentist photo */}
          <div
            className="rise-in relative mx-auto w-full max-w-md"
            style={{ '--rise-delay': '160ms' } as CSSProperties}
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/20" aria-hidden="true" />
            <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-primary-soft shadow-sm">
              <img
                src={clinic.dentist.photo}
                alt={`${clinic.dentist.name}, ${clinic.dentist.credentials}`}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm sm:block">
              <div className="text-lg font-semibold text-primary">{clinic.dentist.credentials}</div>
              <div className="text-xs text-muted-foreground">{clinic.dentist.license}</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-surface">
        <Container className="grid gap-8 py-12 sm:grid-cols-3">
          {trust.map((t, i) => (
            <Reveal key={t.title} delay={i * 110} className="flex gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <t.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
              </div>
            </Reveal>
          ))}
        </Container>
      </section>

      {/* Services preview */}
      <section className="py-20">
        <Container>
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                <Eyebrow>What we do</Eyebrow>
                <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Our dental services</h2>
              </div>
              <Link to="/services" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clinic.services.slice(0, 6).map((s, i) => (
              <Reveal key={s.slug} delay={(i % 3) * 90}>
                <div className="group h-full rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md">
                  <h3 className="font-serif text-lg font-semibold">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                  <Link
                    to="/book"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Book this <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="pb-20">
        <Container>
          <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-center sm:px-16">
            {/* soft sky glow, echoing the logo's swoosh */}
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/25 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold text-white sm:text-4xl">
                Ready to see us? Book your visit today.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sky-200/90">
                Choose a time online and we&apos;ll confirm your appointment. It only takes a minute.
              </p>
              <div className="mt-8 flex justify-center">
                <Button to="/book" variant="inverted">
                  <CalendarDays className="h-4 w-4" />
                  Book an appointment
                </Button>
              </div>
            </div>
          </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
