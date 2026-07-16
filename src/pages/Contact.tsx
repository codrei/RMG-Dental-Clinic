import type { ComponentType, ReactNode } from 'react';
import { MapPin, Phone, Mail, Clock, Globe } from 'lucide-react';
import { Container, Button, Eyebrow } from '../components/ui';
import { clinic } from '../config/clinic';
import { groupedHours } from '../lib/hours';

export function Contact() {
  const hours = groupedHours();

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
            <div className="space-y-0.5">
              {clinic.contact.phones.map((p) => (
                <div key={p}>
                  <a href={`tel:${p.replace(/[^\d+]/g, '')}`} className="hover:text-accent-ink">{p}</a>
                </div>
              ))}
              <div className="text-muted-foreground">Landline: {clinic.contact.landline}</div>
            </div>
          </ContactRow>

          <ContactRow icon={Mail} label="Email">
            <a href={`mailto:${clinic.contact.email}`} className="hover:text-accent-ink">{clinic.contact.email}</a>
          </ContactRow>

          {clinic.contact.facebook && (
            <ContactRow icon={Globe} label="Facebook">
              <a href={clinic.contact.facebook} className="hover:text-accent-ink" target="_blank" rel="noopener noreferrer">
                RMG Dental Clinic
              </a>
            </ContactRow>
          )}

          <div>
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4 text-accent-ink" /> Clinic hours
            </div>
            <ul className="max-w-sm space-y-2 text-sm">
              {hours.map((h) => (
                <li key={h.label} className="flex justify-between gap-4 text-muted-foreground">
                  <span className="font-medium text-foreground">{h.label}</span>
                  <span className="text-right">{h.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button to="/book">Book an appointment</Button>
        </div>

        {/* Map */}
        <div className="flex flex-col gap-3">
          <div className="min-h-[320px] flex-1 overflow-hidden rounded-2xl border border-border bg-muted">
            <iframe
              title="RMG Dental Clinic on Google Maps"
              src={clinic.contact.mapEmbedUrl}
              className="h-full min-h-[320px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={clinic.contact.mapShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent-ink hover:underline"
          >
            <MapPin className="h-4 w-4" /> Open in Google Maps for directions
          </a>
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
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-foreground">{children}</div>
      </div>
    </div>
  );
}
