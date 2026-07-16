import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Container } from './ui';
import { clinic } from '../config/clinic';
import { groupedHours } from '../lib/hours';

export function Footer() {
  const hours = groupedHours();

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <Container className="grid gap-10 py-14 md:grid-cols-3">
        <div>
          <img src={clinic.logo.full} alt={clinic.name} className="h-16 w-auto logo-blend" />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">{clinic.tagline}</p>
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="mb-3 font-semibold text-foreground">Visit us</div>
          <p className="flex items-start gap-2.5 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" />
            {clinic.contact.addressLine}
          </p>
          <p className="flex items-center gap-2.5 text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0 text-accent-ink" />
            <span>{clinic.contact.phones.join(' · ')}</span>
          </p>
          <p className="flex items-center gap-2.5 text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0 text-accent-ink" />
            {clinic.contact.emails[0]}
          </p>
        </div>

        <div className="text-sm">
          <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
            <Clock className="h-4 w-4 text-accent-ink" />
            Clinic hours
          </div>
          <ul className="space-y-2">
            {hours.map((h) => (
              <li key={h.label} className="text-muted-foreground">
                <span className="font-medium text-foreground">{h.label}</span>
                <br />
                {h.text}
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} {clinic.name}. All rights reserved.</span>
          <span>
            Have a toothache?{' '}
            <Link to="/book" className="font-medium text-accent-ink hover:underline">
              Book online anytime
            </Link>
          </span>
        </Container>
      </div>
    </footer>
  );
}
