import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { clinic } from '../../config/clinic';

/**
 * Part 4 will replace this with:
 *  - Firebase Auth login (dentist only)
 *  - Appointment list with confirm / decline
 *  - Working-hours & days-off management
 */
export function Admin() {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-serif text-2xl font-semibold">Clinic admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Secure dashboard for {clinic.name}. Login and appointment management
          are coming in the next step.
        </p>
        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
          ← Back to website
        </Link>
      </div>
    </div>
  );
}
