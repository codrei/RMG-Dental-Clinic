import { clinic, type Session } from '../config/clinic';

export const dayOrder = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "09:00" -> "9:00 AM" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

/** "9:00 AM – 12:00 PM, 1:00 PM – 5:00 PM" (or "Closed") */
export function formatSessions(sessions: Session[]): string {
  if (!sessions || sessions.length === 0) return 'Closed';
  return sessions.map((s) => `${formatTime(s.open)} – ${formatTime(s.close)}`).join(', ');
}

function sessionsEqual(a: Session[], b: Session[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((s, i) => s.open === b[i].open && s.close === b[i].close);
}

/** Groups consecutive days with identical hours, e.g. "Monday – Saturday". */
export function groupedHours(): { label: string; text: string }[] {
  const groups: { days: string[]; sessions: Session[] }[] = [];
  for (const d of dayOrder) {
    const s = clinic.hours[d] ?? [];
    const last = groups[groups.length - 1];
    if (last && sessionsEqual(last.sessions, s)) last.days.push(d);
    else groups.push({ days: [d], sessions: s });
  }
  return groups.map((g) => ({
    label: g.days.length === 1 ? cap(g.days[0]) : `${cap(g.days[0])} – ${cap(g.days[g.days.length - 1])}`,
    text: formatSessions(g.sessions),
  }));
}
