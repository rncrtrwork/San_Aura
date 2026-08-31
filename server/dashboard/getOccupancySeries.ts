import { connectToDatabase } from '@/lib/db';
import { Reservation, type ReservationStatus } from '@/models/Reservation';
import { Site, type SiteType } from '@/models/Site';

export type OccupancyPoint = {
  date: string;
  label: string;
  cabin: number;
  rv: number;
  tent: number;
};

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function getOccupancySeries(now = new Date()): Promise<OccupancyPoint[]> {
  await connectToDatabase();

  const rangeStart = startOfDay(now);
  const rangeEnd = addDays(rangeStart, 14);
  const activeStatuses: readonly ReservationStatus[] = ['confirmed', 'checked-in'];
  const [sites, reservations] = await Promise.all([
    Site.find({ active: true, status: { $nin: ['blocked', 'maintenance'] } })
      .select('_id type')
      .lean(),
    Reservation.find({
      checkIn: { $lt: rangeEnd },
      checkOut: { $gt: rangeStart },
      status: { $in: activeStatuses },
    })
      .select('siteRef checkIn checkOut')
      .lean(),
  ]);

  const siteTypeById = new Map(sites.map((site) => [site._id.toString(), site.type]));
  const totals: Record<SiteType, number> = { cabin: 0, rv: 0, tent: 0 };
  for (const site of sites) {
    totals[site.type] += 1;
  }

  const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

  return Array.from({ length: 14 }, (_, offset) => {
    const dayStart = addDays(rangeStart, offset);
    const dayEnd = addDays(dayStart, 1);
    const occupied: Record<SiteType, Set<string>> = {
      cabin: new Set<string>(),
      rv: new Set<string>(),
      tent: new Set<string>(),
    };

    for (const reservation of reservations) {
      if (reservation.checkIn < dayEnd && reservation.checkOut > dayStart) {
        const siteId = reservation.siteRef.toString();
        const siteType = siteTypeById.get(siteId);
        if (siteType) {
          occupied[siteType].add(siteId);
        }
      }
    }

    return {
      date: dayStart.toISOString(),
      label: dateFormatter.format(dayStart),
      cabin: totals.cabin === 0 ? 0 : Math.round((occupied.cabin.size / totals.cabin) * 100),
      rv: totals.rv === 0 ? 0 : Math.round((occupied.rv.size / totals.rv) * 100),
      tent: totals.tent === 0 ? 0 : Math.round((occupied.tent.size / totals.tent) * 100),
    };
  });
}
