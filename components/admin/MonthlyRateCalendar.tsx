import Link from 'next/link';
import { stayTypeLabels, type AdminStayType } from '@/lib/stayTypes';

type MonthlyRateCalendarProps = {
  stayTypes: AdminStayType[];
  month: string | null;
};

type CalendarMonth = {
  year: number;
  monthIndex: number;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  timeZone: 'UTC',
});

function currentCalendarMonth(): CalendarMonth {
  const now = new Date();
  return { year: now.getUTCFullYear(), monthIndex: now.getUTCMonth() };
}

function parseCalendarMonth(value: string | null): CalendarMonth {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return currentCalendarMonth();
  const [yearPart, monthPart] = value.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return currentCalendarMonth();
  }
  return { year, monthIndex: month - 1 };
}

function monthKey(month: CalendarMonth): string {
  return `${month.year}-${String(month.monthIndex + 1).padStart(2, '0')}`;
}

function addMonths(month: CalendarMonth, offset: number): CalendarMonth {
  const date = new Date(Date.UTC(month.year, month.monthIndex + offset, 1));
  return { year: date.getUTCFullYear(), monthIndex: date.getUTCMonth() };
}

function daysForMonth(month: CalendarMonth): Date[] {
  const dayCount = new Date(Date.UTC(month.year, month.monthIndex + 1, 0)).getUTCDate();
  return Array.from(
    { length: dayCount },
    (_, index) => new Date(Date.UTC(month.year, month.monthIndex, index + 1)),
  );
}

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 5 || day === 6;
}

function displayRate(stayType: AdminStayType, weekend: boolean): string {
  return currencyFormatter.format(weekend ? stayType.weekendRate : stayType.baseRate);
}

export function MonthlyRateCalendar({ stayTypes, month }: MonthlyRateCalendarProps) {
  const calendarMonth = parseCalendarMonth(month);
  const days = daysForMonth(calendarMonth);
  const previousMonth = monthKey(addMonths(calendarMonth, -1));
  const nextMonth = monthKey(addMonths(calendarMonth, 1));
  const title = monthFormatter.format(
    new Date(Date.UTC(calendarMonth.year, calendarMonth.monthIndex, 1)),
  );

  return (
    <section className="mt-6 rounded-lg border border-admin-border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-admin-accent">
            Monthly calendar
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">{title}</h3>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/stays?tab=rate-plans&month=${previousMonth}`}
            className="inline-flex h-10 items-center rounded-lg border border-admin-border px-3 text-sm font-bold text-admin-muted hover:text-forest-900"
          >
            Previous
          </Link>
          <Link
            href={`/admin/stays?tab=rate-plans&month=${nextMonth}`}
            className="inline-flex h-10 items-center rounded-lg border border-admin-border px-3 text-sm font-bold text-admin-muted hover:text-forest-900"
          >
            Next
          </Link>
        </div>
      </div>
      {stayTypes.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-admin-border p-6 text-sm text-admin-muted">
          Create a stay type before publishing monthly rates.
        </p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {days.map((date) => {
            const weekend = isWeekend(date);
            return (
              <article
                key={date.toISOString()}
                className={`min-h-36 rounded-lg border p-3 ${
                  weekend
                    ? 'border-admin-accent/40 bg-admin-accent/10'
                    : 'border-admin-border bg-admin-bg'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-admin-muted">
                      {dayFormatter.format(date)}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-forest-900">{date.getUTCDate()}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
                      weekend ? 'bg-admin-accent text-white' : 'bg-white text-admin-muted'
                    }`}
                  >
                    {weekend ? 'Weekend' : 'Weekday'}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5">
                  {stayTypes.map((stayType) => (
                    <div
                      key={stayType.id}
                      className="flex items-center justify-between gap-3 rounded-md bg-white px-2.5 py-1.5 text-xs"
                    >
                      <span className="truncate font-semibold text-admin-muted">
                        {stayTypeLabels[stayType.siteType]}
                      </span>
                      <span className="font-bold text-forest-900">
                        {displayRate(stayType, weekend)}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
