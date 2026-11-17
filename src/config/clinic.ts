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
  // The clinic hasn't launched online booking yet. While this is true the site
  // shows a preview banner and booking requests are not saved or sent anywhere.
  previewMode: true,
  tagline: 'General Luna Street, Lipa City',

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
    // Facts only — everything here is verifiable (PRC registry, the clinic's
    // own listing). Swap in Dr. Garcia's own words whenever he provides them;
    // never invent claims about the practice on his behalf.
    bio:
      'Dr. Robert Mitra Garcia is a licensed dentist (PRC No. 037970) ' +
      'practising at RMG Dental Clinic on General Luna Street, Lipa City. ' +
      'His work covers family dentistry, orthodontics, and oral surgery — ' +
      'from check-ups and cleanings to braces and extractions.',
  },

  contact: {
    // Primary number used for the "Call" buttons (tel: link form).
    phonePrimary: '+639175116812',
    phones: ['(0917) 511-6812', '(0917) 512-1480'],
    landline: '(043) 781-8940',
    emails: ['robmitragarcia@yahoo.com', 'robgarcia228@gmail.com'],
    facebook: 'https://www.facebook.com/profile.php?id=100054419234074',
    addressLine:
      'Ground Floor, Manguiat Building, General Luna Street, Pilahan Sabang, Lipa City, 4217, Batangas',
    // Keyless Google Maps embed centered on the clinic's own listing
    // (place: "RMG Dental Clinic", General Luna St, Lipa City).
    mapEmbedUrl:
      'https://www.google.com/maps?q=RMG+Dental+Clinic,+General+Luna+Street,+Lipa+City,+Batangas&ll=13.9527807,121.1658816&z=17&output=embed',
    // Link for "open in Google Maps" (the clinic's listing)
    mapShareUrl: 'https://maps.app.goo.gl/jzwapQPmx2ryFL6z6',
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

  // TODO: confirm the exact service list, durations, and prices with the dentist.
  // Descriptions state plainly what each procedure IS — no marketing claims
  // about the practice that can't be verified.
  services: [
    {
      slug: 'consultation',
      name: 'Consultation & Check-up',
      description: 'Oral examination and assessment, with a treatment plan if you need one.',
      durationMinutes: 30,
    },
    {
      slug: 'cleaning',
      name: 'Cleaning (Oral Prophylaxis)',
      description: 'Removal of plaque and tartar build-up.',
      durationMinutes: 45,
    },
    {
      slug: 'filling',
      name: 'Tooth Filling / Restoration',
      description: 'Repair for a cavity or a chipped tooth.',
      durationMinutes: 45,
    },
    {
      slug: 'extraction',
      name: 'Tooth Extraction / Oral Surgery',
      description: 'Removal of a damaged, loose, or impacted tooth.',
      durationMinutes: 45,
    },
    {
      slug: 'braces',
      name: 'Braces & Orthodontics',
      description: 'Assessment and fitting for orthodontic treatment.',
      durationMinutes: 30,
    },
    {
      slug: 'whitening',
      name: 'Teeth Whitening',
      description: 'In-clinic whitening treatment.',
      durationMinutes: 60,
    },
  ] as Service[],
} as const;

export type Clinic = typeof clinic;
