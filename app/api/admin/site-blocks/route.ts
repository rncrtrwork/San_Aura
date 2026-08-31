import { Types } from 'mongoose';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import {
  SITE_BLOCK_KINDS,
  type SiteBlockCreateRequest,
  type SiteBlockCreateResponse,
} from '@/lib/siteBlockOptions';
import { Reservation } from '@/models/Reservation';
import { Site } from '@/models/Site';
import { SiteBlock } from '@/models/SiteBlock';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';

export const runtime = 'nodejs';

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const POST = requirePermission('reservations.write', async (request, staff) => {
  let body: SiteBlockCreateRequest;
  try {
    body = (await request.json()) as SiteBlockCreateRequest;
  } catch {
    return NextResponse.json<SiteBlockCreateResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }
  const startDate = body && typeof body.startDate === 'string' ? parseDate(body.startDate) : null;
  const selectedEndDate = body && typeof body.endDate === 'string' ? parseDate(body.endDate) : null;
  if (
    !body ||
    typeof body.siteId !== 'string' ||
    !Types.ObjectId.isValid(body.siteId) ||
    !startDate ||
    !selectedEndDate ||
    selectedEndDate < startDate ||
    !SITE_BLOCK_KINDS.includes(body.kind) ||
    typeof body.note !== 'string' ||
    body.note.length > 2000
  ) {
    return NextResponse.json<SiteBlockCreateResponse>(
      { message: 'Select a site, valid date range, and block reason.' },
      { status: 400 },
    );
  }
  const endDate = new Date(selectedEndDate);
  endDate.setDate(endDate.getDate() + 1);

  await connectToDatabase();
  const [site, reservationConflict, blockConflict] = await Promise.all([
    Site.findOne({ _id: body.siteId, active: true }).select('_id code').lean(),
    Reservation.exists({
      siteRef: body.siteId,
      checkIn: { $lt: endDate },
      checkOut: { $gt: startDate },
      status: { $in: ['pending', 'confirmed', 'checked-in'] },
    }),
    SiteBlock.exists({
      siteRef: body.siteId,
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    }),
  ]);
  if (!site) {
    return NextResponse.json<SiteBlockCreateResponse>(
      { message: 'Site not found.' },
      { status: 404 },
    );
  }
  if (reservationConflict) {
    return NextResponse.json<SiteBlockCreateResponse>(
      { message: 'This site already has a reservation during the selected dates.' },
      { status: 409 },
    );
  }
  if (blockConflict) {
    return NextResponse.json<SiteBlockCreateResponse>(
      { message: 'This site already has a blocked range during the selected dates.' },
      { status: 409 },
    );
  }

  const block = await SiteBlock.create({
    siteRef: site._id,
    startDate,
    endDate,
    kind: body.kind,
    note: body.note.trim(),
    createdBy: staff.userId,
  });
  await logActivity({
    actorId: staff.userId,
    action: 'create',
    entityType: 'SiteBlock',
    entityId: block._id,
    afterSnapshot: {
      siteId: site._id.toString(),
      siteCode: site.code,
      startDate,
      endDate,
      kind: block.kind,
      note: block.note,
    },
  });
  return NextResponse.json<SiteBlockCreateResponse>({ id: block._id.toString() }, { status: 201 });
});
