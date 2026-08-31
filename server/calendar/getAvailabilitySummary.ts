import { connectToDatabase } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { SITE_TYPES, Site, type SiteType } from '@/models/Site';
import { SiteBlock } from '@/models/SiteBlock';

export type AvailabilitySummaryItem = {
  type: SiteType;
  available: number;
  occupied: number;
  total: number;
};

export async function getAvailabilitySummary(date: Date): Promise<AvailabilitySummaryItem[]> {
  await connectToDatabase();
  const rangeEnd = new Date(date);
  rangeEnd.setDate(rangeEnd.getDate() + 1);
  const [sites, reservations, blocks] = await Promise.all([
    Site.find({ active: true }).select('_id type status').lean(),
    Reservation.find({
      checkIn: { $lt: rangeEnd },
      checkOut: { $gt: date },
      status: { $ne: 'cancelled' },
    })
      .select('siteRef')
      .lean(),
    SiteBlock.find({ startDate: { $lt: rangeEnd }, endDate: { $gt: date } })
      .select('siteRef')
      .lean(),
  ]);
  const reservedSiteIds = new Set(
    reservations.map((reservation) => reservation.siteRef.toString()),
  );
  const blockedSiteIds = new Set(blocks.map((block) => block.siteRef.toString()));

  return SITE_TYPES.map((type) => {
    const matchingSites = sites.filter((site) => site.type === type);
    const available = matchingSites.filter(
      (site) =>
        site.status !== 'maintenance' &&
        site.status !== 'blocked' &&
        !reservedSiteIds.has(site._id.toString()) &&
        !blockedSiteIds.has(site._id.toString()),
    ).length;
    const occupied = matchingSites.filter((site) =>
      reservedSiteIds.has(site._id.toString()),
    ).length;
    return { type, available, occupied, total: matchingSites.length };
  });
}
