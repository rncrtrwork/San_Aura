import { connectToDatabase } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { SITE_TYPES, Site, type SiteType } from '@/models/Site';

export type AvailabilitySummaryItem = {
  type: SiteType;
  available: number;
  total: number;
};

export async function getAvailabilitySummary(date: Date): Promise<AvailabilitySummaryItem[]> {
  await connectToDatabase();
  const rangeEnd = new Date(date);
  rangeEnd.setDate(rangeEnd.getDate() + 1);
  const [sites, reservations] = await Promise.all([
    Site.find({ active: true }).select('_id type status').lean(),
    Reservation.find({
      checkIn: { $lt: rangeEnd },
      checkOut: { $gt: date },
      status: { $ne: 'cancelled' },
    })
      .select('siteRef')
      .lean(),
  ]);
  const reservedSiteIds = new Set(
    reservations.map((reservation) => reservation.siteRef.toString()),
  );

  return SITE_TYPES.map((type) => {
    const matchingSites = sites.filter((site) => site.type === type);
    const available = matchingSites.filter(
      (site) =>
        site.status !== 'maintenance' &&
        site.status !== 'blocked' &&
        !reservedSiteIds.has(site._id.toString()),
    ).length;
    return { type, available, total: matchingSites.length };
  });
}
