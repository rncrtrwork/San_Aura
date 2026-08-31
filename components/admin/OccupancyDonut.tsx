import type { AvailabilitySummaryItem } from '@/server/calendar/getAvailabilitySummary';

type OccupancyDonutProps = {
  items: AvailabilitySummaryItem[];
};

export function OccupancyDonut({ items }: OccupancyDonutProps) {
  const occupied = items.reduce((total, item) => total + item.occupied, 0);
  const siteTotal = items.reduce((total, item) => total + item.total, 0);
  const percent = siteTotal === 0 ? 0 : Math.round((occupied / siteTotal) * 100);

  return (
    <figure className="admin-card p-5" aria-labelledby="occupancy-donut-heading">
      <figcaption>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-accent">
          Selected date
        </p>
        <h2 id="occupancy-donut-heading" className="mt-1 font-serif text-2xl text-forest-900">
          Occupancy
        </h2>
      </figcaption>
      <div className="relative mx-auto mt-5 size-44">
        <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            strokeWidth="10"
            className="stroke-admin-border"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${percent} ${100 - percent}`}
            className="stroke-admin-accent"
          />
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <strong className="font-serif text-4xl text-forest-900">{percent}%</strong>
          <span className="text-xs font-semibold text-admin-muted">occupied</span>
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-admin-muted">
        <strong className="text-forest-900">{occupied}</strong> of {siteTotal} active sites
      </p>
    </figure>
  );
}
