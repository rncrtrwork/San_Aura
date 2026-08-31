import { connectToDatabase } from '@/lib/db';
import { Guest } from '@/models/Guest';
import { Member } from '@/models/Member';
import {
  Reservation,
  RESERVATION_STATUSES,
  type ReservationPaymentStatus,
  type ReservationStatus,
} from '@/models/Reservation';
import { Site, type SiteType } from '@/models/Site';
import { StayType } from '@/models/StayType';

export type ReservationStatusFilter = ReservationStatus | 'all';

export type ReservationListItem = {
  id: string;
  ownerName: string;
  ownerType: 'Member' | 'Guest';
  checkIn: string;
  checkOut: string;
  siteCode: string;
  siteType: SiteType | null;
  stayTypeName: string;
  guestsCount: number;
  totalAmount: number;
  paymentStatus: ReservationPaymentStatus;
  status: ReservationStatus;
};

export type ReservationListResult = {
  reservations: ReservationListItem[];
  counts: Record<ReservationStatusFilter, number>;
};

export function parseReservationStatus(
  value: string | string[] | undefined,
): ReservationStatusFilter {
  const selected = typeof value === 'string' ? value : '';
  return RESERVATION_STATUSES.find((status) => status === selected) ?? 'all';
}

export async function getReservations(
  status: ReservationStatusFilter,
): Promise<ReservationListResult> {
  await connectToDatabase();
  const filter = status === 'all' ? {} : { status };
  const [reservations, statusCounts] = await Promise.all([
    Reservation.find(filter)
      .select(
        'guestOrMemberType guestOrMemberRef siteRef stayType checkIn checkOut guestsCount totalAmount paymentStatus status',
      )
      .sort({ checkIn: -1, createdAt: -1 })
      .limit(100)
      .lean(),
    Reservation.aggregate<{ _id: ReservationStatus; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const memberIds = reservations
    .filter((reservation) => reservation.guestOrMemberType === 'Member')
    .map((reservation) => reservation.guestOrMemberRef);
  const guestIds = reservations
    .filter((reservation) => reservation.guestOrMemberType === 'Guest')
    .map((reservation) => reservation.guestOrMemberRef);
  const [members, guests, sites, stayTypes] = await Promise.all([
    Member.find({ _id: { $in: memberIds } })
      .select('_id name')
      .lean(),
    Guest.find({ _id: { $in: guestIds } })
      .select('_id name')
      .lean(),
    Site.find({ _id: { $in: reservations.map((reservation) => reservation.siteRef) } })
      .select('_id code type')
      .lean(),
    StayType.find({ _id: { $in: reservations.map((reservation) => reservation.stayType) } })
      .select('_id name')
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
  const stayTypeNames = new Map(
    stayTypes.map((stayType): [string, string] => [stayType._id.toString(), stayType.name]),
  );
  const counts = Object.fromEntries([
    ['all', statusCounts.reduce((total, entry) => total + entry.count, 0)],
    ...RESERVATION_STATUSES.map((reservationStatus): [ReservationStatus, number] => [
      reservationStatus,
      statusCounts.find((entry) => entry._id === reservationStatus)?.count ?? 0,
    ]),
  ]) as Record<ReservationStatusFilter, number>;

  return {
    reservations: reservations.map((reservation) => {
      const site = sitesById.get(reservation.siteRef.toString());
      return {
        id: reservation._id.toString(),
        ownerName:
          ownerNames.get(reservation.guestOrMemberRef.toString()) ?? 'Guest record unavailable',
        ownerType: reservation.guestOrMemberType,
        checkIn: reservation.checkIn.toISOString(),
        checkOut: reservation.checkOut.toISOString(),
        siteCode: site?.code ?? 'Unassigned',
        siteType: site?.type ?? null,
        stayTypeName: stayTypeNames.get(reservation.stayType.toString()) ?? 'Stay type unavailable',
        guestsCount: reservation.guestsCount,
        totalAmount: reservation.totalAmount,
        paymentStatus: reservation.paymentStatus,
        status: reservation.status,
      };
    }),
    counts,
  };
}
