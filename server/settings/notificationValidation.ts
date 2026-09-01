import {
  NOTIFICATION_SETTING_DEFINITIONS,
  type NotificationSettingsMutationRequest,
} from '@/lib/settingsManager';

export type NotificationSettingsValidationResult =
  | { valid: true; data: NotificationSettingsMutationRequest }
  | { valid: false; message: string };

type NotificationSettingsInput = Partial<NotificationSettingsMutationRequest>;

export function validateNotificationSettings(
  input: NotificationSettingsInput | null,
): NotificationSettingsValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Notification settings are required.' };
  }

  for (const definition of NOTIFICATION_SETTING_DEFINITIONS) {
    if (typeof input[definition.key] !== 'boolean') {
      return { valid: false, message: 'Notification settings must be true or false values.' };
    }
  }

  const newReservation = input.newReservation;
  const cancellation = input.cancellation;
  const paymentRecorded = input.paymentRecorded;
  const arrivalReminder = input.arrivalReminder;
  if (
    typeof newReservation !== 'boolean' ||
    typeof cancellation !== 'boolean' ||
    typeof paymentRecorded !== 'boolean' ||
    typeof arrivalReminder !== 'boolean'
  ) {
    return { valid: false, message: 'Notification settings must be true or false values.' };
  }

  return {
    valid: true,
    data: {
      newReservation,
      cancellation,
      paymentRecorded,
      arrivalReminder,
    },
  };
}
