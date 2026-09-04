import type { Metadata } from 'next';
import { Globe2, MonitorSmartphone, ShieldCheck, type LucideIcon } from 'lucide-react';
import { getVisitorLog } from '@/server/analytics/getVisitorLog';
import { requirePagePermission } from '@/server/auth/pageAuthorization';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Visitor Log | Sun Aura Resort',
  description: 'Protected visitor activity log for Sun Aura Resort staff.',
  robots: {
    index: false,
    follow: false,
  },
};

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
    <article className="rounded-2xl border border-line bg-white/90 p-5 shadow-card">
      <span className="grid size-12 place-items-center rounded-full border border-line text-forest-900">
        <Icon aria-hidden="true" className="size-6" strokeWidth={1.7} />
      </span>
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-ink-700">{label}</p>
      <p className="mt-2 font-serif text-4xl text-forest-900">{value}</p>
    </article>
  );
}

export default async function VisitorLogPage() {
  await requirePagePermission('activity.read');
  const log = await getVisitorLog();

  return (
    <section className="bg-cream px-6 py-16 md:px-10 lg:px-12">
      <div className="mx-auto max-w-[1360px]">
        <header className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold-700">
            Visitor activity
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-tight text-forest-900">
            Home page visitor log
          </h1>
          <p className="mt-4 text-base leading-7 text-ink-700">
            This protected page shows only the required Home page visitor details: browser,
            operating system, IP address, and approximate country, state, and city.
          </p>
        </header>

        <section aria-label="Visitor log summary" className="mt-10 grid gap-4 md:grid-cols-3">
          <SummaryCard label="Visits Today" value={log.summary.visitsToday} icon={Globe2} />
          <SummaryCard
            label="Total Home Visits"
            value={log.summary.totalVisits}
            icon={MonitorSmartphone}
          />
          <SummaryCard
            label="Unique IP Addresses"
            value={log.summary.uniqueIpCount}
            icon={ShieldCheck}
          />
        </section>

        <section
          className="mt-8 overflow-hidden rounded-[2rem] border border-line bg-white shadow-card"
          aria-labelledby="visitor-log-heading"
        >
          <div className="border-b border-line p-5 md:p-6">
            <h2 id="visitor-log-heading" className="font-serif text-3xl text-forest-900">
              Recent visits
            </h2>
            <p className="mt-1 text-sm text-ink-700">
              Showing the latest {log.entries.length} Home page visits.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[68rem] text-left text-sm">
              <thead className="bg-cream-alt text-xs uppercase tracking-[0.12em] text-ink-700">
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
                    IP address
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Country / State / City
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {log.entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-ink-700">
                      No Home page visits recorded yet.
                    </td>
                  </tr>
                ) : (
                  log.entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-5 py-4 text-ink-700">{formatTimestamp(entry.createdAt)}</td>
                      <td className="px-5 py-4 font-semibold text-forest-900">
                        {browserLabel(entry.browserName, entry.browserVersion)}
                      </td>
                      <td className="px-5 py-4 text-ink-700">{entry.operatingSystem}</td>
                      <td className="px-5 py-4 font-mono text-xs text-forest-900">
                        {entry.ipAddress}
                      </td>
                      <td className="px-5 py-4 text-ink-700">
                        {locationLabel(entry.city, entry.region, entry.country)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}
