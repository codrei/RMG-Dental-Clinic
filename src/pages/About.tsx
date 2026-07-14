import { Stethoscope } from 'lucide-react';
import { Container, Button, Eyebrow } from '../components/ui';
import { clinic } from '../config/clinic';

export function About() {
  return (
    <Container className="py-16">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <div className="relative mx-auto w-full max-w-md">
          <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-primary-soft">
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center text-primary/70">
              <Stethoscope className="h-12 w-12" />
              <span className="px-6 text-sm font-medium">Photo of {clinic.dentist.name} goes here</span>
            </div>
          </div>
        </div>

        <div>
          <Eyebrow>Meet your dentist</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
            {clinic.dentist.name}
          </h1>
          <p className="mt-2 text-lg font-medium text-primary">{clinic.dentist.credentials}</p>
          <p className="mt-6 text-muted-foreground">{clinic.dentist.bio}</p>
          <div className="mt-8">
            <Button to="/book">Book with {clinic.dentist.name}</Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
