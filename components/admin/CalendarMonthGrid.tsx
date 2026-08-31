import Link from 'next/link';
import type { CalendarReservation } from '@/server/calendar/getCalendarMonth';

type CalendarMonthGridProps = {
  month: string;
  reservations: CalendarReservation[];
};

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function dateKey(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function CalendarMonthGrid({ month, reservations }: CalendarMonthGridProps) {
  const [year, monthNumber] = month.split('-').map(Number);
  const monthStart = new Date(year, monthNumber - 1, 1);
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  const today = dateKey(new Date());

  return (
    <section className="admin-card overflow-hidden" aria-label="Reservation calendar month">
      <div className="grid grid-cols-7 border-b border-admin-border bg-cream-alt/70">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wide text-admin-muted"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid min-w-[760px] grid-cols-7">
        {days.map((day) => {
          const dayStart = startOfDay(day);
          const dayEnd = addDays(dayStart, 1);
          const key = dateKey(day);
          const dayReservations = reservations.filter((reservation) => {
            const checkIn = new Date(reservation.checkIn);
            const checkOut = new Date(reservation.checkOut);
            return checkIn < dayEnd && checkOut > dayStart;
          });
          const arrivals = reservations.filter(
            (reservation) => dateKey(new Date(reservation.checkIn)) === key,
          ).length;
          const departures = reservations.filter(
            (reservation) => dateKey(new Date(reservation.checkOut)) === key,
          ).length;
          const inMonth = day.getMonth() === monthNumber - 1;
          return (
            <article
              key={key}
              className={`min-h-32 border-b border-r border-admin-border p-2 ${inMonth ? 'bg-admin-surface' : 'bg-admin-canvas text-admin-muted'}`}
            >
              <div className="flex items-center justify-between">
                <time
                  dateTime={key}
                  className={`grid size-7 place-items-center rounded-full text-xs font-bold ${key === today ? 'bg-admin-accent text-white' : ''}`}
                >
                  {day.getDate()}
                </time>
                {dayReservations.length > 0 ? (
                  <span className="text-[10px] font-semibold text-admin-muted">
                    {dayReservations.length} stays
                  </span>
                ) : null}
              </div>
              <details className="mt-2 rounded-md border border-admin-border bg-white/80 text-xs">
                <summary className="cursor-pointer list-none px-2 py-1.5 font-semibold text-admin-muted hover:text-forest-900">
                  Day details
                </summary>
                <div className="grid grid-cols-3 gap-1 border-t border-admin-border px-2 py-2 text-center">
                  <div>
                    <strong className="block text-sm text-forest-900">{arrivals}</strong>
                    <span className="text-[10px] text-admin-muted">Arrivals</span>
                  </div>
                  <div>
                    <strong className="block text-sm text-forest-900">{departures}</strong>
                    <span className="text-[10px] text-admin-muted">Departures</span>
                  </div>
                  <div>
                    <strong className="block text-sm text-forest-900">
                      {dayReservations.length}
                    </strong>
                    <span className="text-[10px] text-admin-muted">Occupied</span>
                  </div>
                  <Link
                    href={`/admin/calendar?view=week&month=${month}&date=${key}`}
                    className="col-span-3 mt-1 rounded bg-admin-sidebar px-2 py-1.5 font-semibold text-white"
                  >
                    View Day
                  </Link>
                </div>
              </details>
              <div className="mt-2 space-y-1">
                {dayReservations.slice(0, 3).map((reservation) => (
                  <Link
                    key={reservation.id}
                    href={`/admin/reservations?reservation=${reservation.id}`}
                    title={`${reservation.ownerName} · ${reservation.siteCode}`}
                    className={`block truncate rounded px-2 py-1 text-[11px] font-semibold ${
                      reservation.status === 'checked-in'
                        ? 'bg-admin-success/15 text-admin-success'
                        : reservation.status === 'pending'
                          ? 'bg-admin-accent/15 text-admin-accent'
                          : 'bg-admin-sidebar/10 text-admin-sidebar'
                    }`}
                  >
                    {reservation.siteCode} · {reservation.ownerName}
                  </Link>
                ))}
                {dayReservations.length > 3 ? (
                  <p className="px-1 text-[10px] font-semibold text-admin-muted">
                    +{dayReservations.length - 3} more
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
