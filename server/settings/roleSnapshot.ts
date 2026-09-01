import type { ActivitySnapshot } from '@/models/ActivityLog';
import type { RoleDocument } from '@/models/Role';

type RoleSnapshot = Pick<RoleDocument, 'name' | 'permissions'>;

export function rolePermissionsSnapshot(role: RoleSnapshot): ActivitySnapshot {
  return {
    roleName: role.name,
    permissionCount: role.permissions.length,
    permissions: role.permissions,
  };
}
