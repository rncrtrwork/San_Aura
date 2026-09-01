import { NextResponse, type NextRequest } from 'next/server';
import type { StaffUserCreateRequest, StaffUserMutationResponse } from '@/lib/settingsManager';
import { connectToDatabase } from '@/lib/db';
import { Role } from '@/models/Role';
import { User } from '@/models/User';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';
import { staffUserSnapshot } from '@/server/settings/staffUserSnapshot';
import { validateStaffUserCreate } from '@/server/settings/staffUserValidation';

export const runtime = 'nodejs';

export const POST = requirePermission('staff.write', async (request: NextRequest, staff) => {
  let body: Partial<StaffUserCreateRequest> | null;
  try {
    body = (await request.json()) as Partial<StaffUserCreateRequest>;
  } catch {
    return NextResponse.json<StaffUserMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateStaffUserCreate(body);
  if (!validation.valid) {
    return NextResponse.json<StaffUserMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const [role, existingUser] = await Promise.all([
    Role.findById(validation.data.roleId).select('name'),
    User.exists({ email: validation.data.email }),
  ]);
  if (!role) {
    return NextResponse.json<StaffUserMutationResponse>(
      { message: 'Selected role was not found.' },
      { status: 404 },
    );
  }
  if (existingUser) {
    return NextResponse.json<StaffUserMutationResponse>(
      { message: 'A staff account already exists for this email.' },
      { status: 409 },
    );
  }

  const staffUser = new User({
    name: validation.data.name,
    email: validation.data.email,
    passwordHash: 'pending',
    roleId: role._id,
    active: true,
    lastLogin: null,
  });
  await staffUser.setPassword(validation.data.temporaryPassword);
  await staffUser.save();

  await logActivity({
    actorId: staff.userId,
    action: 'create',
    entityType: 'StaffUser',
    entityId: staffUser._id,
    afterSnapshot: staffUserSnapshot(staffUser),
  });

  return NextResponse.json<StaffUserMutationResponse>(
    {
      message: 'Staff account created.',
      staffUser: {
        id: staffUser._id.toString(),
        name: staffUser.name,
        email: staffUser.email,
        roleId: staffUser.roleId.toString(),
        roleName: role.name,
        active: staffUser.active,
        lastLogin: null,
      },
    },
    { status: 201 },
  );
});
