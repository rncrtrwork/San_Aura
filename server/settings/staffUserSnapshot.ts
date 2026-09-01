import type { ActivitySnapshot } from '@/models/ActivityLog';
import type { UserDocument } from '@/models/User';

type StaffUserSnapshot = Pick<UserDocument, 'name' | 'email' | 'roleId' | 'active'>;

export function staffUserSnapshot(staffUser: StaffUserSnapshot): ActivitySnapshot {
  return {
    name: staffUser.name,
    email: staffUser.email,
    roleId: staffUser.roleId.toString(),
    active: staffUser.active,
  };
}
