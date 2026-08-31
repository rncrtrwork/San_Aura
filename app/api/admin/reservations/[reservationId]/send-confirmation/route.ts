import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { ReservationActionResponse } from '@/lib/reservationActions';
import { Guest } from '@/models/Guest';
import { Member } from '@/models/Member';
import { Reservation } from '@/models/Reservation';
import { Site } from '@/models/Site';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { sendReservationConfirmation } from '@/server/email/sendReservationConfirmation';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ reservationId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'reservations.write');
  if (!authorization.authorized) return authorization.response;
  const { reservationId } = await context.params;
  if (!Types.ObjectId.isValid(reservationId)) {
    return NextResponse.json<ReservationActionResponse>(
      { message: 'Reservation not found.' },
      { status: 404 },
    );
  }
  await connectToDatabase();
  const reservation = await Reservation.findById(reservationId).lean();
  if (!reservation || reservation.status === 'cancelled') {
    return NextResponse.json<ReservationActionResponse>(
      { message: 'Reservation not found or cancelled.' },
      { status: 404 },
    );
  }
  const [owner, site] = await Promise.all([
    reservation.guestOrMemberType === 'Member'
      ? Member.findById(reservation.guestOrMemberRef).select('name email').lean()
      : Guest.findById(reservation.guestOrMemberRef).select('name email').lean(),
    Site.findById(reservation.siteRef).select('code').lean(),
  ]);
  if (!owner?.email || !site) {
    return NextResponse.json<ReservationActionResponse>(
      { message: 'A guest email and valid site are required.' },
      { status: 400 },
    );
  }
  const result = await sendReservationConfirmation({
    recipientEmail: owner.email,
    recipientName: owner.name,
    reservationId,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    siteCode: site.code,
  });
  if (!result.accepted) {
    return NextResponse.json<ReservationActionResponse>(
      { message: 'Confirmation could not be prepared.' },
      { status: 500 },
    );
  }
  await logActivity({
    actorId: authorization.staff.userId,
    action: 'send',
    entityType: 'Reservation',
    entityId: reservation._id,
    afterSnapshot: { confirmationRecipient: owner.email, deliveryMode: result.deliveryMode },
  });
  return NextResponse.json<ReservationActionResponse>({
    message: 'Confirmation prepared for delivery.',
  });
}
