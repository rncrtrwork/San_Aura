import type { ActivitySnapshot } from '@/models/ActivityLog';
import type { PropertySettingsDocument } from '@/models/PropertySettings';

type BookingSnapshotSettings = Pick<
  PropertySettingsDocument,
  'cancellationWindowDays' | 'depositRequirementPercent' | 'minimumAge' | 'defaultMinimumStay'
>;

export function bookingSettingsSnapshot(settings: BookingSnapshotSettings): ActivitySnapshot {
  return {
    cancellationWindowDays: settings.cancellationWindowDays,
    depositRequirementPercent: settings.depositRequirementPercent,
    minimumAge: settings.minimumAge,
    defaultMinimumStay: settings.defaultMinimumStay,
  };
}
