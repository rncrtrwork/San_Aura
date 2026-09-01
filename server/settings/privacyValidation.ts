import type { PrivacySettingsMutationRequest } from '@/lib/settingsManager';

export type PrivacySettingsValidationResult =
  | { valid: true; data: PrivacySettingsMutationRequest }
  | { valid: false; message: string };

type PrivacySettingsInput = Partial<PrivacySettingsMutationRequest>;

export function validatePrivacySettings(
  input: PrivacySettingsInput | null,
): PrivacySettingsValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Privacy settings are required.' };
  }
  if (
    typeof input.photographyProhibited !== 'boolean' ||
    typeof input.videoProhibited !== 'boolean' ||
    typeof input.showPrivacyNoticeAtBooking !== 'boolean'
  ) {
    return { valid: false, message: 'Privacy settings must be true or false values.' };
  }

  return {
    valid: true,
    data: {
      photographyProhibited: input.photographyProhibited,
      videoProhibited: input.videoProhibited,
      showPrivacyNoticeAtBooking: input.showPrivacyNoticeAtBooking,
    },
  };
}
