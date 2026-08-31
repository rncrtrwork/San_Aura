import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { SiteBlockRequest, SiteBlockResponse } from '@/lib/siteActions';
import { Reservation } from '@/models/Reservation';
import { Site } from '@/models/Site';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ siteId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'sites.write');
  if (!authorization.authorized) return authorization.response;
  const { siteId } = await context.params;
  if (!Types.ObjectId.isValid(siteId)) {
    return NextResponse.json<SiteBlockResponse>({ message: 'Site not found.' }, { status: 404 });
  }
  let body: SiteBlockRequest;
  try {
    body = (await request.json()) as SiteBlockRequest;
  } catch {
    return NextResponse.json<SiteBlockResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }
  if (!body || typeof body.note !== 'string' || !body.note.trim() || body.note.length > 2000) {
    return NextResponse.json<SiteBlockResponse>(
      { message: 'A blocking reason under 2,000 characters is required.' },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const [site, reservationConflict] = await Promise.all([
    Site.findOne({ _id: siteId, active: true }),
    Reservation.exists({
      siteRef: siteId,
      checkOut: { $gt: new Date() },
      status: { $in: ['pending', 'confirmed', 'checked-in'] },
    }),
  ]);
  if (!site) {
    return NextResponse.json<SiteBlockResponse>({ message: 'Site not found.' }, { status: 404 });
  }
  if (reservationConflict) {
    return NextResponse.json<SiteBlockResponse>(
      { message: 'Resolve active and future reservations before blocking this site.' },
      { status: 409 },
    );
  }
  if (site.status === 'blocked') {
    return NextResponse.json<SiteBlockResponse>({
      message: 'This site is already blocked.',
      status: site.status,
    });
  }

  const beforeStatus = site.status;
  const beforeNote = site.maintenanceNote;
  site.status = 'blocked';
  site.maintenanceNote = body.note.trim();
  await site.save();
  await logActivity({
    actorId: authorization.staff.userId,
    action: 'status-change',
    entityType: 'Site',
    entityId: site._id,
    beforeSnapshot: { status: beforeStatus, maintenanceNote: beforeNote },
    afterSnapshot: { status: site.status, maintenanceNote: site.maintenanceNote },
  });
  return NextResponse.json<SiteBlockResponse>({
    message: 'Site blocked.',
    status: site.status,
  });
}
