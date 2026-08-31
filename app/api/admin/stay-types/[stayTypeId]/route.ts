import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type {
  StayTypeMutationRequest,
  StayTypeMutationResponse,
  StayTypeStatusUpdateRequest,
  StayTypeStatusUpdateResponse,
} from '@/lib/stayTypes';
import { StayType } from '@/models/StayType';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { validateStayTypeMutation } from '@/server/stays/stayTypeValidation';

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

function isStatusOnlyUpdate(
  body: StayTypeMutationRequest | StayTypeStatusUpdateRequest,
): body is StayTypeStatusUpdateRequest {
  return 'active' in body && !('name' in body);
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

  let body: StayTypeMutationRequest | StayTypeStatusUpdateRequest;
  try {
    body = (await request.json()) as StayTypeMutationRequest | StayTypeStatusUpdateRequest;
  } catch {
    return NextResponse.json<StayTypeStatusUpdateResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const stayType = await StayType.findById(stayTypeId).select(
    'name slug siteType description amenities baseRate weekendRate extraGuestFee minimumStay cleaningFee active',
  );
  if (!stayType) {
    return NextResponse.json<StayTypeStatusUpdateResponse>(
      { message: 'Stay type not found.' },
      { status: 404 },
    );
  }

  if (isStatusOnlyUpdate(body)) {
    const validationMessage = validateStatusUpdate(body);
    if (validationMessage) {
      return NextResponse.json<StayTypeStatusUpdateResponse>(
        { message: validationMessage },
        { status: 400 },
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

  const validation = validateStayTypeMutation(body);
  if (!validation.valid) {
    return NextResponse.json<StayTypeMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }
  const duplicate = await StayType.exists({
    _id: { $ne: stayType._id },
    slug: validation.data.slug,
  });
  if (duplicate) {
    return NextResponse.json<StayTypeMutationResponse>(
      { message: 'A stay type with this slug already exists.' },
      { status: 409 },
    );
  }

  const beforeSnapshot = {
    name: stayType.name,
    slug: stayType.slug,
    siteType: stayType.siteType,
    minimumStay: stayType.minimumStay,
    active: stayType.active,
  };
  stayType.set(validation.data);
  await stayType.save();
  await logActivity({
    actorId: authorization.staff.userId,
    action: beforeSnapshot.active !== stayType.active ? 'status-change' : 'update',
    entityType: 'StayType',
    entityId: stayType._id,
    beforeSnapshot,
    afterSnapshot: {
      name: stayType.name,
      slug: stayType.slug,
      siteType: stayType.siteType,
      minimumStay: stayType.minimumStay,
      active: stayType.active,
    },
  });

  return NextResponse.json<StayTypeMutationResponse>({ message: 'Stay type updated.' });
}
