import { CalendarRange, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { RESERVATION_PAYMENT_STATUSES, RESERVATION_STATUSES } from '@/models/Reservation';
import { requirePagePermission } from '@/server/auth/pageAuthorization';
import { ReservationDetailPanel } from '@/components/admin/ReservationDetailPanel';
import { getReservationDetail } from '@/server/reservations/getReservationDetail';
import {
  getReservations,
  parseReservationFilters,
  type ReservationListFilters,
  type ReservationStatusFilter,
} from '@/server/reservations/getReservations';

export const dynamic = 'force-dynamic';

type ReservationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function statusHref(status: ReservationStatusFilter, filters: ReservationListFilters): string {
  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (filters.stayTypeId) params.set('stayType', filters.stayTypeId);
  if (filters.arrivalDate) params.set('arrivalDate', filters.arrivalDate);
  if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
  if (filters.search) params.set('search', filters.search);
  const query = params.toString();
  return query ? `/admin/reservations?${query}` : '/admin/reservations';
}

function detailHref(reservationId: string, filters: ReservationListFilters): string {
  const href = new URL(statusHref(filters.status, filters), 'http://localhost');
  href.searchParams.set('reservation', reservationId);
  return `${href.pathname}${href.search}`;
}

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
  const resolvedSearchParams = await searchParams;
  const filters = parseReservationFilters(resolvedSearchParams);
  const { reservations, counts, stayTypes } = await getReservations(filters);
  const selectedReservationId =
    typeof resolvedSearchParams.reservation === 'string' ? resolvedSearchParams.reservation : '';
  const selectedReservation = selectedReservationId
    ? await getReservationDetail(selectedReservationId)
    : null;
  const status = filters.status;
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

      <form className="admin-card grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-[minmax(15rem,1fr)_repeat(3,minmax(10rem,0.4fr))_auto_auto]">
        {status !== 'all' ? <input type="hidden" name="status" value={status} /> : null}
        <label className="relative block">
          <span className="sr-only">Search reservations</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted"
          />
          <input
            type="search"
            name="search"
            defaultValue={filters.search}
            placeholder="Guest, member, site, or booking ID"
            className="h-11 w-full rounded-lg border border-admin-border bg-white pl-10 pr-3 text-sm text-forest-900"
          />
        </label>
        <label>
          <span className="sr-only">Stay type</span>
          <select
            name="stayType"
            defaultValue={filters.stayTypeId}
            className="h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          >
            <option value="">All stay types</option>
            {stayTypes.map((stayType) => (
              <option key={stayType.id} value={stayType.id}>
                {stayType.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Arrival date</span>
          <input
            type="date"
            name="arrivalDate"
            defaultValue={filters.arrivalDate}
            className="h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          />
        </label>
        <label>
          <span className="sr-only">Payment status</span>
          <select
            name="paymentStatus"
            defaultValue={filters.paymentStatus}
            className="h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm capitalize text-forest-900"
          >
            <option value="">All payment statuses</option>
            {RESERVATION_PAYMENT_STATUSES.map((paymentStatus) => (
              <option key={paymentStatus} value={paymentStatus}>
                {paymentStatus.replaceAll('-', ' ')}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="h-11 rounded-lg border border-admin-sidebar px-5 text-sm font-bold text-admin-sidebar hover:bg-admin-sidebar hover:text-white"
        >
          Apply
        </button>
        <Link
          href={statusHref(status, {
            status,
            stayTypeId: '',
            arrivalDate: '',
            paymentStatus: '',
            search: '',
          })}
          className="grid h-11 place-items-center px-2 text-sm font-semibold text-admin-muted hover:text-admin-accent"
        >
          Clear
        </Link>
      </form>

      <nav
        aria-label="Reservation status"
        className="flex overflow-x-auto border-b border-admin-border"
      >
        {(['all', ...RESERVATION_STATUSES] as ReservationStatusFilter[]).map((tab) => {
          const active = tab === status;
          return (
            <Link
              key={tab}
              href={statusHref(tab, filters)}
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
                      <Link
                        href={detailHref(reservation.id, filters)}
                        className="font-semibold text-forest-900 hover:text-admin-accent"
                      >
                        {reservation.ownerName}
                      </Link>
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
      {selectedReservation ? (
        <ReservationDetailPanel
          reservation={selectedReservation}
          closeHref={statusHref(status, filters)}
        />
      ) : null}
    </div>
  );
}
