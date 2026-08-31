import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { AddonMutationRequest, AddonMutationResponse } from '@/lib/addons';
import { Addon } from '@/models/Addon';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { validateAddonMutation } from '@/server/stays/addonValidation';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const authorization = await authorizeRequest(request, 'sites.write');
  if (!authorization.authorized) return authorization.response;

  let body: AddonMutationRequest;
  try {
    body = (await request.json()) as AddonMutationRequest;
  } catch {
    return NextResponse.json<AddonMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateAddonMutation(body);
  if (!validation.valid) {
    return NextResponse.json<AddonMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const addon = await Addon.create(validation.data);
  await logActivity({
    actorId: authorization.staff.userId,
    action: 'create',
    entityType: 'Addon',
    entityId: addon._id,
    afterSnapshot: {
      name: addon.name,
      type: addon.type,
      price: addon.price,
      active: addon.active,
    },
  });

  return NextResponse.json<AddonMutationResponse>(
    { id: addon._id.toString(), message: 'Add-on created.' },
    { status: 201 },
  );
}
