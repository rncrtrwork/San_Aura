import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { StayTypeStatusUpdateRequest, StayTypeStatusUpdateResponse } from '@/lib/stayTypes';
import { StayType } from '@/models/StayType';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ stayTypeId: string }>;
};

function validateStatusUpdate(body: StayTypeStatusUpdateRequest): string | null {
  if (!body || typeof body.active !== 'boolean') {
    return 'Choose whether this stay type is active.';
  }
  return null;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'sites.write');
  if (!authorization.authorized) return authorization.response;

  const { stayTypeId } = await context.params;
  if (!Types.ObjectId.isValid(stayTypeId)) {
    return NextResponse.json<StayTypeStatusUpdateResponse>(
      { message: 'Stay type not found.' },
      { status: 404 },
    );
  }

  let body: StayTypeStatusUpdateRequest;
  try {
    body = (await request.json()) as StayTypeStatusUpdateRequest;
  } catch {
    return NextResponse.json<StayTypeStatusUpdateResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validationMessage = validateStatusUpdate(body);
  if (validationMessage) {
    return NextResponse.json<StayTypeStatusUpdateResponse>(
      { message: validationMessage },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const stayType = await StayType.findById(stayTypeId).select('active name');
  if (!stayType) {
    return NextResponse.json<StayTypeStatusUpdateResponse>(
      { message: 'Stay type not found.' },
      { status: 404 },
    );
  }

  const beforeActive = stayType.active;
  if (beforeActive !== body.active) {
    stayType.active = body.active;
    await stayType.save();
    await logActivity({
      actorId: authorization.staff.userId,
      action: 'status-change',
      entityType: 'StayType',
      entityId: stayType._id,
      beforeSnapshot: { active: beforeActive },
      afterSnapshot: { active: stayType.active },
    });
  }

  return NextResponse.json<StayTypeStatusUpdateResponse>({
    message: `${stayType.name} ${stayType.active ? 'activated' : 'deactivated'}.`,
    active: stayType.active,
  });
}
