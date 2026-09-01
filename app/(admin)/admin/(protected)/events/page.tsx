import { CalendarRange, ImageIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import {
  type EventListFilters,
  type EventListItem,
  type EventStatusFilter,
} from '@/lib/eventFilters';
import { EVENT_STATUSES } from '@/models/Event';
import { requirePagePermission } from '@/server/auth/pageAuthorization';
import { getEvents, parseEventFilters } from '@/server/events/getEvents';

export const dynamic = 'force-dynamic';

type EventsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const statusLabels: Record<EventStatusFilter, string> = {
  all: 'All',
  draft: 'Drafts',
  scheduled: 'Scheduled',
  published: 'Published',
  past: 'Past',
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});

function eventsHref(status: EventStatusFilter, filters: EventListFilters): string {
  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  const query = params.toString();
  return query ? `/admin/events?${query}` : '/admin/events';
}

function eventTimeRange(event: EventListItem): string {
  const startsAt = new Date(event.startsAt);
  const endsAt = new Date(event.endsAt);
  return `${dateFormatter.format(startsAt)} · ${timeFormatter.format(startsAt)}-${timeFormatter.format(endsAt)}`;
}

function registrationLabel(event: EventListItem): string {
  if (!event.registrationRequired) return 'No registration';
  if (event.capacity === null) return `${event.registrationsCount} registered`;
  return `${event.registrationsCount} registered · ${event.capacity} spots left`;
}

function registrationPercent(event: EventListItem): number {
  if (!event.registrationRequired || event.capacity === null) return 0;
  const totalCapacity = event.registrationsCount + event.capacity;
  return totalCapacity === 0
    ? 100
    : Math.min(100, Math.round((event.registrationsCount / totalCapacity) * 100));
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  await requirePagePermission('events.read');
  const filters = parseEventFilters(await searchParams);
  const { events, counts } = await getEvents(filters);
  const statusTabs: EventStatusFilter[] = ['all', ...EVENT_STATUSES];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            Programming
          </p>
          <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">Events</h1>
          <p className="mt-2 text-sm text-admin-muted">
            Manage resort gatherings, registrations, publishing status, and guest reminders.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active"
        >
          <Plus aria-hidden="true" className="size-4" />
          Create Event
        </Link>
      </header>

      <form className="admin-card grid gap-4 p-4 md:grid-cols-[repeat(2,minmax(12rem,1fr))_auto_auto]">
        {filters.status !== 'all' ? (
          <input type="hidden" name="status" value={filters.status} />
        ) : null}
        <label>
          <span className="sr-only">Start date</span>
          <input
            type="date"
            name="startDate"
            defaultValue={filters.startDate}
            className="h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          />
        </label>
        <label>
          <span className="sr-only">End date</span>
          <input
            type="date"
            name="endDate"
            defaultValue={filters.endDate}
            className="h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          />
        </label>
        <button
          type="submit"
          className="h-11 rounded-lg border border-admin-sidebar px-5 text-sm font-bold text-admin-sidebar hover:bg-admin-sidebar hover:text-white"
        >
          Apply
        </button>
        <Link
          href={eventsHref(filters.status, { status: filters.status, startDate: '', endDate: '' })}
          className="grid h-11 place-items-center px-2 text-sm font-semibold text-admin-muted hover:text-admin-accent"
        >
          Clear
        </Link>
      </form>

      <nav aria-label="Event status" className="flex overflow-x-auto border-b border-admin-border">
        {statusTabs.map((tab) => {
          const active = tab === filters.status;
          return (
            <Link
              key={tab}
              href={eventsHref(tab, filters)}
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

      <section className="admin-card overflow-hidden" aria-labelledby="event-list-heading">
        <div className="flex items-center justify-between gap-4 border-b border-admin-border px-5 py-4 sm:px-6">
          <h2 id="event-list-heading" className="font-bold text-forest-900">
            {statusLabels[filters.status]} Events
          </h2>
          <span className="text-sm text-admin-muted">Showing {events.length}</span>
        </div>
        {events.length === 0 ? (
          <div className="grid justify-items-center px-6 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-cream-alt text-admin-accent">
              <CalendarRange aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-4 font-semibold text-forest-900">No events match these filters</p>
            <p className="mt-1 text-sm text-admin-muted">
              Adjust the date range or create a new event.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-admin-border">
            {events.map((event) => {
              const progress = registrationPercent(event);
              return (
                <article
                  key={event.id}
                  className="grid gap-4 px-5 py-5 transition-colors hover:bg-cream-alt/40 md:grid-cols-[9rem_minmax(0,1fr)_16rem] sm:px-6"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-lg bg-cream-alt">
                    {event.imageUrl ? (
                      <div
                        aria-hidden="true"
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url("${event.imageUrl}")` }}
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-admin-muted">
                        <ImageIcon aria-hidden="true" className="size-8" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="font-serif text-2xl text-forest-900 hover:text-admin-accent"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-2 text-sm font-semibold text-admin-muted">
                      {eventTimeRange(event)}
                    </p>
                    <p className="mt-1 text-sm text-admin-muted">{event.location}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-cream-alt px-2.5 py-1 text-xs font-bold capitalize text-forest-900">
                        {statusLabels[event.status]}
                      </span>
                      {event.featureOnHomepage ? (
                        <span className="rounded-full bg-admin-accent/10 px-2.5 py-1 text-xs font-bold text-admin-accent">
                          Featured
                        </span>
                      ) : null}
                      {event.sendReminder ? (
                        <span className="rounded-full bg-admin-success/10 px-2.5 py-1 text-xs font-bold text-admin-success">
                          Reminder
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-forest-900">{registrationLabel(event)}</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-alt">
                      <div className="h-full bg-admin-accent" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-admin-muted">
                      {event.capacity === null ? 'Unlimited capacity' : 'Remaining capacity'}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
