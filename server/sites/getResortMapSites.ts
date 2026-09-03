import { connectToDatabase } from '@/lib/db';
import { Site, type SiteStatus, type SiteType } from '@/models/Site';

export type ResortMapSite = {
  id: string;
  code: string;
  area: string;
  type: SiteType;
  status: SiteStatus;
  x: number;
  y: number;
};

type FallbackRegion = {
  startX: number;
  startY: number;
  columnGap: number;
  rowGap: number;
  columns: number;
};

const fallbackRegions: Record<SiteType, FallbackRegion> = {
  cabin: { startX: 8, startY: 22, columnGap: 5, rowGap: 10, columns: 7 },
  rv: { startX: 46, startY: 14, columnGap: 3.15, rowGap: 7, columns: 16 },
  tent: { startX: 12, startY: 72, columnGap: 5, rowGap: 9, columns: 7 },
};

function fallbackPosition(type: SiteType, index: number): { x: number; y: number } {
  const region = fallbackRegions[type];
  return {
    x: region.startX + (index % region.columns) * region.columnGap,
    y: region.startY + Math.floor(index / region.columns) * region.rowGap,
  };
}

export async function getResortMapSites(): Promise<ResortMapSite[]> {
  await connectToDatabase();
  const sites = await Site.find({ active: true })
    .select('code area type status mapPosition')
    .sort({ type: 1, code: 1 })
    .lean();
  const typeIndexes: Record<SiteType, number> = { cabin: 0, rv: 0, tent: 0 };

  return sites.map((site) => {
    const fallback = fallbackPosition(site.type, typeIndexes[site.type]);
    typeIndexes[site.type] += 1;
    return {
      id: site._id.toString(),
      code: site.code,
      area: site.area,
      type: site.type,
      status: site.status,
      x: site.mapPosition?.x ?? fallback.x,
      y: site.mapPosition?.y ?? fallback.y,
    };
  });
}
