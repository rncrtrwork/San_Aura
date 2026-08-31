import { Ruler, TentTree, X, Zap } from 'lucide-react';
import Link from 'next/link';
import type { SiteStatus } from '@/models/Site';
import type { ResortMapSiteDetail } from '@/server/sites/getResortMapSiteDetail';

type SiteDetailPanelProps = {
  site: ResortMapSiteDetail;
};

const statusStyles: Record<SiteStatus, string> = {
  available: 'bg-admin-success/15 text-admin-success',
  occupied: 'bg-admin-accent/15 text-admin-accent',
  maintenance: 'bg-admin-danger/15 text-admin-danger',
  blocked: 'bg-admin-muted/15 text-admin-muted',
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function SiteDetailPanel({ site }: SiteDetailPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-forest-950/35" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-detail-heading"
        className="h-full w-full max-w-lg overflow-y-auto bg-admin-surface shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-admin-border p-5 sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-accent">
              {site.area}
            </p>
            <h2 id="site-detail-heading" className="mt-1 font-serif text-3xl text-forest-900">
              {site.code}
            </h2>
            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[site.status]}`}
            >
              {site.status}
            </span>
          </div>
          <Link
            href="/admin/resort-map"
            aria-label="Close site details"
            className="grid size-10 place-items-center rounded-full border border-admin-border text-admin-muted"
          >
            <X aria-hidden="true" className="size-4" />
          </Link>
        </header>
        <div className="space-y-6 p-5 sm:p-6">
          {site.currentStayStart && site.currentStayEnd ? (
            <section
              className="rounded-lg bg-admin-accent/10 p-4"
              aria-labelledby="current-stay-heading"
            >
              <h3
                id="current-stay-heading"
                className="text-xs font-bold uppercase text-admin-accent"
              >
                Current stay
              </h3>
              <p className="mt-1 font-semibold text-forest-900">
                {dateFormatter.format(new Date(site.currentStayStart))} –{' '}
                {dateFormatter.format(new Date(site.currentStayEnd))}
              </p>
            </section>
          ) : null}
          <section aria-labelledby="site-features-heading">
            <h3 id="site-features-heading" className="font-serif text-xl text-forest-900">
              Site details
            </h3>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-admin-border p-3">
                <TentTree aria-hidden="true" className="size-5 text-admin-accent" />
                <div>
                  <dt className="text-xs text-admin-muted">Type</dt>
                  <dd className="text-sm font-bold uppercase text-forest-900">{site.type}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-admin-border p-3">
                <Ruler aria-hidden="true" className="size-5 text-admin-accent" />
                <div>
                  <dt className="text-xs text-admin-muted">Length</dt>
                  <dd className="text-sm font-bold text-forest-900">
                    {site.length === null ? 'Not specified' : `${site.length} ft`}
                  </dd>
                </div>
              </div>
            </dl>
            {site.hookups.length > 0 ? (
              <div className="mt-3 flex items-start gap-3 rounded-lg border border-admin-border p-3">
                <Zap aria-hidden="true" className="mt-0.5 size-5 text-admin-accent" />
                <div>
                  <p className="text-xs text-admin-muted">Hookups</p>
                  <p className="text-sm font-semibold text-forest-900">
                    {site.hookups.join(' · ')}
                  </p>
                </div>
              </div>
            ) : null}
            <div className="mt-3">
              <p className="text-xs font-bold uppercase text-admin-muted">Amenities</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {site.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-admin-sidebar/10 px-3 py-1 text-xs font-semibold text-admin-sidebar"
                  >
                    {amenity}
                  </span>
                ))}
                {site.amenities.length === 0 ? (
                  <span className="text-sm text-admin-muted">No amenities recorded.</span>
                ) : null}
              </div>
            </div>
          </section>
          <section
            className="border-t border-admin-border pt-5"
            aria-labelledby="availability-heading"
          >
            <h3 id="availability-heading" className="text-xs font-bold uppercase text-admin-muted">
              Next availability
            </h3>
            <p className="mt-1 font-semibold text-forest-900">
              {site.nextAvailability
                ? dateFormatter.format(new Date(site.nextAvailability))
                : 'Pending site clearance'}
            </p>
          </section>
          <section
            className="border-t border-admin-border pt-5"
            aria-labelledby="maintenance-heading"
          >
            <h3 id="maintenance-heading" className="text-xs font-bold uppercase text-admin-muted">
              Maintenance note
            </h3>
            <p className="mt-1 text-sm text-forest-900">
              {site.maintenanceNote || 'No maintenance note recorded.'}
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
