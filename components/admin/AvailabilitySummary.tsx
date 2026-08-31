import type { AvailabilitySummaryItem } from '@/server/calendar/getAvailabilitySummary';

type AvailabilitySummaryProps = {
  date: string;
  items: AvailabilitySummaryItem[];
};

const labels: Record<AvailabilitySummaryItem['type'], string> = {
  cabin: 'Cabins',
  rv: 'RV Sites',
  tent: 'Tent Sites',
};

export function AvailabilitySummary({ date, items }: AvailabilitySummaryProps) {
  const available = items.reduce((total, item) => total + item.available, 0);
  const siteTotal = items.reduce((total, item) => total + item.total, 0);
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));

  return (
    <section className="admin-card p-5" aria-labelledby="availability-heading">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-accent">
        {formattedDate}
      </p>
      <h2 id="availability-heading" className="mt-1 font-serif text-2xl text-forest-900">
        Availability
      </h2>
      <p className="mt-2 text-sm text-admin-muted">
        <strong className="text-forest-900">{available}</strong> of {siteTotal} active sites open
      </p>
      <dl className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.type}>
            <div className="flex items-center justify-between text-sm">
              <dt className="font-semibold text-forest-900">{labels[item.type]}</dt>
              <dd className="text-admin-muted">
                {item.available} / {item.total}
              </dd>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-admin-border">
              <div
                className="h-full rounded-full bg-admin-success"
                style={{
                  width: `${item.total === 0 ? 0 : Math.round((item.available / item.total) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
