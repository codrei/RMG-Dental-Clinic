/**
 * ─────────────────────────────────────────────────────────────
 *  RMG DENTAL CLINIC — content (single source of truth)
 *  Edit everything about the clinic here.
 * ─────────────────────────────────────────────────────────────
 */

export interface Service {
  slug: string;
  name: string;
  description: string;
  /** Optional — leave undefined to show "Ask at the clinic". */
  priceLabel?: string;
  durationMinutes: number;
}

/** A block of open time in a day. Days can have more than one (e.g. before/after lunch). */
export interface Session {
  open: string; // "09:00" (24h)
  close: string; // "17:00" (24h)
}

const weekdaySessions: Session[] = [
  { open: '09:00', close: '12:00' },
  { open: '13:00', close: '17:00' },
];

export const clinic = {
  name: 'RMG Dental Clinic',
  shortName: 'RMG',
  tagline: 'Gentle, modern dental care in Lipa City.',

  logo: {
    icon: '/images/logo-icon.png', // tooth mark only
    full: '/images/logo-full.png', // icon + wordmark
  },

  dentist: {
    name: 'Dr. Robert Mitra Garcia',
    credentials: 'D.M.D.',
    license: 'PRC License No. 037970',
    specialties: ['Family Dentistry', 'Orthodontics', 'Oral Surgery'],
    photo: '/images/dentist.webp',
    // TODO: replace with the dentist's own words when available.
    bio:
      'Dr. Robert Mitra Garcia leads RMG Dental Clinic with a calm, ' +
      'patient-first approach — from routine check-ups and cleanings to ' +
      'braces and oral surgery. Every visit is unhurried, gentle, and built ' +
      'around your comfort. (Placeholder bio — to be confirmed with the dentist.)',
  },

  contact: {
    // Primary number used for the "Call" buttons (tel: link form).
    phonePrimary: '+639175116812',
    phones: ['(0917) 511-6812', '(0917) 512-1480'],
    landline: '(043) 781-8940',
    email: 'robmitragarcia@yahoo.com',
    facebook: 'https://www.facebook.com/profile.php?id=100054419234074',
    addressLine:
      'Ground Floor, Manguiat Building, General Luna Street, Pilahan Sabang, Lipa City, 4217, Batangas',
    // Google Maps embed src — from Maps → Share → Embed a map (added in polish step).
    mapEmbedUrl: '',
  },

  // Working hours drive which booking slots are offered.
  hours: {
    monday: weekdaySessions,
    tuesday: weekdaySessions,
    wednesday: weekdaySessions,
    thursday: weekdaySessions,
    friday: weekdaySessions,
    saturday: weekdaySessions,
    sunday: [], // closed
  } as Record<string, Session[]>,

  // Length of each bookable slot, in minutes.
  slotMinutes: 30,

  // TODO: confirm the exact service list + prices with the dentist.
  // These map to the clinic's stated focus (family dentistry, orthodontics, oral surgery).
  services: [
    {
      slug: 'consultation',
      name: 'Consultation & Check-up',
      description: 'Full oral exam, assessment, and a personalised treatment plan.',
      durationMinutes: 30,
    },
    {
      slug: 'cleaning',
      name: 'Cleaning (Oral Prophylaxis)',
      description: 'Professional cleaning and tartar removal for healthy gums.',
      durationMinutes: 45,
    },
    {
      slug: 'filling',
      name: 'Tooth Filling / Restoration',
      description: 'Repair a cavity or a chipped tooth and restore your bite.',
      durationMinutes: 45,
    },
    {
      slug: 'extraction',
      name: 'Tooth Extraction / Oral Surgery',
      description: 'Safe, gentle removal of a damaged or impacted tooth.',
      durationMinutes: 45,
    },
    {
      slug: 'braces',
      name: 'Braces & Orthodontics',
      description: 'Consultation and fitting for braces to straighten your smile.',
      durationMinutes: 30,
    },
    {
      slug: 'whitening',
      name: 'Teeth Whitening',
      description: 'Brighten your smile with professional whitening.',
      durationMinutes: 60,
    },
  ] as Service[],
} as const;

export type Clinic = typeof clinic;
