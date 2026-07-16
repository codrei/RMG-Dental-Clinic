import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { CalendarDays, CalendarOff, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { auth, firebaseReady } from '../../lib/firebase';
import { clinic } from '../../config/clinic';
import { Login } from './Login';
import { BookingsPanel } from './BookingsPanel';
import { DaysOffPanel } from './DaysOffPanel';

type Tab = 'bookings' | 'daysoff';

export function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('bookings');

  useEffect(() => {
    if (!auth) {
      setChecking(false);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
  }, []);

  if (!firebaseReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-accent-ink" />
          <p className="mt-4 text-sm text-muted-foreground">The admin area isn&apos;t configured yet.</p>
          <Link to="/" className="mt-4 inline-block text-sm font-semibold text-accent-ink hover:underline">
            ← Back to website
          </Link>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <img src={clinic.logo.icon} alt="" className="h-8 w-auto logo-blend" />
            <div className="leading-tight">
              <div className="font-serif font-semibold">{clinic.name}</div>
              <div className="text-xs text-muted-foreground">Appointments dashboard</div>
            </div>
          </div>
          <button
            onClick={() => auth && signOut(auth)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <nav className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-5xl gap-1 px-5">
          <TabButton active={tab === 'bookings'} onClick={() => setTab('bookings')}>
            <CalendarDays className="h-4 w-4" /> Bookings
          </TabButton>
          <TabButton active={tab === 'daysoff'} onClick={() => setTab('daysoff')}>
            <CalendarOff className="h-4 w-4" /> Days off
          </TabButton>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-5xl px-5 py-8">
        {tab === 'bookings' ? <BookingsPanel /> : <DaysOffPanel />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
        active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}
