import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import type { StaffUserMutationResponse, StaffUserUpdateRequest } from '@/lib/settingsManager';
import { connectToDatabase } from '@/lib/db';
import { Role } from '@/models/Role';
import { User } from '@/models/User';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { staffUserSnapshot } from '@/server/settings/staffUserSnapshot';
import { validateStaffUserUpdate } from '@/server/settings/staffUserValidation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'staff.write');
  if (!authorization.authorized) return authorization.response;

  const { userId } = await context.params;
  if (!Types.ObjectId.isValid(userId)) {
    return NextResponse.json<StaffUserMutationResponse>(
      { message: 'Staff user not found.' },
      { status: 404 },
    );
  }

  let body: Partial<StaffUserUpdateRequest> | null;
  try {
    body = (await request.json()) as Partial<StaffUserUpdateRequest>;
  } catch {
    return NextResponse.json<StaffUserMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateStaffUserUpdate(body);
  if (!validation.valid) {
    return NextResponse.json<StaffUserMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const [staffUser, role] = await Promise.all([
    User.findById(userId).select('name email roleId active lastLogin'),
    Role.findById(validation.data.roleId).select('name'),
  ]);
  if (!staffUser) {
    return NextResponse.json<StaffUserMutationResponse>(
      { message: 'Staff user not found.' },
      { status: 404 },
    );
  }
  if (!role) {
    return NextResponse.json<StaffUserMutationResponse>(
      { message: 'Selected role was not found.' },
      { status: 404 },
    );
  }

  const beforeSnapshot = staffUserSnapshot(staffUser);
  staffUser.roleId = role._id;
  staffUser.active = validation.data.active;
  await staffUser.save();

  await logActivity({
    actorId: authorization.staff.userId,
    action: 'update',
    entityType: 'StaffUser',
    entityId: staffUser._id,
    beforeSnapshot,
    afterSnapshot: staffUserSnapshot(staffUser),
  });

  return NextResponse.json<StaffUserMutationResponse>({
    message: 'Staff account saved.',
    staffUser: {
      id: staffUser._id.toString(),
      name: staffUser.name,
      email: staffUser.email,
      roleId: staffUser.roleId.toString(),
      roleName: role.name,
      active: staffUser.active,
      lastLogin: staffUser.lastLogin?.toISOString() ?? null,
    },
  });
}
