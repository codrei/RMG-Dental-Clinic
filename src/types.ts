import type { Timestamp } from 'firebase/firestore';

export type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled';

/**
 * A booking request. Lives in the private `bookings` collection —
 * only the signed-in clinic account can read these (see firestore.rules).
 */
export interface Booking {
  id?: string;
  serviceSlug: string;
  serviceName: string;
  durationMinutes: number;
  /** "2026-07-20" (local clinic date) */
  date: string;
  /** "09:00" (24h clinic time) */
  time: string;
  patientName: string;
  phone: string;
  email?: string;
  notes?: string;
  status: BookingStatus;
  createdAt?: Timestamp;
}

/**
 * A held time slot. Lives in the public `bookedSlots` collection and
 * contains NO personal data — just enough for the calendar to grey out
 * taken times. Its document ID is `${date}_${time}` which makes it a
 * natural lock: Firestore refuses a second create with the same ID,
 * so two patients can never take the same slot.
 */
export interface BookedSlot {
  date: string;
  time: string;
}
