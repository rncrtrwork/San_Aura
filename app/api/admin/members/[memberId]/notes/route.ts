import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { MemberNotesUpdateRequest, MemberNotesUpdateResponse } from '@/lib/memberNotes';
import { Member } from '@/models/Member';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ memberId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'members.write');
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { memberId } = await context.params;
  if (!Types.ObjectId.isValid(memberId)) {
    return NextResponse.json<MemberNotesUpdateResponse>(
      { message: 'Member not found.' },
      { status: 404 },
    );
  }

  let body: MemberNotesUpdateRequest;
  try {
    body = (await request.json()) as MemberNotesUpdateRequest;
  } catch {
    return NextResponse.json<MemberNotesUpdateResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }
  if (!body || typeof body.notes !== 'string' || body.notes.length > 10_000) {
    return NextResponse.json<MemberNotesUpdateResponse>(
      { message: 'Notes must be 10,000 characters or fewer.' },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const member = await Member.findById(memberId).select('+staffNotes');
  if (!member) {
    return NextResponse.json<MemberNotesUpdateResponse>(
      { message: 'Member not found.' },
      { status: 404 },
    );
  }

  const previousLength = member.staffNotes.length;
  member.staffNotes = body.notes.trim();
  await member.save();
  await logActivity({
    actorId: authorization.staff.userId,
    action: 'update',
    entityType: 'Member',
    entityId: member._id,
    beforeSnapshot: { staffNotesLength: previousLength },
    afterSnapshot: { staffNotesLength: member.staffNotes.length },
  });

  return NextResponse.json<MemberNotesUpdateResponse>({ message: 'Staff notes saved.' });
}
