import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { Guest } from '@/models/Guest';
import { Member } from '@/models/Member';
import {
  Reservation,
  RESERVATION_PAYMENT_STATUSES,
  RESERVATION_STATUSES,
  type ReservationPaymentStatus,
  type ReservationStatus,
} from '@/models/Reservation';
import { Site, type SiteType } from '@/models/Site';
import { StayType } from '@/models/StayType';

export type ReservationStatusFilter = ReservationStatus | 'all';

export type ReservationListFilters = {
  status: ReservationStatusFilter;
  stayTypeId: string;
  arrivalDate: string;
  paymentStatus: ReservationPaymentStatus | '';
  search: string;
};

type ReservationSearchClause =
  | { _id: Types.ObjectId }
  | { guestOrMemberRef: { $in: Types.ObjectId[] } }
  | { siteRef: { $in: Types.ObjectId[] } }
  | { source: RegExp };

type ReservationQuery = {
  status?: ReservationStatus;
  stayType?: Types.ObjectId;
  paymentStatus?: ReservationPaymentStatus;
  checkIn?: { $gte: Date; $lt: Date };
  $or?: ReservationSearchClause[];
};

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
  stayTypes: Array<{ id: string; name: string }>;
};

function valueOf(params: Record<string, string | string[] | undefined>, key: string): string {
  const value = params[key];
  return typeof value === 'string' ? value.trim() : '';
}

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));
}

export function parseReservationFilters(
  params: Record<string, string | string[] | undefined>,
): ReservationListFilters {
  const statusValue = valueOf(params, 'status');
  const paymentValue = valueOf(params, 'paymentStatus');
  const stayTypeValue = valueOf(params, 'stayType');
  const arrivalValue = valueOf(params, 'arrivalDate');
  return {
    status: RESERVATION_STATUSES.find((status) => status === statusValue) ?? 'all',
    stayTypeId: Types.ObjectId.isValid(stayTypeValue) ? stayTypeValue : '',
    arrivalDate: isIsoDate(arrivalValue) ? arrivalValue : '',
    paymentStatus: RESERVATION_PAYMENT_STATUSES.find((status) => status === paymentValue) ?? '',
    search: valueOf(params, 'search').slice(0, 120),
  };
}

async function buildReservationQuery(filters: ReservationListFilters): Promise<ReservationQuery> {
  const query: ReservationQuery = {};
  if (filters.status !== 'all') {
    query.status = filters.status;
  }
  if (filters.stayTypeId) {
    query.stayType = new Types.ObjectId(filters.stayTypeId);
  }
  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }
  if (filters.arrivalDate) {
    const dayStart = new Date(`${filters.arrivalDate}T00:00:00`);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    query.checkIn = { $gte: dayStart, $lt: dayEnd };
  }
  if (filters.search) {
    const expression = new RegExp(escapeRegularExpression(filters.search), 'i');
    const [members, guests, sites] = await Promise.all([
      Member.find({ $or: [{ name: expression }, { email: expression }, { phone: expression }] })
        .select('_id')
        .limit(50)
        .lean(),
      Guest.find({ $or: [{ name: expression }, { email: expression }, { phone: expression }] })
        .select('_id')
        .limit(50)
        .lean(),
      Site.find({ $or: [{ code: expression }, { area: expression }] })
        .select('_id')
        .limit(50)
        .lean(),
    ]);
    const ownerIds = [...members, ...guests].map((record) => record._id);
    const clauses: ReservationSearchClause[] = [
      { guestOrMemberRef: { $in: ownerIds } },
      { siteRef: { $in: sites.map((site) => site._id) } },
      { source: expression },
    ];
    if (Types.ObjectId.isValid(filters.search)) {
      clauses.push({ _id: new Types.ObjectId(filters.search) });
    }
    query.$or = clauses;
  }
  return query;
}

export async function getReservations(
  filters: ReservationListFilters,
): Promise<ReservationListResult> {
  await connectToDatabase();
  const filter = await buildReservationQuery(filters);
  const [reservations, statusCounts, filterStayTypes] = await Promise.all([
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
    StayType.find({ active: true }).select('_id name').sort({ name: 1 }).lean(),
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
    stayTypes: filterStayTypes.map((stayType) => ({
      id: stayType._id.toString(),
      name: stayType.name,
    })),
  };
}
