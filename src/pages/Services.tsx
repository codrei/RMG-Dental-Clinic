import { Clock, ArrowRight } from 'lucide-react';
import { Container, Button, Eyebrow } from '../components/ui';
import { Reveal } from '../components/Reveal';
import { clinic } from '../config/clinic';

export function Services() {
  return (
    <Container className="py-16">
      <div className="rise-in">
        <Eyebrow>What we do</Eyebrow>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Dental services</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          From routine check-ups to whitening and orthodontics — here&apos;s how we
          can help. Pricing is discussed at your visit.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {clinic.services.map((s, i) => (
          <Reveal key={s.slug} delay={(i % 2) * 100} className="h-full">
            <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md">
              <h2 className="font-serif text-xl font-semibold">{s.name}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  {s.durationMinutes} min
                </span>
                <Button to="/book" variant="outline" className="px-4 py-2">
                  Book <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}
