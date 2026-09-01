import type { ActivitySnapshot } from '@/models/ActivityLog';
import type { PropertySettingsDocument } from '@/models/PropertySettings';

type PropertySnapshotSettings = Pick<
  PropertySettingsDocument,
  | 'resortName'
  | 'logoUrl'
  | 'address'
  | 'phone'
  | 'email'
  | 'timezone'
  | 'checkInTime'
  | 'checkOutTime'
  | 'keyReturnTime'
>;

export function propertySettingsSnapshot(settings: PropertySnapshotSettings): ActivitySnapshot {
  return {
    resortName: settings.resortName,
    logoConfigured: Boolean(settings.logoUrl),
    addressLine: `${settings.address.street}, ${settings.address.city}, ${settings.address.state} ${settings.address.postalCode}`,
    phone: settings.phone,
    email: settings.email,
    timezone: settings.timezone,
    checkInTime: settings.checkInTime,
    checkOutTime: settings.checkOutTime,
    keyReturnTime: settings.keyReturnTime,
  };
}
