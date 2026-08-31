import 'server-only';

import { connectToDatabase } from '@/lib/db';
import { Role } from '@/models/Role';

export async function isAdminRole(roleId: string): Promise<boolean> {
  await connectToDatabase();
  return Boolean(await Role.exists({ _id: roleId, name: 'Admin' }));
}
