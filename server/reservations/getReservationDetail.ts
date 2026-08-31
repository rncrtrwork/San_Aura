import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { Guest } from '@/models/Guest';
import { Member } from '@/models/Member';
import { Payment } from '@/models/Payment';
import { PropertySettings } from '@/models/PropertySettings';
import {
  Reservation,
  type ReservationPaymentStatus,
  type ReservationStatus,
} from '@/models/Reservation';
import { Site, type SiteType } from '@/models/Site';
import { StayType } from '@/models/StayType';

export type ReservationDetail = {
  id: string;
  ownerName: string;
  ownerType: 'Member' | 'Guest';
  ownerEmail: string;
  ownerPhone: string;
  siteCode: string;
  siteType: SiteType;
  siteArea: string;
  siteAmenities: string[];
  stayTypeName: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: ReservationPaymentStatus;
  status: ReservationStatus;
  source: string;
  internalNotes: string;
  checkoutReminder: string | null;
};

function dateInTimezone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function formatTime(value: string): string {
  const [hours = '0', minutes = '0'] = value.split(':');
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(
    new Date(2026, 0, 1, Number(hours), Number(minutes)),
  );
}

export async function getReservationDetail(
  reservationId: string,
): Promise<ReservationDetail | null> {
  if (!Types.ObjectId.isValid(reservationId)) return null;
  await connectToDatabase();
  const reservation = await Reservation.findById(reservationId).select('+internalNotes').lean();
  if (!reservation) return null;

  const [owner, site, stayType, paidResult, settings] = await Promise.all([
    reservation.guestOrMemberType === 'Member'
      ? Member.findById(reservation.guestOrMemberRef).select('name email phone').lean()
      : Guest.findById(reservation.guestOrMemberRef).select('name email phone').lean(),
    Site.findById(reservation.siteRef).select('code type area amenities').lean(),
    StayType.findById(reservation.stayType).select('name').lean(),
    Payment.aggregate<{ total: number }>([
      {
        $match: {
          reservationRef: reservation._id,
          entryKind: { $in: ['payment', 'credit'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    PropertySettings.findOne({ key: 'property' })
      .select('timezone checkOutTime keyReturnTime')
      .lean(),
  ]);
  if (!owner || !site || !stayType) return null;

  const timezone = settings?.timezone ?? 'America/Chicago';
  const isCheckoutDay =
    dateInTimezone(new Date(), timezone) === reservation.checkOut.toISOString().slice(0, 10);

  return {
    id: reservation._id.toString(),
    ownerName: owner.name,
    ownerType: reservation.guestOrMemberType,
    ownerEmail: owner.email,
    ownerPhone: owner.phone,
    siteCode: site.code,
    siteType: site.type,
    siteArea: site.area,
    siteAmenities: site.amenities,
    stayTypeName: stayType.name,
    checkIn: reservation.checkIn.toISOString(),
    checkOut: reservation.checkOut.toISOString(),
    guestsCount: reservation.guestsCount,
    totalAmount: reservation.totalAmount,
    paidAmount: paidResult[0]?.total ?? 0,
    paymentStatus: reservation.paymentStatus,
    status: reservation.status,
    source: reservation.source,
    internalNotes: reservation.internalNotes,
    checkoutReminder: isCheckoutDay
      ? `Checkout by ${formatTime(settings?.checkOutTime ?? '12:00')}; return keys by ${formatTime(settings?.keyReturnTime ?? '11:00')}.`
      : null,
  };
}
