import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type {
  PartyEntityType,
  PartyLinkCreateRequest,
  PartyLinkCreateResponse,
  PartyLinkItem,
  PartySearchResponse,
} from '@/lib/partyLinks';
import { Guest } from '@/models/Guest';
import { Member } from '@/models/Member';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ memberId: string }>;
};

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isPartyEntityType(value: string): value is PartyEntityType {
  return value === 'Member' || value === 'Guest';
}

async function resolveMemberId(context: RouteContext): Promise<string | null> {
  const { memberId } = await context.params;
  return Types.ObjectId.isValid(memberId) ? memberId : null;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'members.read');
  if (!authorization.authorized) {
    return authorization.response;
  }

  const memberId = await resolveMemberId(context);
  if (!memberId) {
    return NextResponse.json<PartySearchResponse>(
      { results: [], message: 'Member not found.' },
      { status: 404 },
    );
  }
  const query = request.nextUrl.searchParams.get('q')?.trim().slice(0, 80) ?? '';
  if (query.length < 2) {
    return NextResponse.json<PartySearchResponse>({ results: [] });
  }

  await connectToDatabase();
  const member = await Member.findById(memberId).select('partyLinks').lean();
  if (!member) {
    return NextResponse.json<PartySearchResponse>(
      { results: [], message: 'Member not found.' },
      { status: 404 },
    );
  }

  const excludedMemberIds = [
    new Types.ObjectId(memberId),
    ...member.partyLinks
      .filter((link) => link.entityType === 'Member')
      .map((link) => link.entityId),
  ];
  const excludedGuestIds = member.partyLinks
    .filter((link) => link.entityType === 'Guest')
    .map((link) => link.entityId);
  const expression = new RegExp(escapeRegularExpression(query), 'i');
  const [members, guests] = await Promise.all([
    Member.find({
      _id: { $nin: excludedMemberIds },
      $or: [{ name: expression }, { email: expression }, { phone: expression }],
    })
      .select('_id name email phone')
      .limit(6)
      .lean(),
    Guest.find({
      _id: { $nin: excludedGuestIds },
      $or: [{ name: expression }, { email: expression }, { phone: expression }],
    })
      .select('_id name email phone')
      .limit(6)
      .lean(),
  ]);

  const results: PartyLinkItem[] = [
    ...members.map((record) => ({
      entityType: 'Member' as const,
      entityId: record._id.toString(),
      name: record.name,
      subtitle: record.email || record.phone || 'Member',
    })),
    ...guests.map((record) => ({
      entityType: 'Guest' as const,
      entityId: record._id.toString(),
      name: record.name,
      subtitle: record.email || record.phone || 'Guest',
    })),
  ];
  return NextResponse.json<PartySearchResponse>({ results });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'members.write');
  if (!authorization.authorized) {
    return authorization.response;
  }

  const memberId = await resolveMemberId(context);
  if (!memberId) {
    return NextResponse.json<PartyLinkCreateResponse>(
      { message: 'Member not found.' },
      { status: 404 },
    );
  }

  let body: PartyLinkCreateRequest;
  try {
    body = (await request.json()) as PartyLinkCreateRequest;
  } catch {
    return NextResponse.json<PartyLinkCreateResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }
  if (
    !body ||
    typeof body.entityType !== 'string' ||
    typeof body.entityId !== 'string' ||
    !isPartyEntityType(body.entityType) ||
    !Types.ObjectId.isValid(body.entityId) ||
    (body.entityType === 'Member' && body.entityId === memberId)
  ) {
    return NextResponse.json<PartyLinkCreateResponse>(
      { message: 'Select a valid member or guest.' },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const member = await Member.findById(memberId).select('partyLinks');
  if (!member) {
    return NextResponse.json<PartyLinkCreateResponse>(
      { message: 'Member not found.' },
      { status: 404 },
    );
  }
  const duplicate = member.partyLinks.some(
    (link) => link.entityType === body.entityType && link.entityId.toString() === body.entityId,
  );
  if (duplicate) {
    return NextResponse.json<PartyLinkCreateResponse>(
      { message: 'This person is already linked.' },
      { status: 409 },
    );
  }

  let link: PartyLinkItem;
  if (body.entityType === 'Member') {
    const target = await Member.findById(body.entityId).select('name email phone').lean();
    if (!target) {
      return NextResponse.json<PartyLinkCreateResponse>(
        { message: 'Member not found.' },
        { status: 404 },
      );
    }
    link = {
      entityType: 'Member',
      entityId: target._id.toString(),
      name: target.name,
      subtitle: target.email || target.phone || 'Member',
    };
  } else {
    const target = await Guest.findById(body.entityId).select('name email phone').lean();
    if (!target) {
      return NextResponse.json<PartyLinkCreateResponse>(
        { message: 'Guest not found.' },
        { status: 404 },
      );
    }
    link = {
      entityType: 'Guest',
      entityId: target._id.toString(),
      name: target.name,
      subtitle: target.email || target.phone || 'Guest',
    };
  }

  member.partyLinks.push({
    entityType: body.entityType,
    entityId: new Types.ObjectId(body.entityId),
  });
  await member.save();
  await logActivity({
    actorId: authorization.staff.userId,
    action: 'update',
    entityType: 'Member',
    entityId: member._id,
    afterSnapshot: {
      linkedEntityType: body.entityType,
      linkedEntityId: body.entityId,
      partyLinkCount: member.partyLinks.length,
    },
  });

  return NextResponse.json<PartyLinkCreateResponse>({ link }, { status: 201 });
}
