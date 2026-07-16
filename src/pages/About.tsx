import type { CSSProperties } from 'react';
import { BadgeCheck } from 'lucide-react';
import { Container, Button, Eyebrow } from '../components/ui';
import { clinic } from '../config/clinic';

export function About() {
  return (
    <Container className="py-16">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <div className="rise-in relative mx-auto w-full max-w-md">
          <div className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-accent/20" aria-hidden="true" />
          <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-primary-soft shadow-sm">
            <img
              src={clinic.dentist.photo}
              alt={`${clinic.dentist.name}, ${clinic.dentist.credentials}`}
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>

        <div className="rise-in" style={{ '--rise-delay': '160ms' } as CSSProperties}>
          <Eyebrow>Meet your dentist</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{clinic.dentist.name}</h1>
          <p className="mt-2 text-lg font-medium text-accent-ink">{clinic.dentist.credentials}</p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary">
            <BadgeCheck className="h-4 w-4" />
            {clinic.dentist.license}
          </div>

          <p className="mt-6 text-muted-foreground">{clinic.dentist.bio}</p>

          <div className="mt-6">
            <div className="text-sm font-semibold text-foreground">Areas of focus</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {clinic.dentist.specialties.map((s) => (
                <span key={s} className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <Button to="/book">Book with {clinic.dentist.name}</Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
