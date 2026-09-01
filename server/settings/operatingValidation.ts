import type { OperatingSettingsMutationRequest } from '@/lib/settingsManager';

export type OperatingSettingsValidationResult =
  | { valid: true; data: OperatingSettingsMutationRequest }
  | { valid: false; message: string };

type OperatingSettingsInput = Partial<OperatingSettingsMutationRequest>;

function numberValue(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function validateOperatingSettings(
  input: OperatingSettingsInput | null,
): OperatingSettingsValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Operating settings are required.' };
  }

  const taxRatePercent = numberValue(input.taxRatePercent);
  const currency = typeof input.currency === 'string' ? input.currency.trim().toUpperCase() : '';
  const dateFormat = typeof input.dateFormat === 'string' ? input.dateFormat.trim() : '';

  if (typeof input.openYearRound !== 'boolean') {
    return { valid: false, message: 'Operating season status is required.' };
  }
  if (taxRatePercent === null || taxRatePercent < 0 || taxRatePercent > 100) {
    return { valid: false, message: 'Tax rate must be between 0 and 100 percent.' };
  }
  if (!/^[A-Z]{3}$/.test(currency)) {
    return { valid: false, message: 'Currency must be a 3-letter code.' };
  }
  if (!dateFormat || dateFormat.length > 30) {
    return { valid: false, message: 'Date format is required.' };
  }

  return {
    valid: true,
    data: {
      openYearRound: input.openYearRound,
      taxRatePercent: Math.round(taxRatePercent * 100) / 100,
      currency,
      dateFormat,
    },
  };
}
