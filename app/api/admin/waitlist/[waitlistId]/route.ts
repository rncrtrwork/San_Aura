import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { WaitlistUpdateRequest, WaitlistUpdateResponse } from '@/lib/waitlistActions';
import { WAITLIST_STATUSES, Waitlist } from '@/models/Waitlist';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ waitlistId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'reservations.write');
  if (!authorization.authorized) return authorization.response;
  const { waitlistId } = await context.params;
  if (!Types.ObjectId.isValid(waitlistId)) {
    return NextResponse.json<WaitlistUpdateResponse>(
      { message: 'Waitlist request not found.' },
      { status: 404 },
    );
  }
  let body: WaitlistUpdateRequest;
  try {
    body = (await request.json()) as WaitlistUpdateRequest;
  } catch {
    return NextResponse.json<WaitlistUpdateResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }
  if (
    !body ||
    !WAITLIST_STATUSES.includes(body.status) ||
    typeof body.notes !== 'string' ||
    body.notes.length > 3000
  ) {
    return NextResponse.json<WaitlistUpdateResponse>(
      { message: 'Select a valid status and keep notes under 3,000 characters.' },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const entry = await Waitlist.findById(waitlistId);
  if (!entry) {
    return NextResponse.json<WaitlistUpdateResponse>(
      { message: 'Waitlist request not found.' },
      { status: 404 },
    );
  }
  const beforeStatus = entry.status;
  const beforeNotes = entry.notes;
  entry.status = body.status;
  entry.notes = body.notes.trim();
  await entry.save();
  await logActivity({
    actorId: authorization.staff.userId,
    action: 'update',
    entityType: 'Waitlist',
    entityId: entry._id,
    beforeSnapshot: { status: beforeStatus, notes: beforeNotes },
    afterSnapshot: { status: entry.status, notes: entry.notes },
  });
  return NextResponse.json<WaitlistUpdateResponse>({
    message: 'Waitlist request updated.',
    status: entry.status,
  });
}
