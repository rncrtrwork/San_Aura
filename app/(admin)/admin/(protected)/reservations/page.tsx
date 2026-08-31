import { CalendarRange, Plus } from 'lucide-react';
import Link from 'next/link';
import { RESERVATION_STATUSES } from '@/models/Reservation';
import { requirePagePermission } from '@/server/auth/pageAuthorization';
import {
  getReservations,
  parseReservationStatus,
  type ReservationStatusFilter,
} from '@/server/reservations/getReservations';

export const dynamic = 'force-dynamic';

type ReservationsPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

const statusLabels: Record<ReservationStatusFilter, string> = {
  all: 'All',
  pending: 'Pending',
  confirmed: 'Confirmed',
  'checked-in': 'Checked In',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default async function ReservationsPage({ searchParams }: ReservationsPageProps) {
  await requirePagePermission('reservations.read');
  const status = parseReservationStatus((await searchParams).status);
  const { reservations, counts } = await getReservations(status);
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            Operations
          </p>
          <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">Reservations</h1>
          <p className="mt-2 text-sm text-admin-muted">
            Track arrivals, stays, payment status, and booking progress.
          </p>
        </div>
        <Link
          href="/admin/reservations/new"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active"
        >
          <Plus aria-hidden="true" className="size-4" />
          New Reservation
        </Link>
      </header>

      <nav
        aria-label="Reservation status"
        className="flex overflow-x-auto border-b border-admin-border"
      >
        {(['all', ...RESERVATION_STATUSES] as ReservationStatusFilter[]).map((tab) => {
          const active = tab === status;
          return (
            <Link
              key={tab}
              href={tab === 'all' ? '/admin/reservations' : `/admin/reservations?status=${tab}`}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-w-max items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
                active
                  ? 'border-admin-accent text-admin-accent'
                  : 'border-transparent text-admin-muted hover:text-forest-900'
              }`}
            >
              {statusLabels[tab]}
              <span className="rounded-full bg-cream-alt px-2 py-0.5 text-xs text-admin-muted">
                {counts[tab]}
              </span>
            </Link>
          );
        })}
      </nav>

      <section className="admin-card overflow-hidden" aria-labelledby="reservation-list-heading">
        <div className="flex items-center justify-between gap-4 border-b border-admin-border px-5 py-4 sm:px-6">
          <h2 id="reservation-list-heading" className="font-bold text-forest-900">
            {statusLabels[status]} Reservations
          </h2>
          <span className="text-sm text-admin-muted">Showing {reservations.length}</span>
        </div>
        {reservations.length === 0 ? (
          <div className="grid justify-items-center px-6 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-cream-alt text-admin-accent">
              <CalendarRange aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-4 font-semibold text-forest-900">No reservations in this status</p>
            <p className="mt-1 text-sm text-admin-muted">Bookings will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-cream-alt/70 text-xs uppercase tracking-wide text-admin-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold sm:pl-6">
                    Guest / Member
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Stay
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Dates
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Payment
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold sm:pr-6">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="transition-colors hover:bg-cream-alt/40">
                    <td className="px-5 py-4 sm:pl-6">
                      <p className="font-semibold text-forest-900">{reservation.ownerName}</p>
                      <p className="mt-0.5 text-xs text-admin-muted">
                        {reservation.ownerType} · {reservation.guestsCount} guests
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-forest-900">{reservation.siteCode}</p>
                      <p className="mt-0.5 text-xs text-admin-muted">{reservation.stayTypeName}</p>
                    </td>
                    <td className="px-4 py-4 text-admin-muted">
                      {new Date(reservation.checkIn).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' – '}
                      {new Date(reservation.checkOut).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-forest-900">
                        {currency.format(reservation.totalAmount)}
                      </p>
                      <p className="mt-0.5 text-xs capitalize text-admin-muted">
                        {reservation.paymentStatus.replaceAll('-', ' ')}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right sm:pr-6">
                      <span className="inline-flex rounded-full bg-cream-alt px-2.5 py-1 text-xs font-semibold capitalize text-forest-900">
                        {statusLabels[reservation.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
