import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { CalendarMonthGrid } from '@/components/admin/CalendarMonthGrid';
import { requirePagePermission } from '@/server/auth/pageAuthorization';
import { getCalendarMonth, parseCalendarMonth } from '@/server/calendar/getCalendarMonth';

export const dynamic = 'force-dynamic';

type CalendarPageProps = {
  searchParams: Promise<{ month?: string | string[] }>;
};

function shiftMonth(month: string, offset: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  await requirePagePermission('reservations.read');
  const month = parseCalendarMonth((await searchParams).month);
  const reservations = await getCalendarMonth(month);
  const [year, monthNumber] = month.split('-').map(Number);
  const label = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(year, monthNumber - 1, 1),
  );

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
            href={`/admin/calendar?month=${shiftMonth(month, -1)}`}
            aria-label="Previous month"
            className="grid size-10 place-items-center rounded-lg border border-admin-border bg-white text-forest-900"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Link>
          <span className="min-w-40 text-center font-serif text-xl text-forest-900">{label}</span>
          <Link
            href={`/admin/calendar?month=${shiftMonth(month, 1)}`}
            aria-label="Next month"
            className="grid size-10 place-items-center rounded-lg border border-admin-border bg-white text-forest-900"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </header>
      <div className="overflow-x-auto">
        <CalendarMonthGrid month={month} reservations={reservations} />
      </div>
    </div>
  );
}
