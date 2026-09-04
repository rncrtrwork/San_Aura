import { BarChart3, Globe2, MonitorSmartphone, UsersRound, type LucideIcon } from 'lucide-react';
import { getVisitorAnalytics } from '@/server/analytics/getVisitorAnalytics';
import { requirePagePermission } from '@/server/auth/pageAuthorization';

export const dynamic = 'force-dynamic';

function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function browserLabel(browserName: string, browserVersion: string): string {
  if (!browserVersion) return browserName;
  return `${browserName} ${browserVersion.split('.')[0]}`;
}

function locationLabel(city: string, region: string, country: string): string {
  return (
    [city, region, country].filter((value) => value && value !== 'Unknown').join(', ') || 'Unknown'
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <article className="admin-card flex min-h-32 items-center gap-5 p-5">
      <span className="grid size-14 shrink-0 place-items-center rounded-full border border-admin-border text-admin-sidebar">
        <Icon aria-hidden="true" className="size-7" strokeWidth={1.6} />
      </span>
      <div>
        <p className="text-sm font-medium text-admin-muted">{label}</p>
        <p className="mt-1 font-serif text-4xl leading-none text-forest-900">{value}</p>
      </div>
    </article>
  );
}

export default async function AnalyticsPage() {
  await requirePagePermission('activity.read');
  const analytics = await getVisitorAnalytics();

  return (
    <div className="space-y-7">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
          Home visitors
        </p>
        <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">Analytics</h1>
        <p className="mt-2 max-w-2xl text-sm text-admin-muted">
          Tracks only Home page visits, browser, operating system, and approximate country, state,
          and city from IP-derived hosting/CDN geo headers.
        </p>
      </header>

      <section aria-label="Visitor summary" className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Visits Today" value={analytics.visitsToday} icon={UsersRound} />
        <SummaryCard label="Last 7 Days" value={analytics.visitsLastSevenDays} icon={BarChart3} />
        <SummaryCard label="Total Visits" value={analytics.totalVisits} icon={Globe2} />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="admin-card p-5" aria-labelledby="browser-heading">
          <h2 id="browser-heading" className="font-serif text-2xl text-forest-900">
            Browsers
          </h2>
          <div className="mt-4 space-y-3">
            {analytics.topBrowsers.length === 0 ? (
              <p className="text-sm text-admin-muted">No visits recorded yet.</p>
            ) : (
              analytics.topBrowsers.map((group) => (
                <div key={group.label} className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-semibold text-forest-900">{group.label}</span>
                  <span className="rounded-full bg-cream-alt px-3 py-1 font-bold text-admin-muted">
                    {group.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="admin-card p-5" aria-labelledby="os-heading">
          <h2 id="os-heading" className="font-serif text-2xl text-forest-900">
            Operating Systems
          </h2>
          <div className="mt-4 space-y-3">
            {analytics.topOperatingSystems.length === 0 ? (
              <p className="text-sm text-admin-muted">No visits recorded yet.</p>
            ) : (
              analytics.topOperatingSystems.map((group) => (
                <div key={group.label} className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-semibold text-forest-900">{group.label}</span>
                  <span className="rounded-full bg-cream-alt px-3 py-1 font-bold text-admin-muted">
                    {group.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="admin-card p-5" aria-labelledby="location-heading">
          <h2 id="location-heading" className="font-serif text-2xl text-forest-900">
            Locations
          </h2>
          <div className="mt-4 space-y-3">
            {analytics.topLocations.length === 0 ? (
              <p className="text-sm text-admin-muted">No visits recorded yet.</p>
            ) : (
              analytics.topLocations.map((group) => (
                <div
                  key={`${group.city}-${group.region}-${group.country}`}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="font-semibold text-forest-900">
                    {locationLabel(group.city, group.region, group.country)}
                  </span>
                  <span className="rounded-full bg-cream-alt px-3 py-1 font-bold text-admin-muted">
                    {group.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="admin-card overflow-hidden" aria-labelledby="recent-visits-heading">
        <div className="flex items-center justify-between gap-4 border-b border-admin-border p-5">
          <div>
            <h2 id="recent-visits-heading" className="font-serif text-2xl text-forest-900">
              Recent Home visits
            </h2>
            <p className="mt-1 text-sm text-admin-muted">
              Showing the latest {analytics.recentVisits.length} visits.
            </p>
          </div>
          <MonitorSmartphone aria-hidden="true" className="size-5 text-admin-accent" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-cream-alt text-xs uppercase tracking-[0.12em] text-admin-muted">
              <tr>
                <th scope="col" className="px-5 py-3">
                  When
                </th>
                <th scope="col" className="px-5 py-3">
                  Browser
                </th>
                <th scope="col" className="px-5 py-3">
                  Operating system
                </th>
                <th scope="col" className="px-5 py-3">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border bg-white">
              {analytics.recentVisits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-admin-muted">
                    No Home page visits recorded yet.
                  </td>
                </tr>
              ) : (
                analytics.recentVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td className="px-5 py-4 text-admin-muted">
                      {formatTimestamp(visit.createdAt)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-forest-900">
                      {browserLabel(visit.browserName, visit.browserVersion)}
                    </td>
                    <td className="px-5 py-4 text-admin-muted">{visit.operatingSystem}</td>
                    <td className="px-5 py-4 text-admin-muted">
                      {locationLabel(visit.city, visit.region, visit.country)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
