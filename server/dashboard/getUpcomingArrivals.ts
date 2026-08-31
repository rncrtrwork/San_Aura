import { connectToDatabase } from '@/lib/db';
import { Guest } from '@/models/Guest';
import { Member } from '@/models/Member';
import { Reservation, type ReservationStatus } from '@/models/Reservation';
import { Site, type SiteType } from '@/models/Site';

export type UpcomingArrival = {
  id: string;
  guestName: string;
  checkIn: string;
  siteCode: string;
  siteType: SiteType | null;
  guestsCount: number;
  status: ReservationStatus;
};

export async function getUpcomingArrivals(limit = 5, now = new Date()): Promise<UpcomingArrival[]> {
  await connectToDatabase();

  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const reservations = await Reservation.find({
    checkIn: { $gte: dayStart },
    status: { $in: ['pending', 'confirmed'] satisfies ReservationStatus[] },
  })
    .select('guestOrMemberType guestOrMemberRef siteRef checkIn guestsCount status')
    .sort({ checkIn: 1, createdAt: 1 })
    .limit(limit)
    .lean();

  const memberIds = reservations
    .filter((reservation) => reservation.guestOrMemberType === 'Member')
    .map((reservation) => reservation.guestOrMemberRef);
  const guestIds = reservations
    .filter((reservation) => reservation.guestOrMemberType === 'Guest')
    .map((reservation) => reservation.guestOrMemberRef);
  const siteIds = reservations.map((reservation) => reservation.siteRef);

  const [members, guests, sites] = await Promise.all([
    Member.find({ _id: { $in: memberIds } })
      .select('_id name')
      .lean(),
    Guest.find({ _id: { $in: guestIds } })
      .select('_id name')
      .lean(),
    Site.find({ _id: { $in: siteIds } })
      .select('_id code type')
      .lean(),
  ]);

  const ownerNames = new Map<string, string>([
    ...members.map((member): [string, string] => [member._id.toString(), member.name]),
    ...guests.map((guest): [string, string] => [guest._id.toString(), guest.name]),
  ]);
  const sitesById = new Map(
    sites.map((site): [string, { code: string; type: SiteType }] => [
      site._id.toString(),
      { code: site.code, type: site.type },
    ]),
  );

  return reservations.map((reservation) => {
    const site = sitesById.get(reservation.siteRef.toString());
    return {
      id: reservation._id.toString(),
      guestName:
        ownerNames.get(reservation.guestOrMemberRef.toString()) ?? 'Guest record unavailable',
      checkIn: reservation.checkIn.toISOString(),
      siteCode: site?.code ?? 'Unassigned',
      siteType: site?.type ?? null,
      guestsCount: reservation.guestsCount,
      status: reservation.status,
    };
  });
}
