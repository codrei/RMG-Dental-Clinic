# 🦷 RMG Dental Clinic — Website & Online Booking System

**Live:** <https://rmg-dental-clinic.vercel.app>

A production website and appointment-booking system built for a real dental
clinic in Lipa City, Batangas. Patients book in three steps; the dentist
manages everything from a private, real-time dashboard on his phone.

## ✨ What it does

**For patients**
- Browse services, meet the dentist, get directions (embedded Google Map)
- Book in 3 steps: service → date & time → contact details
- Only genuinely available slots are offered — clinic hours (with lunch
  break), service duration, already-booked times, and blocked days are all
  respected; same-day times need 1 hour of lead time
- PH mobile-number validation (11 digits, `09…`, auto-formatted input)
- Every request is *pending* until the clinic personally confirms it

**For the clinic (`/admin`)**
- Email/password login (Firebase Auth) — staff only
- Live dashboard: new requests appear **without refreshing** (Firestore
  realtime listeners)
- Confirm / decline / cancel; declining automatically frees the slot
- One-tap **prefilled SMS** to the patient after every action — the message
  is pre-written for confirm/decline/cancel and sends from the clinic's own
  number
- Days-off manager: blocked dates vanish from the patient calendar instantly
- Email notification to the clinic inbox on every new booking

## 🏗️ Architecture

```
[React SPA (Vite + Tailwind v4)]  ← Vercel, static + SPA rewrites
   │
   ├─ /book  ──►  [Firestore]  bookings   (private: create-only for public,
   │                                       readable only by clinic login)
   │              [Firestore]  bookedSlots (public {date,time} only — no
   │                                       personal data; doc ID acts as an
   │                                       atomic double-booking lock)
   │              [Firestore]  settings   (days off)
   │
   ├─ /admin ──►  [Firebase Auth] email/password → realtime dashboard
   │
   └─ /api/notify-booking ──► [Vercel serverless] ──► [Resend] ──► clinic inbox
                              (origin allowlist · per-IP + global rate limits)
```

Design decisions worth noting:

1. **Double-booking is structurally impossible.** Each reservation writes a
   lock document whose ID is the slot itself (`2026-07-20_0900`) inside a
   transaction — Firestore rejects a second create with the same ID, so a
   race between two patients has exactly one winner.
2. **Patient privacy by collection design.** The public calendar only ever
   reads `bookedSlots` (date + time, nothing else). Names, phones, and notes
   live in `bookings`, which security rules make unreadable without the
   clinic's login.
3. **No servers to babysit.** Static hosting + Firestore + one tiny
   serverless function. Free tiers throughout, no credit card anywhere, and
   the clinic owns its own Firebase/Google account.
4. **Notifications are decorative, bookings are structural.** The email ping
   is fire-and-forget: if it ever fails, the booking is already saved and
   the live dashboard still shows it.

## 🛠️ Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router ·
Firebase (Firestore + Auth) · Resend · Vercel

## 🚀 Run locally

```bash
npm install
cp .env.example .env.local   # fill in your Firebase web config
npm run dev
```

Firestore security rules live in [`firestore.rules`](firestore.rules) —
publish them from the Firebase console (Firestore → Rules).

## 🔐 Deployment

Push to `main` → Vercel builds the app and the `api/` function.

Environment variables (Vercel): the six `VITE_FIREBASE_*` values from
`.env.example`, plus **`RESEND_API_KEY`** (server-side, for booking
notifications). Add the deployed domain to Firebase Auth → Authorized
domains.

## 👤 Author

**Marco Andrei R. Belen** — Computer Science (Machine Learning) student, NU Lipa

[Portfolio](https://marcobelen.vercel.app) · [GitHub](https://github.com/codrei) · [LinkedIn](https://www.linkedin.com/in/marco-andrei-belen/)
