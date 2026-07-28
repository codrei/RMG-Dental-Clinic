import { Link } from 'react-router-dom';
import { CalendarDays, Phone, ArrowRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Container, Button, Eyebrow } from '../components/ui';
import { Reveal } from '../components/Reveal';
import { clinic } from '../config/clinic';
import { groupedHours } from '../lib/hours';

export function Home() {
  const hours = groupedHours();

  return (
    <>
      {/* Hero */}
      <section>
        <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <div className="rise-in">
            <Eyebrow>{clinic.tagline}</Eyebrow>
            <h1 className="mt-5 text-4xl font-semibold sm:text-5xl lg:text-6xl">
              RMG Dental Clinic
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Family dentistry, orthodontics, and oral surgery with{' '}
              {clinic.dentist.name}. Book your appointment online — we&apos;ll
              confirm it by call or text.
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
          </div>

          {/* Dentist photo */}
          <div
            className="rise-in mx-auto w-full max-w-md"
            style={{ '--rise-delay': '160ms' } as CSSProperties}
          >
            <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-primary-soft">
              <img
                src={clinic.dentist.photo}
                alt={`${clinic.dentist.name}, ${clinic.dentist.credentials}`}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {clinic.dentist.name}, {clinic.dentist.credentials}
              </span>{' '}
              · {clinic.dentist.license}
            </p>
          </div>
        </Container>
      </section>

      {/* The practical details a patient actually needs */}
      <section className="border-y border-border bg-surface">
        <Container className="grid gap-8 py-10 sm:grid-cols-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Clinic hours
            </div>
            <p className="mt-1.5 font-medium">{hours[0]?.label}</p>
            <p className="text-sm text-muted-foreground">{hours[0]?.text}</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Where we are
            </div>
            <p className="mt-1.5 font-medium">Manguiat Building, General Luna St.</p>
            <p className="text-sm text-muted-foreground">Pilahan Sabang, Lipa City</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Phone
            </div>
            {clinic.contact.phones.map((p) => (
              <p key={p} className="mt-1.5 font-medium">
                <a href={`tel:${p.replace(/[^\d+]/g, '')}`} className="hover:text-accent-ink">
                  {p}
                </a>
              </p>
            ))}
            <p className="text-sm text-muted-foreground">
              Landline {clinic.contact.landline}
            </p>
          </div>
        </Container>
      </section>

      {/* Services preview */}
      <section className="py-20">
        <Container>
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                <Eyebrow>What we do</Eyebrow>
                <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Dental services</h2>
              </div>
              <Link
                to="/services"
                className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clinic.services.slice(0, 6).map((s, i) => (
              <Reveal key={s.slug} delay={(i % 3) * 90}>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary">
                  <h3 className="font-serif text-lg font-semibold">{s.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.description}</p>
                  <Link
                    to="/book"
                    className="mt-4 inline-flex items-center gap-1 self-start text-sm font-semibold text-primary hover:underline"
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
            <div className="rounded-2xl bg-primary px-8 py-14 text-center sm:px-16">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold text-white sm:text-4xl">
                Book your visit
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sky-200/90">
                Choose a time online and the clinic will confirm your
                appointment personally.
              </p>
              <div className="mt-8 flex justify-center">
                <Button to="/book" variant="inverted">
                  <CalendarDays className="h-4 w-4" />
                  Book an appointment
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
