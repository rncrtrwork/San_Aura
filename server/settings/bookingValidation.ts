import type { BookingSettingsMutationRequest } from '@/lib/settingsManager';

export type BookingSettingsValidationResult =
  | { valid: true; data: BookingSettingsMutationRequest }
  | { valid: false; message: string };

type BookingSettingsInput = Partial<BookingSettingsMutationRequest>;

function integerValue(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isInteger(value) ? value : null;
}

export function validateBookingSettings(
  input: BookingSettingsInput | null,
): BookingSettingsValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Booking defaults are required.' };
  }

  const cancellationWindowDays = integerValue(input.cancellationWindowDays);
  const depositRequirementPercent = integerValue(input.depositRequirementPercent);
  const minimumAge = integerValue(input.minimumAge);
  const defaultMinimumStay = integerValue(input.defaultMinimumStay);

  if (
    cancellationWindowDays === null ||
    cancellationWindowDays < 0 ||
    cancellationWindowDays > 365
  ) {
    return { valid: false, message: 'Cancellation window must be between 0 and 365 days.' };
  }
  if (
    depositRequirementPercent === null ||
    depositRequirementPercent < 0 ||
    depositRequirementPercent > 100
  ) {
    return { valid: false, message: 'Deposit requirement must be between 0 and 100 percent.' };
  }
  if (minimumAge === null || minimumAge < 18 || minimumAge > 120) {
    return { valid: false, message: 'Minimum age must be between 18 and 120.' };
  }
  if (defaultMinimumStay === null || defaultMinimumStay < 1 || defaultMinimumStay > 365) {
    return { valid: false, message: 'Default minimum stay must be between 1 and 365 nights.' };
  }

  return {
    valid: true,
    data: {
      cancellationWindowDays,
      depositRequirementPercent,
      minimumAge,
      defaultMinimumStay,
    },
  };
}
