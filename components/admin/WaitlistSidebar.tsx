import Link from 'next/link';
import type { CalendarWaitlistItem } from '@/server/calendar/getWaitlistOverview';

type WaitlistSidebarProps = {
  items: CalendarWaitlistItem[];
  baseQuery: string;
};

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

export function WaitlistSidebar({ items, baseQuery }: WaitlistSidebarProps) {
  return (
    <section className="admin-card p-5" aria-labelledby="waitlist-heading">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-accent">Requests</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <h2 id="waitlist-heading" className="font-serif text-2xl text-forest-900">
          Waitlist
        </h2>
        <span className="rounded-full bg-admin-accent/15 px-2 py-1 text-xs font-bold text-admin-accent">
          {items.length}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg border border-admin-border p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-forest-900">{item.contactName}</h3>
                <p className="mt-0.5 text-xs text-admin-muted">
                  {item.stayTypeName} · {item.siteCount} site{item.siteCount === 1 ? '' : 's'}
                </p>
              </div>
              <span className="rounded-full bg-admin-sidebar/10 px-2 py-1 text-[10px] font-bold capitalize text-admin-sidebar">
                {item.status}
              </span>
            </div>
            <p className="mt-2 text-xs font-semibold text-forest-900">
              {dateFormatter.format(new Date(item.requestedCheckIn))} –{' '}
              {dateFormatter.format(new Date(item.requestedCheckOut))}
            </p>
            <Link
              href={`/admin/calendar?${baseQuery}&waitlist=${item.id}`}
              className="mt-3 block rounded-md border border-admin-sidebar px-3 py-2 text-center text-xs font-bold text-admin-sidebar hover:bg-admin-sidebar hover:text-white"
            >
              Review
            </Link>
          </article>
        ))}
        {items.length === 0 ? (
          <p className="rounded-lg bg-admin-canvas p-4 text-center text-sm text-admin-muted">
            No active waitlist requests.
          </p>
        ) : null}
      </div>
      {items.length > 0 ? (
        <Link
          href={`/admin/calendar?${baseQuery}&waitlist=${items[0].id}`}
          className="mt-4 block rounded-lg bg-admin-sidebar px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-admin-sidebar-active"
        >
          Review Waitlist
        </Link>
      ) : null}
    </section>
  );
}
