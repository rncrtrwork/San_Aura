import { Types } from 'mongoose';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { ReservationCreateRequest, ReservationCreateResponse } from '@/lib/reservationForms';
import { Guest } from '@/models/Guest';
import { Member } from '@/models/Member';
import { Reservation } from '@/models/Reservation';
import { Site } from '@/models/Site';
import { SiteBlock } from '@/models/SiteBlock';
import { StayType } from '@/models/StayType';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';

export const runtime = 'nodejs';

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateRequest(body: ReservationCreateRequest): string | null {
  if (
    !body ||
    (body.ownerMode !== 'existing' && body.ownerMode !== 'newGuest') ||
    (body.ownerType !== 'Member' && body.ownerType !== 'Guest') ||
    typeof body.ownerId !== 'string' ||
    typeof body.guestName !== 'string' ||
    typeof body.guestEmail !== 'string' ||
    typeof body.guestPhone !== 'string' ||
    typeof body.stayTypeId !== 'string' ||
    typeof body.siteId !== 'string' ||
    typeof body.checkIn !== 'string' ||
    typeof body.checkOut !== 'string' ||
    typeof body.guestsCount !== 'number'
  ) {
    return 'Reservation details are incomplete or malformed.';
  }
  if (!Types.ObjectId.isValid(body.stayTypeId) || !Types.ObjectId.isValid(body.siteId)) {
    return 'Select a valid stay type and site.';
  }
  if (!Number.isInteger(body.guestsCount) || body.guestsCount < 1 || body.guestsCount > 100) {
    return 'Guest count must be between 1 and 100.';
  }
  if (body.ownerMode === 'existing' && !Types.ObjectId.isValid(body.ownerId)) {
    return 'Select an existing member or guest.';
  }
  if (
    body.ownerMode === 'newGuest' &&
    (!body.guestName.trim() ||
      !body.guestPhone.trim() ||
      body.guestName.length > 120 ||
      body.guestPhone.length > 30)
  ) {
    return 'New guest name and phone are required.';
  }
  if (
    body.guestEmail &&
    (!/^\S+@\S+\.\S+$/.test(body.guestEmail) || body.guestEmail.length > 254)
  ) {
    return 'Enter a valid guest email address.';
  }
  const checkIn = parseDate(body.checkIn);
  const checkOut = parseDate(body.checkOut);
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return 'Check-out must be after check-in.';
  }
  return null;
}

function calculateTotal(
  checkIn: Date,
  checkOut: Date,
  guestsCount: number,
  rates: { baseRate: number; weekendRate: number; extraGuestFee: number; cleaningFee: number },
): number {
  let total = rates.cleaningFee;
  const cursor = new Date(checkIn);
  while (cursor < checkOut) {
    const day = cursor.getDay();
    total += day === 5 || day === 6 ? rates.weekendRate : rates.baseRate;
    total += Math.max(0, guestsCount - 2) * rates.extraGuestFee;
    cursor.setDate(cursor.getDate() + 1);
  }
  return Math.round(total * 100) / 100;
}

export const POST = requirePermission('reservations.write', async (request, staff) => {
  let body: ReservationCreateRequest;
  try {
    body = (await request.json()) as ReservationCreateRequest;
  } catch {
    return NextResponse.json<ReservationCreateResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }
  const validationMessage = validateRequest(body);
  if (validationMessage) {
    return NextResponse.json<ReservationCreateResponse>(
      { message: validationMessage },
      { status: 400 },
    );
  }

  const checkIn = parseDate(body.checkIn)!;
  const checkOut = parseDate(body.checkOut)!;
  await connectToDatabase();
  const [stayType, site, conflict, blocked] = await Promise.all([
    StayType.findOne({ _id: body.stayTypeId, active: true }).lean(),
    Site.findOne({
      _id: body.siteId,
      active: true,
      status: { $nin: ['maintenance', 'blocked'] },
    }).lean(),
    Reservation.exists({
      siteRef: body.siteId,
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
      status: { $in: ['pending', 'confirmed', 'checked-in'] },
    }),
    SiteBlock.exists({
      siteRef: body.siteId,
      startDate: { $lt: checkOut },
      endDate: { $gt: checkIn },
    }),
  ]);
  if (!stayType || !site || stayType.siteType !== site.type) {
    return NextResponse.json<ReservationCreateResponse>(
      { message: 'The selected stay type and site are unavailable.' },
      { status: 400 },
    );
  }
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
  if (nights < stayType.minimumStay) {
    return NextResponse.json<ReservationCreateResponse>(
      { message: `This stay requires at least ${stayType.minimumStay} nights.` },
      { status: 400 },
    );
  }
  if (conflict || blocked) {
    return NextResponse.json<ReservationCreateResponse>(
      { message: 'The selected site is not available for those dates.' },
      { status: 409 },
    );
  }

  let ownerType = body.ownerType;
  let ownerId = body.ownerId;
  if (body.ownerMode === 'existing') {
    const ownerExists =
      body.ownerType === 'Member'
        ? await Member.exists({ _id: body.ownerId })
        : await Guest.exists({ _id: body.ownerId });
    if (!ownerExists) {
      return NextResponse.json<ReservationCreateResponse>(
        { message: 'The selected member or guest no longer exists.' },
        { status: 404 },
      );
    }
  } else {
    const guest = await Guest.create({
      name: body.guestName.trim(),
      email: body.guestEmail.trim().toLowerCase(),
      phone: body.guestPhone.trim(),
    });
    ownerType = 'Guest';
    ownerId = guest._id.toString();
    await logActivity({
      actorId: staff.userId,
      action: 'create',
      entityType: 'Guest',
      entityId: guest._id,
      afterSnapshot: { name: guest.name },
    });
  }

  const reservation = await Reservation.create({
    guestOrMemberType: ownerType,
    guestOrMemberRef: ownerId,
    siteRef: site._id,
    stayType: stayType._id,
    checkIn,
    checkOut,
    guestsCount: body.guestsCount,
    totalAmount: calculateTotal(checkIn, checkOut, body.guestsCount, stayType),
    paymentStatus: 'unpaid',
    source: 'staff',
    status: 'pending',
  });
  if (ownerType === 'Guest') {
    await Guest.updateOne({ _id: ownerId }, { $addToSet: { reservationIds: reservation._id } });
  }
  await logActivity({
    actorId: staff.userId,
    action: 'create',
    entityType: 'Reservation',
    entityId: reservation._id,
    afterSnapshot: {
      ownerType,
      ownerId,
      siteId: site._id.toString(),
      checkIn,
      checkOut,
      totalAmount: reservation.totalAmount,
      status: reservation.status,
    },
  });
  return NextResponse.json<ReservationCreateResponse>(
    { id: reservation._id.toString() },
    { status: 201 },
  );
});
