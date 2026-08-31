import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Site, type SiteStatus, type SiteType } from '@/models/Site';
import { SiteBlock } from '@/models/SiteBlock';

export type ResortMapSiteDetail = {
  id: string;
  code: string;
  type: SiteType;
  area: string;
  status: SiteStatus;
  amenities: string[];
  hookups: string[];
  length: number | null;
  maintenanceNote: string;
  currentReservationId: string | null;
  currentStayStart: string | null;
  currentStayEnd: string | null;
  nextAvailability: string | null;
};

type OccupiedInterval = { start: Date; end: Date };

function findNextAvailability(now: Date, intervals: OccupiedInterval[]): Date {
  let cursor = now;
  const sortedIntervals = intervals.sort(
    (left, right) => left.start.getTime() - right.start.getTime(),
  );
  for (const interval of sortedIntervals) {
    if (interval.start > cursor) {
      break;
    }
    if (interval.end > cursor) {
      cursor = interval.end;
    }
  }
  return cursor;
}

export async function getResortMapSiteDetail(
  siteId: string | undefined,
): Promise<ResortMapSiteDetail | null> {
  if (!siteId || !Types.ObjectId.isValid(siteId)) {
    return null;
  }
  await connectToDatabase();
  const site = await Site.findOne({ _id: siteId, active: true }).lean();
  if (!site) {
    return null;
  }
  const now = new Date();
  const [reservations, blocks] = await Promise.all([
    Reservation.find({
      siteRef: site._id,
      checkOut: { $gt: now },
      status: { $in: ['pending', 'confirmed', 'checked-in'] },
    })
      .select('checkIn checkOut status')
      .sort({ checkIn: 1 })
      .lean(),
    SiteBlock.find({ siteRef: site._id, endDate: { $gt: now } })
      .select('startDate endDate')
      .sort({ startDate: 1 })
      .lean(),
  ]);
  const currentReservation = reservations.find(
    (reservation) => reservation.checkIn <= now && reservation.checkOut > now,
  );
  const nextAvailability = findNextAvailability(now, [
    ...reservations.map((reservation) => ({
      start: reservation.checkIn,
      end: reservation.checkOut,
    })),
    ...blocks.map((block) => ({ start: block.startDate, end: block.endDate })),
  ]);
  const indefinitelyUnavailable =
    (site.status === 'maintenance' || site.status === 'blocked') && blocks.length === 0;

  return {
    id: site._id.toString(),
    code: site.code,
    type: site.type,
    area: site.area,
    status: site.status,
    amenities: site.amenities,
    hookups: site.hookups,
    length: site.length,
    maintenanceNote: site.maintenanceNote,
    currentReservationId: currentReservation?._id.toString() ?? null,
    currentStayStart: currentReservation?.checkIn.toISOString() ?? null,
    currentStayEnd: currentReservation?.checkOut.toISOString() ?? null,
    nextAvailability: indefinitelyUnavailable ? null : nextAvailability.toISOString(),
  };
}
