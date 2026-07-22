import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { clinic, type Service } from '../config/clinic';
import type { Booking } from '../types';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

/** "2026-07-20" in the device's local calendar. */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function toHHMM(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/** The next `count` days on which the clinic is open at all. */
export function upcomingOpenDays(count: number, daysOff: Set<string> = new Set()): Date[] {
  const days: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  let scanned = 0;
  while (days.length < count && scanned < count * 4) {
    const sessions = clinic.hours[DAY_KEYS[cursor.getDay()]] ?? [];
    if (sessions.length > 0 && !daysOff.has(toDateKey(cursor))) days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
    scanned++;
  }
  return days;
}

/** Dates the clinic has marked closed (settings/daysOff → { dates: string[] }). */
export async function fetchDaysOff(): Promise<Set<string>> {
  if (!db) return new Set();
  try {
    const snap = await getDoc(doc(db, 'settings', 'daysOff'));
    const dates = (snap.data()?.dates as string[] | undefined) ?? [];
    return new Set(dates);
  } catch {
    return new Set();
  }
}

/**
 * Every start time the clinic's sessions allow for a service on a date —
 * before subtracting already-booked slots. The service must fit fully
 * inside one session (so a 60-min whitening can't start at 11:45).
 */
export function possibleStartTimes(date: Date, service: Service): string[] {
  const sessions = clinic.hours[DAY_KEYS[date.getDay()]] ?? [];
  const step = clinic.slotMinutes;
  const times: string[] = [];

  // For "today", hide times less than 1 hour from now — the clinic
  // needs breathing room to confirm.
  const now = new Date();
  const isToday = toDateKey(date) === toDateKey(now);
  const earliestToday = now.getHours() * 60 + now.getMinutes() + 60;

  for (const s of sessions) {
    const open = minutesOf(s.open);
    const close = minutesOf(s.close);
    for (let t = open; t + service.durationMinutes <= close; t += step) {
      if (isToday && t < earliestToday) continue;
      times.push(toHHMM(t));
    }
  }
  return times;
}

/** Times already taken on a date (from the public, no-personal-data collection). */
export async function fetchTakenTimes(dateKey: string): Promise<Set<string>> {
  if (!db) return new Set();
  const snap = await getDocs(query(collection(db, 'bookedSlots'), where('date', '==', dateKey)));
  return new Set(snap.docs.map((d) => (d.data().time as string) ?? ''));
}

export interface NewBookingInput {
  service: Service;
  dateKey: string;
  time: string;
  patientName: string;
  phone: string;
  email?: string;
  notes?: string;
  // Intake details — flow into the clinic's patient record on first visit.
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthdate?: string;
  sex?: 'male' | 'female';
  occupation?: string;
  address?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  allergies?: string;
  conditions?: string;
  medications?: string;
}

/**
 * Creates the booking atomically:
 *  - the slot lock (`bookedSlots/${date}_${time}`) is created first inside
 *    a transaction; if someone grabbed it a second earlier, the whole
 *    thing fails cleanly and the caller can offer another time,
 *  - the private booking record is written in the same transaction.
 */
export async function createBooking(input: NewBookingInput): Promise<string> {
  if (!db) throw new Error('Booking is not available right now.');
  const database = db;

  const slotId = `${input.dateKey}_${input.time.replace(':', '')}`;
  const slotRef = doc(database, 'bookedSlots', slotId);
  const bookingRef = doc(collection(database, 'bookings'));

  await runTransaction(database, async (tx) => {
    const existing = await tx.get(slotRef);
    if (existing.exists()) {
      throw new Error('SLOT_TAKEN');
    }
    tx.set(slotRef, { date: input.dateKey, time: input.time });

    const booking: Omit<Booking, 'id' | 'createdAt'> & { createdAt: unknown } = {
      serviceSlug: input.service.slug,
      serviceName: input.service.name,
      durationMinutes: input.service.durationMinutes,
      date: input.dateKey,
      time: input.time,
      patientName: input.patientName.trim(),
      phone: input.phone.trim(),
      status: 'pending',
      createdAt: serverTimestamp(),
    };
    // Optional fields are only written when filled, keeping documents tidy.
    const extras: (keyof NewBookingInput)[] = [
      'email',
      'notes',
      'firstName',
      'lastName',
      'middleName',
      'birthdate',
      'sex',
      'occupation',
      'address',
      'emergencyName',
      'emergencyPhone',
      'allergies',
      'conditions',
      'medications',
    ];
    for (const key of extras) {
      const value = typeof input[key] === 'string' ? (input[key] as string).trim() : undefined;
      if (value) (booking as Record<string, unknown>)[key] = value;
    }

    tx.set(bookingRef, booking);
  });

  return bookingRef.id;
}
