import { connectToDatabase } from '@/lib/db';
import { Payment } from '@/models/Payment';
import { Reservation, type ReservationStatus } from '@/models/Reservation';
import { Site } from '@/models/Site';

export type OverviewMetrics = {
  occupancyPercent: number;
  occupancyDelta: number;
  arrivalsToday: number;
  arrivalsDelta: number;
  departuresToday: number;
  departuresDelta: number;
  revenueThisWeek: number;
  revenueDeltaPercent: number;
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

function startOfWeek(date: Date): Date {
  const result = startOfDay(date);
  const day = result.getDay();
  result.setDate(result.getDate() - ((day + 6) % 7));
  return result;
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Math.round(((current - previous) / previous) * 100);
}

export async function getOverviewMetrics(now = new Date()): Promise<OverviewMetrics> {
  await connectToDatabase();

  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);
  const lastWeekMoment = addDays(now, -7);
  const weekStart = startOfWeek(today);
  const previousWeekStart = addDays(weekStart, -7);

  const activeReservationStatuses: readonly ReservationStatus[] = ['confirmed', 'checked-in'];
  const nonCancelledStatuses: readonly ReservationStatus[] = [
    'pending',
    'confirmed',
    'checked-in',
    'completed',
  ];

  const [
    activeSiteCount,
    occupiedNow,
    occupiedLastWeek,
    arrivalsToday,
    arrivalsYesterday,
    departuresToday,
    departuresYesterday,
    revenueThisWeekResult,
    revenuePreviousWeekResult,
  ] = await Promise.all([
    Site.countDocuments({ active: true, status: { $nin: ['blocked', 'maintenance'] } }),
    Reservation.distinct('siteRef', {
      checkIn: { $lte: now },
      checkOut: { $gt: now },
      status: { $in: activeReservationStatuses },
    }),
    Reservation.distinct('siteRef', {
      checkIn: { $lte: lastWeekMoment },
      checkOut: { $gt: lastWeekMoment },
      status: { $in: activeReservationStatuses },
    }),
    Reservation.countDocuments({
      checkIn: { $gte: today, $lt: tomorrow },
      status: { $in: nonCancelledStatuses },
    }),
    Reservation.countDocuments({
      checkIn: { $gte: yesterday, $lt: today },
      status: { $in: nonCancelledStatuses },
    }),
    Reservation.countDocuments({
      checkOut: { $gte: today, $lt: tomorrow },
      status: { $in: nonCancelledStatuses },
    }),
    Reservation.countDocuments({
      checkOut: { $gte: yesterday, $lt: today },
      status: { $in: nonCancelledStatuses },
    }),
    Payment.aggregate<{ total: number }>([
      { $match: { entryKind: 'payment', date: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate<{ total: number }>([
      {
        $match: {
          entryKind: 'payment',
          date: { $gte: previousWeekStart, $lt: weekStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const occupancyPercent =
    activeSiteCount === 0 ? 0 : Math.round((occupiedNow.length / activeSiteCount) * 100);
  const previousOccupancyPercent =
    activeSiteCount === 0 ? 0 : Math.round((occupiedLastWeek.length / activeSiteCount) * 100);
  const revenueThisWeek = revenueThisWeekResult[0]?.total ?? 0;
  const revenuePreviousWeek = revenuePreviousWeekResult[0]?.total ?? 0;

  return {
    occupancyPercent,
    occupancyDelta: occupancyPercent - previousOccupancyPercent,
    arrivalsToday,
    arrivalsDelta: arrivalsToday - arrivalsYesterday,
    departuresToday,
    departuresDelta: departuresToday - departuresYesterday,
    revenueThisWeek,
    revenueDeltaPercent: percentChange(revenueThisWeek, revenuePreviousWeek),
  };
}
