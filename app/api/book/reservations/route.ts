import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import type { PublicBookingRequest, PublicBookingResponse } from '@/lib/publicBooking';
import { calculatePublicReservationTotal, validatePublicBookingRequest } from '@/lib/publicBooking';
import { connectToDatabase } from '@/lib/db';
import { Guest } from '@/models/Guest';
import { Reservation } from '@/models/Reservation';
import { Site } from '@/models/Site';
import { SiteBlock } from '@/models/SiteBlock';
import { StayType } from '@/models/StayType';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: PublicBookingRequest;
  try {
    body = (await request.json()) as PublicBookingRequest;
  } catch {
    return NextResponse.json<PublicBookingResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validatePublicBookingRequest(body);
  if (!validation.valid) {
    return NextResponse.json<PublicBookingResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }
  if (
    !Types.ObjectId.isValid(validation.data.stayTypeId) ||
    !Types.ObjectId.isValid(validation.data.siteId)
  ) {
    return NextResponse.json<PublicBookingResponse>(
      { message: 'Choose a valid stay type and site.' },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const [stayType, site, conflict, blocked] = await Promise.all([
    StayType.findOne({ _id: validation.data.stayTypeId, active: true }).lean(),
    Site.findOne({
      _id: validation.data.siteId,
      active: true,
      status: { $nin: ['maintenance', 'blocked'] },
    }).lean(),
    Reservation.exists({
      siteRef: validation.data.siteId,
      checkIn: { $lt: validation.data.checkOutDate },
      checkOut: { $gt: validation.data.checkInDate },
      status: { $in: ['pending', 'confirmed', 'checked-in'] },
    }),
    SiteBlock.exists({
      siteRef: validation.data.siteId,
      startDate: { $lt: validation.data.checkOutDate },
      endDate: { $gt: validation.data.checkInDate },
    }),
  ]);
  if (!stayType || !site || stayType.siteType !== site.type) {
    return NextResponse.json<PublicBookingResponse>(
      { message: 'The selected stay type and site are unavailable.' },
      { status: 400 },
    );
  }
  if (validation.data.nights < stayType.minimumStay) {
    return NextResponse.json<PublicBookingResponse>(
      { message: `This stay requires at least ${stayType.minimumStay} nights.` },
      { status: 400 },
    );
  }
  if (conflict || blocked) {
    return NextResponse.json<PublicBookingResponse>(
      { message: 'The selected site is not available for those dates.' },
      { status: 409 },
    );
  }

  const guest = await Guest.findOneAndUpdate(
    { email: validation.data.guestEmail },
    {
      $set: {
        name: validation.data.guestName,
        email: validation.data.guestEmail,
        phone: validation.data.guestPhone,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  const totalAmount = calculatePublicReservationTotal(
    validation.data.checkInDate,
    validation.data.checkOutDate,
    validation.data.guestsCount,
    stayType,
  );
  const reservation = await Reservation.create({
    guestOrMemberType: 'Guest',
    guestOrMemberRef: guest._id,
    siteRef: site._id,
    stayType: stayType._id,
    checkIn: validation.data.checkInDate,
    checkOut: validation.data.checkOutDate,
    guestsCount: validation.data.guestsCount,
    totalAmount,
    paymentStatus: 'unpaid',
    paymentMethodNote: '',
    source: 'public-website',
    internalNotes: 'Pending public website booking request. Staff must confirm before arrival.',
    status: 'pending',
  });
  await Guest.updateOne({ _id: guest._id }, { $addToSet: { reservationIds: reservation._id } });

  return NextResponse.json<PublicBookingResponse>(
    {
      id: reservation._id.toString(),
      totalAmount,
      message: 'Booking request received. Resort staff will confirm availability.',
    },
    { status: 201 },
  );
}
