import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Role } from '@/models/Role';
import { User } from '@/models/User';
import type { Permission } from '@/server/auth/permissions';
import { readStaffSession, STAFF_SESSION_COOKIE } from '@/server/auth/session';

export type AuthorizedStaff = {
  userId: string;
  roleId: string;
  email: string;
};

export type AuthorizationResult =
  | { authorized: true; staff: AuthorizedStaff }
  | { authorized: false; response: NextResponse };

type ProtectedRouteHandler = (
  request: NextRequest,
  staff: AuthorizedStaff,
) => Promise<NextResponse>;

export function requirePermission(
  permission: Permission,
  handler: ProtectedRouteHandler,
): (request: NextRequest) => Promise<NextResponse> {
  return async (request) => {
    const authorization = await authorizeRequest(request, permission);
    return authorization.authorized
      ? handler(request, authorization.staff)
      : authorization.response;
  };
}

export async function authorizeRequest(
  request: NextRequest,
  permission: Permission,
): Promise<AuthorizationResult> {
  const token = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
  const session = token ? await readStaffSession(token) : null;

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json({ message: 'Authentication required' }, { status: 401 }),
    };
  }

  await connectToDatabase();
  const [activeUser, role] = await Promise.all([
    User.exists({ _id: session.userId, roleId: session.roleId, active: true }),
    Role.findById(session.roleId).select('permissions').lean(),
  ]);

  if (!activeUser) {
    return {
      authorized: false,
      response: NextResponse.json({ message: 'Authentication required' }, { status: 401 }),
    };
  }

  if (!role?.permissions.includes(permission)) {
    return {
      authorized: false,
      response: NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 }),
    };
  }

  return {
    authorized: true,
    staff: {
      userId: session.userId,
      roleId: session.roleId,
      email: session.email,
    },
  };
}
