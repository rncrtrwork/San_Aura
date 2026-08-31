import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { ReservationActionResponse } from '@/lib/reservationActions';
import { PropertySettings } from '@/models/PropertySettings';
import { Reservation } from '@/models/Reservation';
import { Site } from '@/models/Site';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { evaluateCheckInPolicy } from '@/server/reservations/checkInPolicy';

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
  const [reservation, settings] = await Promise.all([
    Reservation.findById(reservationId).select('checkIn status siteRef'),
    PropertySettings.findOne({ key: 'property' }).select('checkInTime timezone').lean(),
  ]);
  if (!reservation) {
    return NextResponse.json<ReservationActionResponse>(
      { message: 'Reservation not found.' },
      { status: 404 },
    );
  }
  if (reservation.status === 'checked-in') {
    return NextResponse.json<ReservationActionResponse>({
      message: 'Guest is already checked in.',
      status: reservation.status,
    });
  }
  if (reservation.status !== 'confirmed') {
    return NextResponse.json<ReservationActionResponse>(
      { message: 'Only confirmed reservations can be checked in.' },
      { status: 409 },
    );
  }
  const checkInTime = settings?.checkInTime ?? '14:00';
  const timezone = settings?.timezone ?? 'America/Chicago';
  let policy;
  try {
    policy = evaluateCheckInPolicy(reservation.checkIn, checkInTime, timezone);
  } catch {
    return NextResponse.json<ReservationActionResponse>(
      { message: 'The property timezone setting is invalid.' },
      { status: 500 },
    );
  }
  if (!policy.allowed) {
    return NextResponse.json<ReservationActionResponse>(
      { message: policy.message },
      { status: 409 },
    );
  }

  const beforeStatus = reservation.status;
  reservation.status = 'checked-in';
  await Promise.all([
    reservation.save(),
    Site.updateOne({ _id: reservation.siteRef }, { $set: { status: 'occupied' } }),
  ]);
  await logActivity({
    actorId: authorization.staff.userId,
    action: 'status-change',
    entityType: 'Reservation',
    entityId: reservation._id,
    beforeSnapshot: { status: beforeStatus },
    afterSnapshot: { status: reservation.status, checkedInAt: new Date() },
  });
  return NextResponse.json<ReservationActionResponse>({
    message: 'Guest checked in.',
    status: reservation.status,
  });
}
