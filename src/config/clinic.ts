/**
 * ─────────────────────────────────────────────────────────────
 *  CLINIC CONTENT — single source of truth
 *  Edit everything about the clinic here. Marked TODO = waiting
 *  on real info from the dentist. Nothing here is invented as if
 *  it were real; placeholders read as obvious placeholders.
 * ─────────────────────────────────────────────────────────────
 */

export interface Service {
  slug: string;
  name: string;
  description: string;
  /** Optional. Leave undefined to show "Ask at the clinic". */
  priceLabel?: string;
  durationMinutes: number;
}

export interface DayHours {
  /** null = closed that day */
  open: string | null; // "09:00"
  close: string | null; // "17:00"
}

export const clinic = {
  // TODO: real clinic name from Marco
  name: 'The Clinic Name',
  shortName: 'Clinic',
  tagline: 'Gentle, modern dental care for the whole family.',

  dentist: {
    // TODO: real name + credential extensions (e.g. "DMD")
    name: 'Dr. Full Name',
    credentials: 'DMD', // TODO: confirm exact extensions
    // Photo of the dentist standing in a white coat — drop the file in /public/images
    photo: '/images/dentist.jpg',
    // TODO: ask dentist if they have a bio; placeholder for now
    bio:
      'A short, warm introduction to the dentist goes here — years of ' +
      'experience, approach to patient care, and what makes the practice ' +
      'feel welcoming. (Placeholder — replace with the dentist’s own words.)',
  },

  contact: {
    // TODO: real details from Marco
    phone: '+63 900 000 0000',
    email: 'hello@clinic.example',
    facebook: '', // optional FB page URL
    addressLine: '123 Placeholder St., City, Batangas',
    // Google Maps "embed" src — get from Maps → Share → Embed a map
    mapEmbedUrl: '',
  },

  // Working hours drive which booking slots are offered.
  hours: {
    monday: { open: '09:00', close: '17:00' },
    tuesday: { open: '09:00', close: '17:00' },
    wednesday: { open: '09:00', close: '17:00' },
    thursday: { open: '09:00', close: '17:00' },
    friday: { open: '09:00', close: '17:00' },
    saturday: { open: '09:00', close: '13:00' },
    sunday: { open: null, close: null },
  } as Record<string, DayHours>,

  // Length of each bookable slot, in minutes.
  slotMinutes: 30,

  // TODO: confirm the real service list + prices with the dentist.
  // These are common dental services as sensible placeholders.
  services: [
    {
      slug: 'consultation',
      name: 'Consultation & Check-up',
      description: 'Full oral exam, assessment, and a treatment plan.',
      durationMinutes: 30,
    },
    {
      slug: 'cleaning',
      name: 'Cleaning (Oral Prophylaxis)',
      description: 'Professional cleaning and tartar removal.',
      durationMinutes: 45,
    },
    {
      slug: 'filling',
      name: 'Tooth Filling / Restoration',
      description: 'Repair a cavity or a chipped tooth.',
      durationMinutes: 45,
    },
    {
      slug: 'extraction',
      name: 'Tooth Extraction',
      description: 'Safe, gentle removal of a damaged tooth.',
      durationMinutes: 45,
    },
    {
      slug: 'whitening',
      name: 'Teeth Whitening',
      description: 'Brighten your smile with professional whitening.',
      durationMinutes: 60,
    },
    {
      slug: 'braces',
      name: 'Braces / Orthodontics Consult',
      description: 'Assessment for braces or aligners.',
      durationMinutes: 30,
    },
  ] as Service[],
} as const;

export type Clinic = typeof clinic;
