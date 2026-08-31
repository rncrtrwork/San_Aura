import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { AvailabilitySummary } from '@/components/admin/AvailabilitySummary';
import { BlockDatesAction } from '@/components/admin/BlockDatesAction';
import { CalendarMonthGrid } from '@/components/admin/CalendarMonthGrid';
import { CalendarTimeline, CalendarWeekGrid } from '@/components/admin/CalendarRangeViews';
import { OccupancyDonut } from '@/components/admin/OccupancyDonut';
import { WaitlistReviewPanel } from '@/components/admin/WaitlistReviewPanel';
import { WaitlistSidebar } from '@/components/admin/WaitlistSidebar';
import { requirePagePermission } from '@/server/auth/pageAuthorization';
import { getAvailabilitySummary } from '@/server/calendar/getAvailabilitySummary';
import { getBlockDateOptions } from '@/server/calendar/getBlockDateOptions';
import {
  getCalendarMonth,
  getCalendarRange,
  parseCalendarMonth,
} from '@/server/calendar/getCalendarMonth';
import { getWaitlistOverview } from '@/server/calendar/getWaitlistOverview';

export const dynamic = 'force-dynamic';

type CalendarPageProps = {
  searchParams: Promise<{
    month?: string | string[];
    view?: string | string[];
    date?: string | string[];
    waitlist?: string | string[];
  }>;
};

type CalendarView = 'month' | 'week' | 'timeline';

function shiftMonth(month: string, offset: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function dateKey(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function parseView(value: string | string[] | undefined): CalendarView {
  return value === 'week' || value === 'timeline' ? value : 'month';
}

function parseDate(value: string | string[] | undefined, fallback: string): string {
  const candidate = typeof value === 'string' ? value : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    return fallback;
  }
  const date = new Date(`${candidate}T00:00:00`);
  return Number.isNaN(date.getTime()) || dateKey(date) !== candidate ? fallback : candidate;
}

function shiftDate(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00`);
  result.setDate(result.getDate() + days);
  return dateKey(result);
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  await requirePagePermission('reservations.read');
  const params = await searchParams;
  const month = parseCalendarMonth(params.month);
  const view = parseView(params.view);
  const date = parseDate(params.date, `${month}-01`);
  const rangeLength = view === 'week' ? 7 : 14;
  const rangeStart = new Date(`${date}T00:00:00`);
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeEnd.getDate() + rangeLength);
  const selectedWaitlist = typeof params.waitlist === 'string' ? params.waitlist : undefined;
  const [reservations, availability, waitlist, blockDateSites] = await Promise.all([
    view === 'month' ? getCalendarMonth(month) : getCalendarRange(rangeStart, rangeEnd),
    getAvailabilitySummary(rangeStart),
    getWaitlistOverview(selectedWaitlist),
    getBlockDateOptions(),
  ]);
  const [year, monthNumber] = month.split('-').map(Number);
  const label =
    view === 'month'
      ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
          new Date(year, monthNumber - 1, 1),
        )
      : `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(rangeStart)} – ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(rangeEnd.getTime() - 86_400_000))}`;
  const previousHref =
    view === 'month'
      ? `/admin/calendar?month=${shiftMonth(month, -1)}`
      : `/admin/calendar?view=${view}&month=${month}&date=${shiftDate(date, -rangeLength)}`;
  const nextHref =
    view === 'month'
      ? `/admin/calendar?month=${shiftMonth(month, 1)}`
      : `/admin/calendar?view=${view}&month=${month}&date=${shiftDate(date, rangeLength)}`;
  const calendarQuery = new URLSearchParams({ month });
  if (view !== 'month') {
    calendarQuery.set('view', view);
    calendarQuery.set('date', date);
  }
  const calendarHref = `/admin/calendar?${calendarQuery.toString()}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            Operations
          </p>
          <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">Calendar</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={previousHref}
            aria-label={`Previous ${view === 'month' ? 'month' : 'range'}`}
            className="grid size-10 place-items-center rounded-lg border border-admin-border bg-white text-forest-900"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Link>
          <span className="min-w-40 text-center font-serif text-xl text-forest-900">{label}</span>
          <Link
            href={nextHref}
            aria-label={`Next ${view === 'month' ? 'month' : 'range'}`}
            className="grid size-10 place-items-center rounded-lg border border-admin-border bg-white text-forest-900"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          className="inline-flex rounded-lg border border-admin-border bg-white p-1"
          aria-label="Calendar views"
        >
          {(['month', 'week', 'timeline'] as const).map((option) => (
            <Link
              key={option}
              href={
                option === 'month'
                  ? `/admin/calendar?month=${month}`
                  : `/admin/calendar?view=${option}&month=${month}&date=${date}`
              }
              aria-current={view === option ? 'page' : undefined}
              className={`rounded-md px-4 py-2 text-sm font-semibold capitalize ${
                view === option
                  ? 'bg-admin-sidebar text-white'
                  : 'text-admin-muted hover:text-forest-900'
              }`}
            >
              {option}
            </Link>
          ))}
        </nav>
        <BlockDatesAction sites={blockDateSites} defaultDate={date} />
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="overflow-x-auto">
          {view === 'month' ? (
            <CalendarMonthGrid month={month} reservations={reservations} />
          ) : view === 'week' ? (
            <CalendarWeekGrid startDate={date} reservations={reservations} />
          ) : (
            <CalendarTimeline startDate={date} reservations={reservations} />
          )}
        </div>
        <aside className="space-y-6">
          <AvailabilitySummary date={date} items={availability} />
          <OccupancyDonut items={availability} />
          <WaitlistSidebar items={waitlist.items} baseQuery={calendarQuery.toString()} />
        </aside>
      </div>
      {waitlist.selected ? (
        <WaitlistReviewPanel entry={waitlist.selected} closeHref={calendarHref} />
      ) : null}
    </div>
  );
}
