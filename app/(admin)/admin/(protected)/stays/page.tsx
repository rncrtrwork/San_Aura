import Link from 'next/link';
import { requirePagePermission } from '@/server/auth/pageAuthorization';

export const dynamic = 'force-dynamic';

const tabs = [
  { id: 'stay-types', label: 'Stay Types' },
  { id: 'rate-plans', label: 'Rate Plans' },
  { id: 'availability-rules', label: 'Availability Rules' },
  { id: 'add-ons', label: 'Add-ons' },
] as const;

type StaysPageProps = {
  searchParams: Promise<{ tab?: string | string[] }>;
};

export default async function StaysPage({ searchParams }: StaysPageProps) {
  await requirePagePermission('sites.read');
  const requestedTab = (await searchParams).tab;
  const activeTab = tabs.some((tab) => tab.id === requestedTab) ? requestedTab : 'stay-types';
  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? 'Stay Types';

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
          Inventory & pricing
        </p>
        <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">Stays & Rates</h1>
        <p className="mt-2 max-w-2xl text-sm text-admin-muted">
          Manage accommodation inventory, seasonal pricing, availability rules, and guest add-ons.
        </p>
      </header>
      <nav className="border-b border-admin-border" aria-label="Stays and rates sections">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/admin/stays?tab=${tab.id}`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-bold ${
                activeTab === tab.id
                  ? 'border-admin-accent text-forest-900'
                  : 'border-transparent text-admin-muted hover:text-forest-900'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>
      <section className="admin-card min-h-72 p-6" aria-labelledby="stays-section-heading">
        <h2 id="stays-section-heading" className="font-serif text-2xl text-forest-900">
          {activeLabel}
        </h2>
      </section>
    </div>
  );
}
