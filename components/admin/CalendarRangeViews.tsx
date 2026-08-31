import Link from 'next/link';
import type { CalendarReservation } from '@/server/calendar/getCalendarMonth';

type CalendarRangeViewProps = {
  startDate: string;
  reservations: CalendarReservation[];
};

const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

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

function reservationStyle(status: CalendarReservation['status']): string {
  if (status === 'checked-in') {
    return 'bg-admin-success/15 text-admin-success';
  }
  if (status === 'pending') {
    return 'bg-admin-accent/15 text-admin-accent';
  }
  return 'bg-admin-sidebar/10 text-admin-sidebar';
}

function buildDays(startDate: string, count: number): Date[] {
  const start = startOfDay(new Date(`${startDate}T00:00:00`));
  return Array.from({ length: count }, (_, index) => addDays(start, index));
}

function reservationsForDay(day: Date, reservations: CalendarReservation[]) {
  const dayEnd = addDays(day, 1);
  return reservations.filter(
    (reservation) => new Date(reservation.checkIn) < dayEnd && new Date(reservation.checkOut) > day,
  );
}

export function CalendarWeekGrid({ startDate, reservations }: CalendarRangeViewProps) {
  const days = buildDays(startDate, 7);
  const today = dateKey(new Date());

  return (
    <section className="admin-card overflow-hidden" aria-label="Reservation calendar week">
      <div className="grid min-w-[840px] grid-cols-7">
        {days.map((day) => {
          const key = dateKey(day);
          const dayReservations = reservationsForDay(day, reservations);
          return (
            <article
              key={key}
              className="min-h-[30rem] border-r border-admin-border bg-admin-surface p-3 last:border-r-0"
            >
              <header className="border-b border-admin-border pb-3 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-admin-muted">
                  {weekdayFormatter.format(day)}
                </p>
                <time
                  dateTime={key}
                  className={`mx-auto mt-1 grid size-9 place-items-center rounded-full font-serif text-lg ${key === today ? 'bg-admin-accent text-white' : 'text-forest-900'}`}
                >
                  {day.getDate()}
                </time>
              </header>
              <div className="mt-3 space-y-2">
                {dayReservations.map((reservation) => (
                  <Link
                    key={reservation.id}
                    href={`/admin/reservations?reservation=${reservation.id}`}
                    className={`block rounded-lg p-2 text-xs font-semibold ${reservationStyle(reservation.status)}`}
                  >
                    <span className="block">{reservation.siteCode}</span>
                    <span className="mt-0.5 block truncate font-normal">
                      {reservation.ownerName}
                    </span>
                  </Link>
                ))}
                {dayReservations.length === 0 ? (
                  <p className="py-6 text-center text-xs text-admin-muted">No stays</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function CalendarTimeline({ startDate, reservations }: CalendarRangeViewProps) {
  const days = buildDays(startDate, 14);
  const rangeStart = days[0];
  const rangeEnd = addDays(days[days.length - 1], 1);
  const siteCodes = Array.from(
    new Set(reservations.map((reservation) => reservation.siteCode)),
  ).sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
  const columns = '10rem repeat(14, minmax(5.5rem, 1fr))';

  return (
    <section className="admin-card overflow-hidden" aria-label="Reservation site timeline">
      <div className="min-w-[94rem]">
        <div
          className="grid border-b border-admin-border bg-cream-alt/70"
          style={{ gridTemplateColumns: columns }}
        >
          <div className="p-3 text-xs font-bold uppercase tracking-wide text-admin-muted">Site</div>
          {days.map((day) => (
            <time
              key={dateKey(day)}
              dateTime={dateKey(day)}
              className="border-l border-admin-border p-3 text-center text-xs font-bold text-forest-900"
            >
              <span className="block uppercase text-admin-muted">
                {weekdayFormatter.format(day)}
              </span>
              {dateFormatter.format(day)}
            </time>
          ))}
        </div>
        {siteCodes.map((siteCode) => (
          <div
            key={siteCode}
            className="grid min-h-16 border-b border-admin-border last:border-b-0"
            style={{ gridTemplateColumns: columns }}
          >
            <div className="z-10 flex items-center bg-admin-surface px-3 text-sm font-bold text-forest-900">
              {siteCode}
            </div>
            {days.map((day, index) => (
              <div
                key={dateKey(day)}
                className="border-l border-admin-border bg-admin-surface"
                style={{ gridColumn: index + 2, gridRow: 1 }}
              />
            ))}
            {reservations
              .filter((reservation) => reservation.siteCode === siteCode)
              .map((reservation) => {
                const checkIn = startOfDay(new Date(reservation.checkIn));
                const checkOut = startOfDay(new Date(reservation.checkOut));
                const clippedStart = checkIn < rangeStart ? rangeStart : checkIn;
                const clippedEnd = checkOut > rangeEnd ? rangeEnd : checkOut;
                const startColumn =
                  Math.round((clippedStart.getTime() - rangeStart.getTime()) / 86_400_000) + 2;
                const endColumn =
                  Math.round((clippedEnd.getTime() - rangeStart.getTime()) / 86_400_000) + 2;
                return (
                  <Link
                    key={reservation.id}
                    href={`/admin/reservations?reservation=${reservation.id}`}
                    className={`z-10 m-2 truncate rounded-md px-2 py-2 text-xs font-semibold ${reservationStyle(reservation.status)}`}
                    style={{
                      gridColumn: `${startColumn} / ${Math.max(startColumn + 1, endColumn)}`,
                      gridRow: 1,
                    }}
                    title={`${reservation.siteCode} · ${reservation.ownerName}`}
                  >
                    {reservation.ownerName}
                  </Link>
                );
              })}
          </div>
        ))}
        {siteCodes.length === 0 ? (
          <p className="p-10 text-center text-sm text-admin-muted">
            No reservations in this range.
          </p>
        ) : null}
      </div>
    </section>
  );
}
