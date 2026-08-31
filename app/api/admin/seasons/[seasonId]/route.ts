import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { SeasonMutationRequest, SeasonMutationResponse } from '@/lib/seasons';
import { Season } from '@/models/Season';
import { StayType } from '@/models/StayType';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { validateSeasonMutation } from '@/server/stays/seasonValidation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ seasonId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'sites.write');
  if (!authorization.authorized) return authorization.response;

  const { seasonId } = await context.params;
  if (!Types.ObjectId.isValid(seasonId)) {
    return NextResponse.json<SeasonMutationResponse>(
      { message: 'Season not found.' },
      { status: 404 },
    );
  }

  let body: SeasonMutationRequest;
  try {
    body = (await request.json()) as SeasonMutationRequest;
  } catch {
    return NextResponse.json<SeasonMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateSeasonMutation(body);
  if (!validation.valid) {
    return NextResponse.json<SeasonMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const season = await Season.findById(seasonId).select(
    'name startsOn endsOn rateOverrides active',
  );
  if (!season) {
    return NextResponse.json<SeasonMutationResponse>(
      { message: 'Season not found.' },
      { status: 404 },
    );
  }

  const overrideStayTypeIds = validation.data.rateOverrides.map((override) => override.stayTypeRef);
  const stayTypeCount = await StayType.countDocuments({ _id: { $in: overrideStayTypeIds } });
  if (stayTypeCount !== overrideStayTypeIds.length) {
    return NextResponse.json<SeasonMutationResponse>(
      { message: 'One or more stay type overrides no longer exist.' },
      { status: 404 },
    );
  }

  const beforeSnapshot = {
    name: season.name,
    startsOn: season.startsOn,
    endsOn: season.endsOn,
    active: season.active,
    overrideCount: season.rateOverrides.length,
  };
  season.set(validation.data);
  await season.save();
  await logActivity({
    actorId: authorization.staff.userId,
    action: beforeSnapshot.active !== season.active ? 'status-change' : 'update',
    entityType: 'Season',
    entityId: season._id,
    beforeSnapshot,
    afterSnapshot: {
      name: season.name,
      startsOn: season.startsOn,
      endsOn: season.endsOn,
      active: season.active,
      overrideCount: season.rateOverrides.length,
    },
  });

  return NextResponse.json<SeasonMutationResponse>({ message: 'Season saved.' });
}
