import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { SiteMapPositionRequest, SiteMapPositionResponse } from '@/lib/mapEditor';
import { Site } from '@/models/Site';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { isAdminRole } from '@/server/auth/isAdminRole';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest) {
  const authorization = await authorizeRequest(request, 'sites.write');
  if (!authorization.authorized) return authorization.response;
  if (!(await isAdminRole(authorization.staff.roleId))) {
    return NextResponse.json<SiteMapPositionResponse>(
      { message: 'Only administrators can edit the resort map.' },
      { status: 403 },
    );
  }
  let body: SiteMapPositionRequest;
  try {
    body = (await request.json()) as SiteMapPositionRequest;
  } catch {
    return NextResponse.json<SiteMapPositionResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }
  if (
    !body ||
    !Array.isArray(body.positions) ||
    body.positions.length === 0 ||
    body.positions.length > 500 ||
    body.positions.some(
      (position) =>
        !position ||
        typeof position.siteId !== 'string' ||
        !Types.ObjectId.isValid(position.siteId) ||
        typeof position.x !== 'number' ||
        typeof position.y !== 'number' ||
        !Number.isFinite(position.x) ||
        !Number.isFinite(position.y) ||
        position.x < 0 ||
        position.x > 100 ||
        position.y < 0 ||
        position.y > 100,
    )
  ) {
    return NextResponse.json<SiteMapPositionResponse>(
      { message: 'Submit one or more valid site positions.' },
      { status: 400 },
    );
  }
  const uniqueUpdates = Array.from(
    new Map(body.positions.map((position) => [position.siteId, position])).values(),
  );

  await connectToDatabase();
  const sites = await Site.find({
    _id: { $in: uniqueUpdates.map((position) => position.siteId) },
    active: true,
  })
    .select('mapPosition')
    .lean();
  if (sites.length !== uniqueUpdates.length) {
    return NextResponse.json<SiteMapPositionResponse>(
      { message: 'One or more selected sites no longer exist.' },
      { status: 404 },
    );
  }
  const sitesById = new Map(sites.map((site) => [site._id.toString(), site]));
  await Promise.all(
    uniqueUpdates.map(async (position) => {
      const site = sitesById.get(position.siteId)!;
      await Site.updateOne(
        { _id: position.siteId },
        { $set: { mapPosition: { x: position.x, y: position.y } } },
      );
      await logActivity({
        actorId: authorization.staff.userId,
        action: 'update',
        entityType: 'Site',
        entityId: site._id,
        beforeSnapshot: {
          mapX: site.mapPosition?.x ?? null,
          mapY: site.mapPosition?.y ?? null,
        },
        afterSnapshot: { mapX: position.x, mapY: position.y },
      });
    }),
  );
  return NextResponse.json<SiteMapPositionResponse>({
    message: `${uniqueUpdates.length} marker${uniqueUpdates.length === 1 ? '' : 's'} saved.`,
    updated: uniqueUpdates.length,
  });
}
