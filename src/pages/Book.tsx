import { CalendarDays, Phone } from 'lucide-react';
import { Container, Button, Eyebrow } from '../components/ui';
import { clinic } from '../config/clinic';

/**
 * Part 3 will replace this with the real booking flow:
 * service → available time slots (from Firestore + clinic hours) →
 * patient details → saved as a "pending" appointment.
 */
export function Book() {
  return (
    <Container className="py-16">
      <Eyebrow>Online booking</Eyebrow>
      <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Book an appointment</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Pick a service and a time that suits you. We&apos;ll confirm your booking
        shortly after.
      </p>

      <div className="mt-12 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
        <CalendarDays className="mx-auto h-10 w-10 text-primary/60" />
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          The online booking flow is being set up. In the meantime you can reach
          the clinic directly.
        </p>
        <div className="mt-6 flex justify-center">
          <Button href={`tel:${clinic.contact.phone}`} variant="outline">
            <Phone className="h-4 w-4" />
            Call {clinic.contact.phone}
          </Button>
        </div>
      </div>
    </Container>
  );
}
