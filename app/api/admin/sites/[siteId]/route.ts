import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import type {
  SiteMutationRequest,
  SiteMutationResponse,
  SiteStatusUpdateRequest,
} from '@/lib/adminSites';
import { connectToDatabase } from '@/lib/db';
import { Site } from '@/models/Site';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { validateSiteMutation } from '@/server/sites/siteValidation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ siteId: string }>;
};

function isStatusOnlyUpdate(
  body: SiteMutationRequest | SiteStatusUpdateRequest,
): body is SiteStatusUpdateRequest {
  return 'active' in body && !('code' in body);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'sites.write');
  if (!authorization.authorized) return authorization.response;

  const { siteId } = await context.params;
  if (!Types.ObjectId.isValid(siteId)) {
    return NextResponse.json<SiteMutationResponse>(
      { message: 'Site not found.' },
      { status: 404 },
    );
  }

  let body: SiteMutationRequest | SiteStatusUpdateRequest;
  try {
    body = (await request.json()) as SiteMutationRequest | SiteStatusUpdateRequest;
  } catch {
    return NextResponse.json<SiteMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const site = await Site.findById(siteId).select(
    'code type area amenities status maintenanceNote length hookups mapPosition active',
  );
  if (!site) {
    return NextResponse.json<SiteMutationResponse>(
      { message: 'Site not found.' },
      { status: 404 },
    );
  }

  if (isStatusOnlyUpdate(body)) {
    if (typeof body.active !== 'boolean') {
      return NextResponse.json<SiteMutationResponse>(
        { message: 'Choose whether this site is active.' },
        { status: 400 },
      );
    }

    const beforeActive = site.active;
    if (beforeActive !== body.active) {
      site.active = body.active;
      await site.save();
      await logActivity({
        actorId: authorization.staff.userId,
        action: 'status-change',
        entityType: 'Site',
        entityId: site._id,
        beforeSnapshot: { active: beforeActive },
        afterSnapshot: { active: site.active },
      });
    }

    return NextResponse.json<SiteMutationResponse>({
      message: `${site.code} ${site.active ? 'activated' : 'deactivated'}.`,
      active: site.active,
    });
  }

  const validation = validateSiteMutation(body);
  if (!validation.valid) {
    return NextResponse.json<SiteMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  const duplicate = await Site.exists({
    _id: { $ne: site._id },
    code: validation.data.code,
  });
  if (duplicate) {
    return NextResponse.json<SiteMutationResponse>(
      { message: 'A site with this code already exists.' },
      { status: 409 },
    );
  }

  const beforeSnapshot = {
    code: site.code,
    type: site.type,
    area: site.area,
    status: site.status,
    active: site.active,
    mapX: site.mapPosition?.x ?? null,
    mapY: site.mapPosition?.y ?? null,
  };
  site.set(validation.data);
  await site.save();
  await logActivity({
    actorId: authorization.staff.userId,
    action: beforeSnapshot.active !== site.active ? 'status-change' : 'update',
    entityType: 'Site',
    entityId: site._id,
    beforeSnapshot,
    afterSnapshot: {
      code: site.code,
      type: site.type,
      area: site.area,
      status: site.status,
      active: site.active,
      mapX: site.mapPosition?.x ?? null,
      mapY: site.mapPosition?.y ?? null,
    },
  });

  return NextResponse.json<SiteMutationResponse>({ message: 'Site saved.' });
}
