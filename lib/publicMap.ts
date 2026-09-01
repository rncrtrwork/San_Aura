import type { SiteStatus, SiteType } from '@/models/Site';

export type PublicMapSite = {
  id: string;
  code: string;
  type: SiteType;
  status: SiteStatus;
  x: number;
  y: number;
};

export const PUBLIC_SITE_STATUS_LABELS: Record<SiteStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  blocked: 'Blocked',
};

export function publicMapStatusSummary(sites: PublicMapSite[]): Record<SiteStatus, number> {
  return sites.reduce<Record<SiteStatus, number>>(
    (summary, site) => ({
      ...summary,
      [site.status]: summary[site.status] + 1,
    }),
    { available: 0, occupied: 0, maintenance: 0, blocked: 0 },
  );
}
