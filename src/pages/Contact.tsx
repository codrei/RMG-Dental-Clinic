import type { ComponentType, ReactNode } from 'react';
import { MapPin, Phone, Mail, Clock, Globe } from 'lucide-react';
import { Container, Button, Eyebrow } from '../components/ui';
import { clinic } from '../config/clinic';

const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function Contact() {
  return (
    <Container className="py-16">
      <Eyebrow>Get in touch</Eyebrow>
      <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Visit the clinic</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Drop by, give us a call, or book online — whatever&apos;s easiest for you.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <ContactRow icon={MapPin} label="Address">{clinic.contact.addressLine}</ContactRow>
          <ContactRow icon={Phone} label="Phone">
            <a href={`tel:${clinic.contact.phone}`} className="hover:text-primary">{clinic.contact.phone}</a>
          </ContactRow>
          <ContactRow icon={Mail} label="Email">
            <a href={`mailto:${clinic.contact.email}`} className="hover:text-primary">{clinic.contact.email}</a>
          </ContactRow>
          {clinic.contact.facebook && (
            <ContactRow icon={Globe} label="Facebook">
              <a href={clinic.contact.facebook} className="hover:text-primary" target="_blank" rel="noopener noreferrer">Visit our page</a>
            </ContactRow>
          )}

          <div>
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4 text-primary" /> Clinic hours
            </div>
            <ul className="max-w-xs space-y-1.5 text-sm">
              {dayOrder.map((d) => {
                const h = clinic.hours[d];
                return (
                  <li key={d} className="flex justify-between text-muted-foreground">
                    <span className="capitalize">{d}</span>
                    <span className="tabular-nums">{h.open ? `${h.open} – ${h.close}` : 'Closed'}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <Button to="/book">Book an appointment</Button>
        </div>

        {/* Map */}
        <div className="min-h-[320px] overflow-hidden rounded-2xl border border-border bg-muted">
          {clinic.contact.mapEmbedUrl ? (
            <iframe
              title="Clinic location"
              src={clinic.contact.mapEmbedUrl}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <MapPin className="h-10 w-10 text-primary/50" />
              <span className="px-6 text-sm">Google Map of the clinic goes here</span>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-foreground">{children}</div>
      </div>
    </div>
  );
}
