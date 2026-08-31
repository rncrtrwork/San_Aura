import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { ResortMapCanvas } from '@/components/admin/ResortMapCanvas';
import { ResortMapEditor } from '@/components/admin/ResortMapEditor';
import { SiteDetailPanel } from '@/components/admin/SiteDetailPanel';
import { SiteSummary } from '@/components/admin/SiteSummary';
import { requirePagePermission } from '@/server/auth/pageAuthorization';
import { isAdminRole } from '@/server/auth/isAdminRole';
import { getResortMapSites } from '@/server/sites/getResortMapSites';
import { getResortMapSiteDetail } from '@/server/sites/getResortMapSiteDetail';

export const dynamic = 'force-dynamic';

type ResortMapPageProps = {
  searchParams: Promise<{ site?: string | string[]; edit?: string | string[] }>;
};

export default async function ResortMapPage({ searchParams }: ResortMapPageProps) {
  const staff = await requirePagePermission('sites.read');
  const params = await searchParams;
  const selectedSite = params.site;
  const selectedSiteId = typeof selectedSite === 'string' ? selectedSite : undefined;
  const [sites, siteDetail, isAdmin] = await Promise.all([
    getResortMapSites(),
    getResortMapSiteDetail(selectedSiteId),
    isAdminRole(staff.roleId),
  ]);
  const editing = isAdmin && params.edit === '1';

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            Inventory
          </p>
          <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">Resort Map</h1>
          <p className="mt-2 max-w-2xl text-sm text-admin-muted">
            Select a site marker to inspect its current inventory record.
          </p>
        </div>
        {isAdmin && !editing ? (
          <Link
            href="/admin/resort-map?edit=1"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-accent px-4 text-sm font-bold text-white hover:bg-admin-accent/90"
          >
            <Pencil aria-hidden="true" className="size-4" />
            Edit Map
          </Link>
        ) : null}
      </header>
      {editing ? (
        <ResortMapEditor sites={sites} />
      ) : (
        <>
          <SiteSummary sites={sites} />
          <div className="overflow-x-auto pb-2">
            <ResortMapCanvas sites={sites} selectedSiteId={selectedSiteId} />
          </div>
          {siteDetail ? <SiteDetailPanel site={siteDetail} /> : null}
        </>
      )}
    </div>
  );
}
