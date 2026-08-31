import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MEMBER_STATUSES, type MemberStatus } from '@/lib/memberOptions';
import type { MemberStatusUpdateRequest, MemberStatusUpdateResponse } from '@/lib/memberUpdates';
import { Member } from '@/models/Member';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ memberId: string }>;
};

function isMemberStatus(value: string): value is MemberStatus {
  return MEMBER_STATUSES.some((status) => status === value);
}

function validateUpdate(body: MemberStatusUpdateRequest): string | null {
  if (
    !body ||
    typeof body.status !== 'string' ||
    typeof body.renewalMonth !== 'number' ||
    !isMemberStatus(body.status) ||
    !Number.isInteger(body.renewalMonth) ||
    body.renewalMonth < 1 ||
    body.renewalMonth > 12
  ) {
    return 'Select a valid status and renewal month.';
  }
  return null;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'members.write');
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { memberId } = await context.params;
  if (!Types.ObjectId.isValid(memberId)) {
    return NextResponse.json<MemberStatusUpdateResponse>(
      { message: 'Member not found.' },
      { status: 404 },
    );
  }

  let body: MemberStatusUpdateRequest;
  try {
    body = (await request.json()) as MemberStatusUpdateRequest;
  } catch {
    return NextResponse.json<MemberStatusUpdateResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }
  const validationMessage = validateUpdate(body);
  if (validationMessage) {
    return NextResponse.json<MemberStatusUpdateResponse>(
      { message: validationMessage },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const member = await Member.findById(memberId).select('status renewalMonth');
  if (!member) {
    return NextResponse.json<MemberStatusUpdateResponse>(
      { message: 'Member not found.' },
      { status: 404 },
    );
  }

  const beforeStatus = member.status;
  const beforeRenewalMonth = member.renewalMonth;
  const changed = beforeStatus !== body.status || beforeRenewalMonth !== body.renewalMonth;
  if (changed) {
    member.status = body.status;
    member.renewalMonth = body.renewalMonth;
    await member.save();
    await logActivity({
      actorId: authorization.staff.userId,
      action: beforeStatus !== body.status ? 'status-change' : 'update',
      entityType: 'Member',
      entityId: member._id,
      beforeSnapshot: { status: beforeStatus, renewalMonth: beforeRenewalMonth },
      afterSnapshot: { status: member.status, renewalMonth: member.renewalMonth },
    });
  }

  return NextResponse.json<MemberStatusUpdateResponse>({ message: 'Member updated.' });
}
