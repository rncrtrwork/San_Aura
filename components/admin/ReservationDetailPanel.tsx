import { CalendarDays, CircleDollarSign, MapPin, StickyNote, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ReservationDetail } from '@/server/reservations/getReservationDetail';

type ReservationDetailPanelProps = {
  reservation: ReservationDetail;
  closeHref: string;
};

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof UserRound;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-admin-border px-5 py-5 sm:px-6">
      <h3 className="flex items-center gap-2 text-sm font-bold text-forest-900">
        <Icon aria-hidden="true" className="size-4 text-admin-accent" />
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function ReservationDetailPanel({ reservation, closeHref }: ReservationDetailPanelProps) {
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const balance = Math.max(0, reservation.totalAmount - reservation.paidAmount);
  const dates = `${new Date(reservation.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(reservation.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  return (
    <div className="fixed inset-0 z-[70] bg-black/30" role="presentation">
      <Link href={closeHref} aria-label="Close reservation details" className="absolute inset-0" />
      <aside
        aria-label={`Reservation for ${reservation.ownerName}`}
        className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto bg-admin-surface shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-admin-border bg-admin-surface px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-accent">
              Reservation {reservation.id.slice(-6).toUpperCase()}
            </p>
            <h2 className="mt-1 font-serif text-3xl text-forest-900">{reservation.ownerName}</h2>
            <p className="mt-1 text-sm capitalize text-admin-muted">
              {reservation.status.replaceAll('-', ' ')}
            </p>
          </div>
          <Link
            href={closeHref}
            aria-label="Close"
            className="grid size-10 place-items-center rounded-lg text-admin-muted hover:bg-cream-alt hover:text-forest-900"
          >
            <X aria-hidden="true" className="size-5" />
          </Link>
        </header>
        <Section title="Booking Summary" icon={UserRound}>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-admin-muted">Guest type</dt>
              <dd className="mt-1 font-semibold text-forest-900">{reservation.ownerType}</dd>
            </div>
            <div>
              <dt className="text-xs text-admin-muted">Party size</dt>
              <dd className="mt-1 font-semibold text-forest-900">
                {reservation.guestsCount} guests
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-admin-muted">Contact</dt>
              <dd className="mt-1 font-semibold text-forest-900">
                {reservation.ownerEmail || reservation.ownerPhone || 'Not provided'}
              </dd>
            </div>
          </dl>
        </Section>
        <Section title="Stay Details" icon={CalendarDays}>
          <p className="font-semibold text-forest-900">{dates}</p>
          <div className="mt-3 flex gap-3 rounded-lg bg-cream-alt p-3">
            <MapPin aria-hidden="true" className="size-4 shrink-0 text-admin-accent" />
            <div>
              <p className="text-sm font-bold text-forest-900">
                {reservation.siteCode} · {reservation.stayTypeName}
              </p>
              <p className="mt-0.5 text-xs text-admin-muted">
                {reservation.siteArea} ·{' '}
                {reservation.siteAmenities.join(', ') || 'No amenities listed'}
              </p>
            </div>
          </div>
        </Section>
        <Section title="Payment Summary" icon={CircleDollarSign}>
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-xs text-admin-muted">Total</dt>
              <dd className="mt-1 font-bold text-forest-900">
                {currency.format(reservation.totalAmount)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-admin-muted">Paid</dt>
              <dd className="mt-1 font-bold text-admin-success">
                {currency.format(reservation.paidAmount)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-admin-muted">Balance</dt>
              <dd className="mt-1 font-bold text-admin-danger">{currency.format(balance)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs capitalize text-admin-muted">
            {reservation.paymentStatus.replaceAll('-', ' ')} · Source: {reservation.source}
          </p>
        </Section>
        <Section title="Internal Notes" icon={StickyNote}>
          <p className="whitespace-pre-wrap rounded-lg bg-cream-alt p-4 text-sm leading-6 text-forest-900">
            {reservation.internalNotes || 'No internal notes.'}
          </p>
        </Section>
      </aside>
    </div>
  );
}
