import type { ActivitySnapshot } from '@/models/ActivityLog';
import type { PropertySettingsDocument } from '@/models/PropertySettings';

type OperatingSnapshotSettings = Pick<
  PropertySettingsDocument,
  'openYearRound' | 'taxRatePercent' | 'currency' | 'dateFormat'
>;

export function operatingSettingsSnapshot(settings: OperatingSnapshotSettings): ActivitySnapshot {
  return {
    openYearRound: settings.openYearRound,
    taxRatePercent: settings.taxRatePercent,
    currency: settings.currency,
    dateFormat: settings.dateFormat,
  };
}
