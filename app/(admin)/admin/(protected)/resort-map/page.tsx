import { ResortMapCanvas } from '@/components/admin/ResortMapCanvas';
import { requirePagePermission } from '@/server/auth/pageAuthorization';
import { getResortMapSites } from '@/server/sites/getResortMapSites';

export const dynamic = 'force-dynamic';

type ResortMapPageProps = {
  searchParams: Promise<{ site?: string | string[] }>;
};

export default async function ResortMapPage({ searchParams }: ResortMapPageProps) {
  await requirePagePermission('sites.read');
  const selectedSite = (await searchParams).site;
  const selectedSiteId = typeof selectedSite === 'string' ? selectedSite : undefined;
  const sites = await getResortMapSites();

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
          Inventory
        </p>
        <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">Resort Map</h1>
        <p className="mt-2 max-w-2xl text-sm text-admin-muted">
          Select a site marker to inspect its current inventory record.
        </p>
      </header>
      <div className="overflow-x-auto pb-2">
        <ResortMapCanvas sites={sites} selectedSiteId={selectedSiteId} />
      </div>
    </div>
  );
}
