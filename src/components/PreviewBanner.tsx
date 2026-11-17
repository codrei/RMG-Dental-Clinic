import { clinic } from '../config/clinic';

// Shown on every page while the clinic hasn't launched online booking, so no
// patient mistakes this site for the real booking page.
export function PreviewBanner() {
  if (!clinic.previewMode) return null;
  const phone = clinic.contact.phones[0];
  return (
    <div role="note" className="border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm text-amber-950">
      Preview: bookings aren&apos;t sent to the clinic yet. To book an appointment, call{' '}
      <a href={`tel:${phone.replace(/\D/g, '')}`} className="font-semibold underline">
        {phone}
      </a>
      .
    </div>
  );
}
