import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { StayTypeMutationRequest, StayTypeMutationResponse } from '@/lib/stayTypes';
import { StayType } from '@/models/StayType';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { validateStayTypeMutation } from '@/server/stays/stayTypeValidation';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const authorization = await authorizeRequest(request, 'sites.write');
  if (!authorization.authorized) return authorization.response;

  let body: StayTypeMutationRequest;
  try {
    body = (await request.json()) as StayTypeMutationRequest;
  } catch {
    return NextResponse.json<StayTypeMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateStayTypeMutation(body);
  if (!validation.valid) {
    return NextResponse.json<StayTypeMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const existing = await StayType.exists({ slug: validation.data.slug });
  if (existing) {
    return NextResponse.json<StayTypeMutationResponse>(
      { message: 'A stay type with this slug already exists.' },
      { status: 409 },
    );
  }

  const stayType = await StayType.create(validation.data);
  await logActivity({
    actorId: authorization.staff.userId,
    action: 'create',
    entityType: 'StayType',
    entityId: stayType._id,
    afterSnapshot: {
      name: stayType.name,
      slug: stayType.slug,
      siteType: stayType.siteType,
      active: stayType.active,
    },
  });

  return NextResponse.json<StayTypeMutationResponse>(
    { id: stayType._id.toString(), message: 'Stay type created.' },
    { status: 201 },
  );
}
