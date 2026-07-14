import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Container } from './ui';
import { clinic } from '../config/clinic';

const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <Container className="grid gap-10 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5 font-serif text-lg font-semibold text-foreground">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-fg">
              {clinic.shortName.charAt(0)}
            </span>
            {clinic.name}
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">{clinic.tagline}</p>
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="mb-3 font-semibold text-foreground">Visit us</div>
          <p className="flex items-start gap-2.5 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {clinic.contact.addressLine}
          </p>
          <p className="flex items-center gap-2.5 text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0 text-primary" />
            {clinic.contact.phone}
          </p>
          <p className="flex items-center gap-2.5 text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0 text-primary" />
            {clinic.contact.email}
          </p>
        </div>

        <div className="text-sm">
          <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            Clinic hours
          </div>
          <ul className="space-y-1.5">
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
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} {clinic.name}. All rights reserved.</span>
          <span>
            Have a toothache?{' '}
            <Link to="/book" className="font-medium text-primary hover:underline">
              Book online anytime
            </Link>
          </span>
        </Container>
      </div>
    </footer>
  );
}
