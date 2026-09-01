import { enabledNotificationCount } from '@/lib/settingsManager';
import type { ActivitySnapshot } from '@/models/ActivityLog';
import type { NotificationSettings } from '@/models/PropertySettings';

export function notificationSettingsSnapshot(
  notifications: NotificationSettings,
): ActivitySnapshot {
  return {
    newReservation: notifications.newReservation,
    cancellation: notifications.cancellation,
    paymentRecorded: notifications.paymentRecorded,
    arrivalReminder: notifications.arrivalReminder,
    enabledCount: enabledNotificationCount(notifications),
  };
}
