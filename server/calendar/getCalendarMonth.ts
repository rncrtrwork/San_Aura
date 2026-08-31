import { connectToDatabase } from '@/lib/db';
import { Guest } from '@/models/Guest';
import { Member } from '@/models/Member';
import { Reservation, type ReservationStatus } from '@/models/Reservation';
import { Site } from '@/models/Site';

export type CalendarReservation = {
  id: string;
  ownerName: string;
  siteCode: string;
  checkIn: string;
  checkOut: string;
  status: ReservationStatus;
};

export function parseCalendarMonth(value: string | string[] | undefined, now = new Date()): string {
  const candidate = typeof value === 'string' ? value : '';
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(candidate)
    ? candidate
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function getCalendarMonth(month: string): Promise<CalendarReservation[]> {
  const [year, monthNumber] = month.split('-').map(Number);
  const rangeStart = new Date(year, monthNumber - 1, 1);
  rangeStart.setDate(rangeStart.getDate() - rangeStart.getDay());
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeEnd.getDate() + 42);
  return getCalendarRange(rangeStart, rangeEnd);
}

export async function getCalendarRange(
  rangeStart: Date,
  rangeEnd: Date,
): Promise<CalendarReservation[]> {
  await connectToDatabase();
  const reservations = await Reservation.find({
    checkIn: { $lt: rangeEnd },
    checkOut: { $gt: rangeStart },
    status: { $ne: 'cancelled' },
  })
    .select('guestOrMemberType guestOrMemberRef siteRef checkIn checkOut status')
    .sort({ checkIn: 1 })
    .lean();
  const memberIds = reservations
    .filter((item) => item.guestOrMemberType === 'Member')
    .map((item) => item.guestOrMemberRef);
  const guestIds = reservations
    .filter((item) => item.guestOrMemberType === 'Guest')
    .map((item) => item.guestOrMemberRef);
  const [members, guests, sites] = await Promise.all([
    Member.find({ _id: { $in: memberIds } })
      .select('_id name')
      .lean(),
    Guest.find({ _id: { $in: guestIds } })
      .select('_id name')
      .lean(),
    Site.find({ _id: { $in: reservations.map((item) => item.siteRef) } })
      .select('_id code')
      .lean(),
  ]);
  const names = new Map(
    [...members, ...guests].map((item): [string, string] => [item._id.toString(), item.name]),
  );
  const codes = new Map(sites.map((site): [string, string] => [site._id.toString(), site.code]));
  return reservations.map((item) => ({
    id: item._id.toString(),
    ownerName: names.get(item.guestOrMemberRef.toString()) ?? 'Guest unavailable',
    siteCode: codes.get(item.siteRef.toString()) ?? 'Site unavailable',
    checkIn: item.checkIn.toISOString(),
    checkOut: item.checkOut.toISOString(),
    status: item.status,
  }));
}
