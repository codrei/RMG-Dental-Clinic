/**
 * POST /api/notify-booking
 *
 * Emails the clinic when a new booking request is created. Fire-and-forget
 * from the booking page — if this fails, the booking itself is unaffected
 * (it already lives in Firestore; the dashboard still shows it live).
 *
 * Env (Vercel): RESEND_API_KEY (required), NOTIFY_EMAIL (optional override).
 * Free Resend accounts can only send TO the account owner's address, so the
 * Resend account must be the clinic's (rmgdentalclinic@gmail.com).
 */

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}
interface Res {
  status: (code: number) => Res;
  json: (body: unknown) => void;
  setHeader: (k: string, v: string) => void;
  end: () => void;
}

const ALLOWED_ORIGINS = new Set([
  'https://rmg-dental-clinic.vercel.app',
  'http://localhost:5173',
]);

const CLINIC_EMAIL = 'rmgdentalclinic@gmail.com';

// Best-effort in-memory rate limit (resets on cold start — fine for a
// notification endpoint; the booking data itself is protected elsewhere).
const PER_IP_MAX = 8; // per hour
const GLOBAL_MAX = 80; // per hour
const hits = new Map<string, { n: number; t: number }>();
let globalHits = { n: 0, t: Date.now() };
const HOUR = 3_600_000;

function allow(ip: string): boolean {
  const now = Date.now();
  if (now - globalHits.t > HOUR) globalHits = { n: 0, t: now };
  if (++globalHits.n > GLOBAL_MAX) return false;
  const h = hits.get(ip);
  if (!h || now - h.t > HOUR) {
    hits.set(ip, { n: 1, t: now });
    return true;
  }
  return ++h.n <= PER_IP_MAX;
}

function clean(v: unknown, max: number): string {
  return typeof v === 'string' ? v.replace(/[\r\n<>]/g, ' ').slice(0, max).trim() : '';
}

export default async function handler(req: Req, res: Res) {
  const origin = String(req.headers.origin ?? '');
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!ALLOWED_ORIGINS.has(origin)) return res.status(403).json({ error: 'Forbidden' });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ error: 'Notifications not configured' });

  const fwd = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim() || 'unknown';
  if (!allow(ip)) return res.status(429).json({ error: 'Too many requests' });

  const b = (req.body ?? {}) as Record<string, unknown>;
  const patientName = clean(b.patientName, 80);
  const serviceName = clean(b.serviceName, 80);
  const date = clean(b.date, 10);
  const time = clean(b.time, 5);
  const phone = clean(b.phone, 20);
  const notes = clean(b.notes, 500);
  if (!patientName || !serviceName || !date || !time || !phone) {
    return res.status(422).json({ error: 'Missing fields' });
  }

  const text = [
    `New booking request for RMG Dental Clinic:`,
    ``,
    `Patient:  ${patientName}`,
    `Service:  ${serviceName}`,
    `Date:     ${date}`,
    `Time:     ${time}`,
    `Mobile:   ${phone}`,
    notes ? `Notes:    ${notes}` : null,
    ``,
    `Confirm or decline it in the dashboard:`,
    `https://rmg-dental-clinic.vercel.app/admin`,
  ]
    .filter((l) => l !== null)
    .join('\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'RMG Bookings <onboarding@resend.dev>',
        to: [process.env.NOTIFY_EMAIL || CLINIC_EMAIL],
        subject: `New booking: ${patientName} — ${serviceName}, ${date} ${time}`,
        text,
      }),
    });
    if (!r.ok) return res.status(502).json({ error: 'Email send failed' });
    return res.status(204).end();
  } catch {
    return res.status(502).json({ error: 'Email send failed' });
  }
}
