import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { MemberCreateRequest, MemberCreateResponse } from '@/lib/memberForms';
import {
  Member,
  MEMBERSHIP_TIERS,
  MEMBER_STATUSES,
  type MembershipTier,
  type MemberStatus,
} from '@/models/Member';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';

export const runtime = 'nodejs';

function isMembershipTier(value: string): value is MembershipTier {
  return MEMBERSHIP_TIERS.some((tier) => tier === value);
}

function isMemberStatus(value: string): value is MemberStatus {
  return MEMBER_STATUSES.some((status) => status === value);
}

function validateRequest(body: MemberCreateRequest): string | null {
  if (
    !body ||
    typeof body.name !== 'string' ||
    typeof body.email !== 'string' ||
    typeof body.phone !== 'string' ||
    typeof body.address !== 'string' ||
    typeof body.membershipTier !== 'string' ||
    typeof body.status !== 'string' ||
    typeof body.renewalMonth !== 'number' ||
    !body.vehicle ||
    typeof body.vehicle.make !== 'string' ||
    typeof body.vehicle.model !== 'string' ||
    (body.vehicle.year !== null && typeof body.vehicle.year !== 'number') ||
    typeof body.vehicle.plate !== 'string' ||
    typeof body.vehicle.state !== 'string' ||
    !body.emergencyContact ||
    typeof body.emergencyContact.name !== 'string' ||
    typeof body.emergencyContact.relationship !== 'string' ||
    typeof body.emergencyContact.phone !== 'string'
  ) {
    return 'Member details are incomplete or malformed.';
  }
  if (!body.name.trim() || !body.phone.trim()) {
    return 'Name and phone are required.';
  }
  if (
    body.name.length > 120 ||
    body.phone.length > 30 ||
    body.email.length > 254 ||
    body.address.length > 300 ||
    body.vehicle.make.length > 80 ||
    body.vehicle.model.length > 80 ||
    body.vehicle.plate.length > 20 ||
    body.vehicle.state.length > 20 ||
    body.emergencyContact.name.length > 120 ||
    body.emergencyContact.relationship.length > 80 ||
    body.emergencyContact.phone.length > 30
  ) {
    return 'One or more contact fields are too long.';
  }
  if (body.email && !/^\S+@\S+\.\S+$/.test(body.email)) {
    return 'Enter a valid email address.';
  }
  if (!isMembershipTier(body.membershipTier) || !isMemberStatus(body.status)) {
    return 'Select a valid membership tier and status.';
  }
  if (!Number.isInteger(body.renewalMonth) || body.renewalMonth < 1 || body.renewalMonth > 12) {
    return 'Select a valid renewal month.';
  }
  if (body.vehicle.year !== null && (body.vehicle.year < 1900 || body.vehicle.year > 2200)) {
    return 'Enter a valid vehicle year.';
  }
  const emergencyHasValue = Boolean(
    body.emergencyContact.name.trim() || body.emergencyContact.phone.trim(),
  );
  if (
    emergencyHasValue &&
    (!body.emergencyContact.name.trim() || !body.emergencyContact.phone.trim())
  ) {
    return 'Emergency contact name and phone must be provided together.';
  }
  return null;
}

export const POST = requirePermission('members.write', async (request, staff) => {
  let body: MemberCreateRequest;
  try {
    body = (await request.json()) as MemberCreateRequest;
  } catch {
    return NextResponse.json<MemberCreateResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validationMessage = validateRequest(body);
  if (validationMessage) {
    return NextResponse.json<MemberCreateResponse>({ message: validationMessage }, { status: 400 });
  }

  await connectToDatabase();
  const hasVehicle = Boolean(
    body.vehicle.make.trim() ||
      body.vehicle.model.trim() ||
      body.vehicle.plate.trim() ||
      body.vehicle.state.trim() ||
      body.vehicle.year,
  );
  const hasEmergencyContact = Boolean(body.emergencyContact.name.trim());
  const member = await Member.create({
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone.trim(),
    address: body.address.trim(),
    membershipTier: body.membershipTier,
    status: body.status,
    renewalMonth: body.renewalMonth,
    vehicleInfo: hasVehicle ? [body.vehicle] : [],
    emergencyContact: hasEmergencyContact ? body.emergencyContact : null,
  });

  await logActivity({
    actorId: staff.userId,
    action: 'create',
    entityType: 'Member',
    entityId: member._id,
    afterSnapshot: {
      name: member.name,
      membershipTier: member.membershipTier,
      status: member.status,
      renewalMonth: member.renewalMonth,
    },
  });

  return NextResponse.json<MemberCreateResponse>({ id: member._id.toString() }, { status: 201 });
});
