import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import type {
  RolePermissionsMutationRequest,
  RolePermissionsMutationResponse,
} from '@/lib/settingsManager';
import { connectToDatabase } from '@/lib/db';
import { Role } from '@/models/Role';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { rolePermissionsSnapshot } from '@/server/settings/roleSnapshot';
import { validateRolePermissions } from '@/server/settings/rolePermissionsValidation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ roleId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'staff.write');
  if (!authorization.authorized) return authorization.response;

  const { roleId } = await context.params;
  if (!Types.ObjectId.isValid(roleId)) {
    return NextResponse.json<RolePermissionsMutationResponse>(
      { message: 'Role not found.' },
      { status: 404 },
    );
  }

  let body: Partial<RolePermissionsMutationRequest> | null;
  try {
    body = (await request.json()) as Partial<RolePermissionsMutationRequest>;
  } catch {
    return NextResponse.json<RolePermissionsMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateRolePermissions(body);
  if (!validation.valid) {
    return NextResponse.json<RolePermissionsMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const role = await Role.findById(roleId).select('name permissions');
  if (!role) {
    return NextResponse.json<RolePermissionsMutationResponse>(
      { message: 'Role not found.' },
      { status: 404 },
    );
  }

  const beforeSnapshot = rolePermissionsSnapshot(role);
  role.permissions = validation.data.permissions;
  await role.save();

  await logActivity({
    actorId: authorization.staff.userId,
    action: 'update',
    entityType: 'Role',
    entityId: role._id,
    beforeSnapshot,
    afterSnapshot: rolePermissionsSnapshot(role),
  });

  return NextResponse.json<RolePermissionsMutationResponse>({
    message: 'Role permissions saved.',
    role: {
      id: role._id.toString(),
      name: role.name,
      permissionCount: role.permissions.length,
      permissions: role.permissions,
    },
  });
}
