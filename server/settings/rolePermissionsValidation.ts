import { isPermission, type RolePermissionsMutationRequest } from '@/lib/settingsManager';
import type { Permission } from '@/server/auth/permissions';

export type RolePermissionsValidationResult =
  | { valid: true; data: { permissions: Permission[] } }
  | { valid: false; message: string };

type RolePermissionsInput = Partial<RolePermissionsMutationRequest>;

export function validateRolePermissions(
  input: RolePermissionsInput | null,
): RolePermissionsValidationResult {
  if (!input || typeof input !== 'object' || !Array.isArray(input.permissions)) {
    return { valid: false, message: 'Role permissions are required.' };
  }

  const normalizedPermissions: Permission[] = [];
  for (const permission of input.permissions) {
    if (typeof permission !== 'string' || !isPermission(permission)) {
      return { valid: false, message: 'Role permissions include an unsupported permission.' };
    }
    if (!normalizedPermissions.includes(permission)) {
      normalizedPermissions.push(permission);
    }
  }

  if (!normalizedPermissions.includes('dashboard.read')) {
    return { valid: false, message: 'Every staff role must keep dashboard access.' };
  }

  return { valid: true, data: { permissions: normalizedPermissions } };
}
