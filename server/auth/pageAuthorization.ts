import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Role } from '@/models/Role';
import { User } from '@/models/User';
import type { AuthorizedStaff } from '@/server/auth/authorization';
import type { Permission } from '@/server/auth/permissions';
import { readStaffSession, STAFF_SESSION_COOKIE } from '@/server/auth/session';

export async function requirePagePermission(permission: Permission): Promise<AuthorizedStaff> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_SESSION_COOKIE)?.value;
  const session = token ? await readStaffSession(token) : null;
  if (!session) {
    redirect('/admin/login');
  }

  await connectToDatabase();
  const [activeUser, role] = await Promise.all([
    User.exists({ _id: session.userId, roleId: session.roleId, active: true }),
    Role.findById(session.roleId).select('permissions').lean(),
  ]);
  if (!activeUser) {
    redirect('/admin/login');
  }
  if (!role?.permissions.includes(permission)) {
    redirect('/admin?access=denied');
  }

  return {
    userId: session.userId,
    roleId: session.roleId,
    email: session.email,
  };
}
