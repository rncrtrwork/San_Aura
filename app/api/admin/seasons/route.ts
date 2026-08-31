import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { SeasonMutationRequest, SeasonMutationResponse } from '@/lib/seasons';
import { Season } from '@/models/Season';
import { StayType } from '@/models/StayType';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { validateSeasonMutation } from '@/server/stays/seasonValidation';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const authorization = await authorizeRequest(request, 'sites.write');
  if (!authorization.authorized) return authorization.response;

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
  const overrideStayTypeIds = validation.data.rateOverrides.map((override) => override.stayTypeRef);
  const stayTypeCount = await StayType.countDocuments({ _id: { $in: overrideStayTypeIds } });
  if (stayTypeCount !== overrideStayTypeIds.length) {
    return NextResponse.json<SeasonMutationResponse>(
      { message: 'One or more stay type overrides no longer exist.' },
      { status: 404 },
    );
  }

  const season = await Season.create(validation.data);
  await logActivity({
    actorId: authorization.staff.userId,
    action: 'create',
    entityType: 'Season',
    entityId: season._id,
    afterSnapshot: {
      name: season.name,
      startsOn: season.startsOn,
      endsOn: season.endsOn,
      active: season.active,
      overrideCount: season.rateOverrides.length,
    },
  });

  return NextResponse.json<SeasonMutationResponse>(
    { id: season._id.toString(), message: 'Season created.' },
    { status: 201 },
  );
}
