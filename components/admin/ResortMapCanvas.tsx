import Image from 'next/image';
import Link from 'next/link';
import type { SiteStatus } from '@/models/Site';
import type { ResortMapSite } from '@/server/sites/getResortMapSites';

type ResortMapCanvasProps = {
  sites: ResortMapSite[];
  selectedSiteId?: string;
};

const statusStyles: Record<SiteStatus, string> = {
  available: 'bg-admin-success',
  occupied: 'bg-admin-accent',
  maintenance: 'bg-admin-danger',
  blocked: 'bg-admin-muted',
};

const statusLabels: Record<SiteStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  blocked: 'Blocked',
};

export function ResortMapCanvas({ sites, selectedSiteId }: ResortMapCanvasProps) {
  return (
    <section className="admin-card overflow-hidden" aria-label="Interactive resort site map">
      <div className="relative aspect-[980/361] min-w-[900px] bg-forest-800">
        <Image
          src="/images/resort-map.png"
          alt="Illustrated map of Sun Aura Resort"
          fill
          priority
          sizes="(min-width: 1280px) 75vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-forest-950/10" aria-hidden="true" />
        {sites.map((site) => (
          <Link
            key={site.id}
            href={`/admin/resort-map?site=${site.id}`}
            aria-label={`Open ${site.code}, ${statusLabels[site.status]}`}
            title={`${site.code} · ${statusLabels[site.status]}`}
            className={`absolute z-10 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-[9px] font-extrabold text-white shadow-md transition-transform hover:z-20 hover:scale-125 focus:z-20 focus:scale-125 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:ring-offset-2 ${statusStyles[site.status]} ${
              selectedSiteId === site.id ? 'ring-4 ring-admin-accent ring-offset-2' : ''
            }`}
            style={{ left: `${site.x}%`, top: `${site.y}%` }}
          >
            {site.code.replace(/^(Cabin|RV|Tent)\s*/i, '')}
          </Link>
        ))}
        {sites.length === 0 ? (
          <div className="absolute inset-x-0 bottom-5 mx-auto w-fit rounded-lg bg-white/95 px-5 py-3 text-sm font-semibold text-forest-900 shadow-lg">
            Add active sites to place markers on the map.
          </div>
        ) : null}
        <div className="absolute bottom-3 right-3 z-20 flex flex-wrap gap-3 rounded-lg bg-white/95 px-4 py-2 text-[11px] font-semibold text-forest-900 shadow-lg">
          {(Object.keys(statusLabels) as SiteStatus[]).map((status) => (
            <span key={status} className="inline-flex items-center gap-1.5">
              <span
                className={`size-2.5 rounded-full ${statusStyles[status]}`}
                aria-hidden="true"
              />
              {statusLabels[status]}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
