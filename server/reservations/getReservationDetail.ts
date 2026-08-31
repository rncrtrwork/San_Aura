import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { Guest } from '@/models/Guest';
import { Member } from '@/models/Member';
import { Payment } from '@/models/Payment';
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
};

export async function getReservationDetail(
  reservationId: string,
): Promise<ReservationDetail | null> {
  if (!Types.ObjectId.isValid(reservationId)) return null;
  await connectToDatabase();
  const reservation = await Reservation.findById(reservationId).select('+internalNotes').lean();
  if (!reservation) return null;

  const [owner, site, stayType, paidResult] = await Promise.all([
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
  ]);
  if (!owner || !site || !stayType) return null;

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
  };
}
