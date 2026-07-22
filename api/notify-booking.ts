/**
 * POST /api/notify-booking
 *
 * Alerts the clinic when a new booking request is created — a push
 * notification to every device registered in `fcmTokens` (the clinic
 * manager app's bell) AND an email to the clinic inbox. Fire-and-forget
 * from the booking page — if this fails, the booking itself is unaffected
 * (it already lives in Firestore; the dashboard still shows it live).
 *
 * Env (Vercel):
 *   RESEND_API_KEY           (required for email)
 *   NOTIFY_EMAIL             (optional email override)
 *   FIREBASE_SERVICE_ACCOUNT (required for push — the service-account JSON,
 *                             pasted as one value)
 */

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

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

const ADMIN_URL = 'https://rmg-dental-clinic.vercel.app/admin';

/** Lazily initialised Firebase Admin (needs FIREBASE_SERVICE_ACCOUNT). */
function adminReady(): boolean {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return false;
  try {
    if (getApps().length === 0) initializeApp({ credential: cert(JSON.parse(raw)) });
    return true;
  } catch {
    return false;
  }
}

/**
 * Pushes "new booking" to every device registered via the clinic manager's
 * bell. Data-only payload — the manager's service worker builds the visible
 * notification. Dead tokens are pruned as FCM reports them. Any failure
 * here must never affect the booking or the email.
 */
async function sendPush(title: string, body: string): Promise<void> {
  if (!adminReady()) return;
  try {
    const store = getFirestore();
    const snap = await store.collection('fcmTokens').get();
    const tokens = snap.docs.map((d) => d.id);
    if (tokens.length === 0) return;

    const result = await getMessaging().sendEach(
      tokens.map((token) => ({
        token,
        data: { title, body, link: ADMIN_URL, tag: 'rmg-booking' },
        webpush: { headers: { Urgency: 'high', TTL: '86400' } },
      })),
    );

    await Promise.all(
      result.responses.map((r, i) => {
        const code = r.error?.code ?? '';
        return code.includes('registration-token-not-registered') ||
          code.includes('invalid-argument')
          ? store.collection('fcmTokens').doc(tokens[i]).delete().catch(() => {})
          : Promise.resolve();
      }),
    );
  } catch {
    // Push is best-effort; the email and dashboard still carry the booking.
  }
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

  const fwd = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim() || 'unknown';
  if (!allow(ip)) return res.status(429).json({ error: 'Too many requests' });

  const b = (req.body ?? {}) as Record<string, unknown>;
  const patientName = clean(b.patientName, 200);
  const serviceName = clean(b.serviceName, 80);
  const date = clean(b.date, 10);
  const time = clean(b.time, 5);
  const phone = clean(b.phone, 20);
  const notes = clean(b.notes, 500);
  if (!patientName || !serviceName || !date || !time || !phone) {
    return res.status(422).json({ error: 'Missing fields' });
  }

  // Phone alert first — it's the urgent channel; email is the paper trail.
  await sendPush(
    `New booking: ${patientName}`,
    `${serviceName} — ${date} ${time}. Tap to confirm or decline.`,
  );

  if (!key) return res.status(503).json({ error: 'Email not configured' });

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
