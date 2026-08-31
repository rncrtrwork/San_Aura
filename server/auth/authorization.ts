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

type ProtectedRouteHandler<RouteContext extends object> = (
  request: NextRequest,
  context: RouteContext,
  staff: AuthorizedStaff,
) => Promise<NextResponse>;

export function requirePermission<RouteContext extends object = object>(
  permission: Permission,
  handler: ProtectedRouteHandler<RouteContext>,
): (request: NextRequest, context: RouteContext) => Promise<NextResponse> {
  return async (request, context) => {
    const token = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
    const session = token ? await readStaffSession(token) : null;

    if (!session) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();
    const [activeUser, role] = await Promise.all([
      User.exists({ _id: session.userId, roleId: session.roleId, active: true }),
      Role.findById(session.roleId).select('permissions').lean(),
    ]);

    if (!activeUser) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    if (!role?.permissions.includes(permission)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    return handler(request, context, {
      userId: session.userId,
      roleId: session.roleId,
      email: session.email,
    });
  };
}
