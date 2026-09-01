import type { ActivitySnapshot } from '@/models/ActivityLog';
import type { PropertySettingsDocument } from '@/models/PropertySettings';

type PaymentSettingsSnapshot = Pick<PropertySettingsDocument, 'paypalMeUrl'>;

export function paymentSettingsSnapshot(settings: PaymentSettingsSnapshot): ActivitySnapshot {
  return {
    paypalMeConfigured: Boolean(settings.paypalMeUrl),
    paypalMeUrl: settings.paypalMeUrl,
  };
}
