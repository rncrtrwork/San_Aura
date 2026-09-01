import Image from 'next/image';
import {
  PUBLIC_SITE_STATUS_LABELS,
  publicMapStatusSummary,
  type PublicMapSite,
} from '@/lib/publicMap';
import type { SiteStatus } from '@/models/Site';

type PublicResortMapProps = {
  sites: PublicMapSite[];
};

const statusStyles: Record<SiteStatus, string> = {
  available: 'bg-admin-success',
  occupied: 'bg-admin-accent',
  maintenance: 'bg-admin-danger',
  blocked: 'bg-admin-muted',
};

function shortSiteCode(code: string): string {
  return code.replace(/^(Cabin|RV|Tent)\s*/i, '');
}

export function PublicResortMap({ sites }: PublicResortMapProps) {
  const summary = publicMapStatusSummary(sites);

  return (
    <section className="bg-cream px-6 py-16 md:px-10 md:py-20 lg:px-12">
      <div className="mx-auto max-w-[1360px]">
        <div className="overflow-x-auto rounded-[2rem] border border-line bg-[#fbfaf6] p-4 shadow-card">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-gold-700 lg:hidden">
            Swipe to explore the full map
          </p>
          <div className="relative aspect-[980/361] min-w-[900px] overflow-hidden rounded-[1.5rem] bg-forest-800">
            <Image
              src="/images/resort-map.png"
              alt="Illustrated map of Sun Aura Resort"
              fill
              priority
              sizes="(min-width: 1280px) 90vw, 900px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-forest-900/10" aria-hidden="true" />
            {sites.map((site) => (
              <span
                key={site.id}
                aria-label={`${site.code}, ${PUBLIC_SITE_STATUS_LABELS[site.status]}`}
                title={`${site.code} · ${PUBLIC_SITE_STATUS_LABELS[site.status]}`}
                className={`absolute z-10 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-[9px] font-extrabold text-white shadow-md ${statusStyles[site.status]}`}
                style={{ left: `${site.x}%`, top: `${site.y}%` }}
              >
                {shortSiteCode(site.code)}
              </span>
            ))}
            {sites.length === 0 ? (
              <div className="absolute inset-x-0 bottom-5 mx-auto w-fit rounded-lg bg-white/95 px-5 py-3 text-sm font-semibold text-forest-900 shadow-lg">
                Public site markers will appear once resort sites are added.
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-line bg-[#fbfaf6] p-5 text-sm font-semibold text-forest-900 shadow-card sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(PUBLIC_SITE_STATUS_LABELS) as SiteStatus[]).map((status) => (
            <div key={status} className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2">
                <span className={`size-3 rounded-full ${statusStyles[status]}`} />
                {PUBLIC_SITE_STATUS_LABELS[status]}
              </span>
              <span>{summary[status]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
