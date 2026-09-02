import { NextResponse, type NextRequest } from 'next/server';
import type { SiteMutationRequest, SiteMutationResponse } from '@/lib/adminSites';
import { connectToDatabase } from '@/lib/db';
import { Site } from '@/models/Site';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { validateSiteMutation } from '@/server/sites/siteValidation';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const authorization = await authorizeRequest(request, 'sites.write');
  if (!authorization.authorized) return authorization.response;

  let body: SiteMutationRequest;
  try {
    body = (await request.json()) as SiteMutationRequest;
  } catch {
    return NextResponse.json<SiteMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateSiteMutation(body);
  if (!validation.valid) {
    return NextResponse.json<SiteMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const existing = await Site.exists({ code: validation.data.code });
  if (existing) {
    return NextResponse.json<SiteMutationResponse>(
      { message: 'A site with this code already exists.' },
      { status: 409 },
    );
  }

  const site = await Site.create(validation.data);
  await logActivity({
    actorId: authorization.staff.userId,
    action: 'create',
    entityType: 'Site',
    entityId: site._id,
    afterSnapshot: {
      code: site.code,
      type: site.type,
      area: site.area,
      status: site.status,
      active: site.active,
    },
  });

  return NextResponse.json<SiteMutationResponse>(
    { id: site._id.toString(), message: 'Site created.' },
    { status: 201 },
  );
}
