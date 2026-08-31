import type { SiteStatus } from '@/models/Site';
import type { ResortMapSite } from '@/server/sites/getResortMapSites';

type SiteSummaryProps = {
  sites: ResortMapSite[];
};

const statusDetails: Record<SiteStatus, { label: string; style: string }> = {
  available: { label: 'Available', style: 'text-admin-success bg-admin-success/10' },
  occupied: { label: 'Occupied', style: 'text-admin-accent bg-admin-accent/10' },
  maintenance: { label: 'Maintenance', style: 'text-admin-danger bg-admin-danger/10' },
  blocked: { label: 'Blocked', style: 'text-admin-muted bg-admin-muted/10' },
};

export function SiteSummary({ sites }: SiteSummaryProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Site summary">
      {(Object.keys(statusDetails) as SiteStatus[]).map((status) => {
        const count = sites.filter((site) => site.status === status).length;
        const details = statusDetails[status];
        return (
          <article key={status} className="admin-card flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-admin-muted">
                {details.label}
              </p>
              <p className="mt-1 font-serif text-3xl text-forest-900">{count}</p>
            </div>
            <span className={`grid size-11 place-items-center rounded-full ${details.style}`}>
              <span className="size-3 rounded-full bg-current" aria-hidden="true" />
            </span>
          </article>
        );
      })}
    </section>
  );
}
