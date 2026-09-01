import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { computeKwhDelta, validateElectricReadingRequest } from '@/lib/electricReadingForms';
import { resolveBillingMode } from '@/lib/electricBilling';
import { ElectricReading } from '@/models/ElectricReading';
import { Member, type ElectricBillingMode, type MembershipTier } from '@/models/Member';
import { Site, type SiteType } from '@/models/Site';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import type {
  ElectricReadingCreateRequest,
  ElectricReadingCreateResponse,
} from '@/lib/electricReadingForms';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ memberId: string }>;
};

type MemberBillingLean = {
  _id: Types.ObjectId;
  membershipTier: MembershipTier;
  electricBillingMode: ElectricBillingMode | null;
};

type SiteBillingLean = {
  _id: Types.ObjectId;
  type: SiteType;
  hookups: string[];
};

type PriorReadingLean = {
  _id: Types.ObjectId;
  meterValue: number;
};

function readingDateValue(value: string): Date {
  return new Date(`${value}T12:00:00`);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'payments.write');
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { memberId } = await context.params;
  if (!Types.ObjectId.isValid(memberId)) {
    return NextResponse.json<ElectricReadingCreateResponse>(
      { message: 'Member not found.' },
      { status: 404 },
    );
  }

  let body: Partial<ElectricReadingCreateRequest> | null;
  try {
    body = (await request.json()) as Partial<ElectricReadingCreateRequest>;
  } catch {
    return NextResponse.json<ElectricReadingCreateResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateElectricReadingRequest(body);
  if (typeof validation === 'string') {
    return NextResponse.json<ElectricReadingCreateResponse>(
      { message: validation },
      { status: 400 },
    );
  }

  const siteId = validation.siteId;
  if (siteId && !Types.ObjectId.isValid(siteId)) {
    return NextResponse.json<ElectricReadingCreateResponse>(
      { message: 'Select a valid site.' },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const [member, site] = await Promise.all([
    Member.findById(memberId)
      .select('membershipTier electricBillingMode')
      .lean<MemberBillingLean>(),
    siteId
      ? Site.findById(siteId).select('type hookups').lean<SiteBillingLean>()
      : Promise.resolve(null),
  ]);

  if (!member) {
    return NextResponse.json<ElectricReadingCreateResponse>(
      { message: 'Member not found.' },
      { status: 404 },
    );
  }
  if (siteId && !site) {
    return NextResponse.json<ElectricReadingCreateResponse>(
      { message: 'Site not found.' },
      { status: 404 },
    );
  }

  const readingDate = readingDateValue(validation.readingDate);
  const previousReading = await ElectricReading.findOne({
    memberRef: memberId,
    siteRef: siteId ? new Types.ObjectId(siteId) : null,
    readingDate: { $lt: readingDate },
  })
    .select('meterValue')
    .sort({ readingDate: -1, createdAt: -1 })
    .lean<PriorReadingLean>();
  const kwhUsed = computeKwhDelta(validation.meterValue, previousReading?.meterValue ?? null);

  if (kwhUsed < 0) {
    return NextResponse.json<ElectricReadingCreateResponse>(
      { message: 'Meter value cannot be lower than the prior reading.' },
      { status: 400 },
    );
  }

  const resolved = resolveBillingMode(member, site);
  const reading = await ElectricReading.create({
    siteRef: siteId ? siteId : null,
    memberRef: memberId,
    previousReadingRef: previousReading?._id ?? null,
    meterValue: validation.meterValue,
    readingDate,
    kwhUsed,
    enteredBy: authorization.staff.userId,
    billingMode: resolved.mode,
    resultingCharge: 0,
  });

  await logActivity({
    actorId: authorization.staff.userId,
    action: 'create',
    entityType: 'ElectricReading',
    entityId: reading._id,
    afterSnapshot: {
      memberId,
      siteId: siteId || null,
      meterValue: reading.meterValue,
      kwhUsed: reading.kwhUsed,
      billingMode: reading.billingMode,
      readingDate: reading.readingDate,
    },
  });

  return NextResponse.json<ElectricReadingCreateResponse>(
    {
      id: reading._id.toString(),
      kwhUsed: reading.kwhUsed,
      resultingCharge: reading.resultingCharge,
    },
    { status: 201 },
  );
}
