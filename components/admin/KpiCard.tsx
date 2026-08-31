import { ArrowDown, ArrowUp, Minus, type LucideIcon } from 'lucide-react';

type KpiCardProps = {
  label: string;
  value: string;
  comparison: string;
  delta: number;
  icon: LucideIcon;
};

export function KpiCard({ label, value, comparison, delta, icon: Icon }: KpiCardProps) {
  const TrendIcon = delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : Minus;
  const trendColor =
    delta > 0 ? 'text-admin-success' : delta < 0 ? 'text-admin-danger' : 'text-admin-muted';

  return (
    <article className="admin-card flex min-h-32 items-center gap-5 p-5">
      <span className="grid size-14 shrink-0 place-items-center rounded-full border border-admin-border text-admin-sidebar">
        <Icon aria-hidden="true" className="size-7" strokeWidth={1.6} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-admin-muted">{label}</p>
        <p className="mt-1 font-serif text-4xl leading-none text-forest-900">{value}</p>
        <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon aria-hidden="true" className="size-3.5" />
          {comparison}
        </p>
      </div>
    </article>
  );
}
