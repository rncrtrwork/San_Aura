import { CalendarDays, Users } from 'lucide-react';
import type { UpcomingArrival } from '@/server/dashboard/getUpcomingArrivals';

type UpcomingArrivalsProps = {
  arrivals: UpcomingArrival[];
};

const siteTypeLabels = {
  cabin: 'Cabin',
  rv: 'RV site',
  tent: 'Tent site',
};

export function UpcomingArrivals({ arrivals }: UpcomingArrivalsProps) {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <section className="admin-card overflow-hidden" aria-labelledby="upcoming-arrivals-heading">
      <div className="flex items-center justify-between gap-4 p-5 pb-4 sm:px-6">
        <div>
          <h2 id="upcoming-arrivals-heading" className="text-base font-bold text-forest-900">
            Upcoming Arrivals
          </h2>
          <p className="mt-1 text-xs text-admin-muted">Next confirmed and pending stays</p>
        </div>
        <CalendarDays aria-hidden="true" className="size-5 text-admin-accent" />
      </div>

      {arrivals.length === 0 ? (
        <div className="border-t border-admin-border px-6 py-10 text-center">
          <p className="text-sm font-semibold text-forest-900">No upcoming arrivals</p>
          <p className="mt-1 text-xs text-admin-muted">New bookings will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border-t border-admin-border">
          <table className="w-full min-w-[580px] text-left text-sm">
            <thead className="bg-cream-alt/70 text-xs uppercase tracking-wide text-admin-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold sm:pl-6">
                  Guest
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Arrival
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Site
                </th>
                <th scope="col" className="px-5 py-3 text-right font-semibold sm:pr-6">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {arrivals.map((arrival) => (
                <tr key={arrival.id} className="transition-colors hover:bg-cream-alt/40">
                  <td className="px-5 py-3.5 sm:pl-6">
                    <p className="font-semibold text-forest-900">{arrival.guestName}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-admin-muted">
                      <Users aria-hidden="true" className="size-3" />
                      {arrival.guestsCount} {arrival.guestsCount === 1 ? 'guest' : 'guests'}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-admin-muted">
                    {dateFormatter.format(new Date(arrival.checkIn))}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-forest-900">{arrival.siteCode}</p>
                    <p className="mt-0.5 text-xs text-admin-muted">
                      {arrival.siteType ? siteTypeLabels[arrival.siteType] : 'Site unavailable'}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-right sm:pr-6">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        arrival.status === 'confirmed'
                          ? 'bg-admin-success/10 text-admin-success'
                          : 'bg-admin-accent/10 text-admin-accent'
                      }`}
                    >
                      {arrival.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
