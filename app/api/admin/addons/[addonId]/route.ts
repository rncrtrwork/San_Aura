import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import type {
  AddonMutationRequest,
  AddonMutationResponse,
  AddonStatusUpdateRequest,
} from '@/lib/addons';
import { connectToDatabase } from '@/lib/db';
import { Addon } from '@/models/Addon';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { validateAddonMutation } from '@/server/stays/addonValidation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ addonId: string }>;
};

function isStatusOnlyUpdate(
  body: AddonMutationRequest | AddonStatusUpdateRequest,
): body is AddonStatusUpdateRequest {
  return 'active' in body && !('name' in body);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'sites.write');
  if (!authorization.authorized) return authorization.response;

  const { addonId } = await context.params;
  if (!Types.ObjectId.isValid(addonId)) {
    return NextResponse.json<AddonMutationResponse>(
      { message: 'Add-on not found.' },
      { status: 404 },
    );
  }

  let body: AddonMutationRequest | AddonStatusUpdateRequest;
  try {
    body = (await request.json()) as AddonMutationRequest | AddonStatusUpdateRequest;
  } catch {
    return NextResponse.json<AddonMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const addon = await Addon.findById(addonId).select(
    'name description type price partnerUrl active',
  );
  if (!addon) {
    return NextResponse.json<AddonMutationResponse>(
      { message: 'Add-on not found.' },
      { status: 404 },
    );
  }

  if (isStatusOnlyUpdate(body)) {
    if (typeof body.active !== 'boolean') {
      return NextResponse.json<AddonMutationResponse>(
        { message: 'Choose whether this add-on is active.' },
        { status: 400 },
      );
    }
    const beforeActive = addon.active;
    if (beforeActive !== body.active) {
      addon.active = body.active;
      await addon.save();
      await logActivity({
        actorId: authorization.staff.userId,
        action: 'status-change',
        entityType: 'Addon',
        entityId: addon._id,
        beforeSnapshot: { active: beforeActive },
        afterSnapshot: { active: addon.active },
      });
    }
    return NextResponse.json<AddonMutationResponse>({
      message: `${addon.name} ${addon.active ? 'activated' : 'deactivated'}.`,
      active: addon.active,
    });
  }

  const validation = validateAddonMutation(body);
  if (!validation.valid) {
    return NextResponse.json<AddonMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  const beforeSnapshot = {
    name: addon.name,
    type: addon.type,
    price: addon.price,
    active: addon.active,
  };
  addon.set(validation.data);
  await addon.save();
  await logActivity({
    actorId: authorization.staff.userId,
    action: beforeSnapshot.active !== addon.active ? 'status-change' : 'update',
    entityType: 'Addon',
    entityId: addon._id,
    beforeSnapshot,
    afterSnapshot: {
      name: addon.name,
      type: addon.type,
      price: addon.price,
      active: addon.active,
    },
  });

  return NextResponse.json<AddonMutationResponse>({ message: 'Add-on saved.' });
}
