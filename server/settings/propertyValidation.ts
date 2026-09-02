import type { PropertySettingsMutationRequest } from '@/lib/settingsManager';
import { CLOUDINARY_FOLDERS, isCloudinaryPublicIdInFolder } from '@/lib/cloudinaryFolders';

export type PropertySettingsValidationResult =
  | { valid: true; data: PropertySettingsMutationRequest }
  | { valid: false; message: string };

type PropertySettingsInput = Partial<Omit<PropertySettingsMutationRequest, 'address'>> & {
  address?: Partial<PropertySettingsMutationRequest['address']>;
};

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function textValue(value: string | undefined, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function validUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validatePropertySettings(
  input: PropertySettingsInput | null,
): PropertySettingsValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Property settings are required.' };
  }

  const resortName = textValue(input.resortName, 160);
  const logoUrl = textValue(input.logoUrl, 2000);
  const logoPublicId = textValue(input.logoPublicId, 500);
  const phone = textValue(input.phone, 30);
  const email = textValue(input.email, 254).toLowerCase();
  const timezone = textValue(input.timezone, 100);
  const checkInTime = textValue(input.checkInTime, 5);
  const checkOutTime = textValue(input.checkOutTime, 5);
  const keyReturnTime = textValue(input.keyReturnTime, 5);
  const address = {
    street: textValue(input.address?.street, 200),
    city: textValue(input.address?.city, 100),
    state: textValue(input.address?.state, 100),
    postalCode: textValue(input.address?.postalCode, 20),
    country: textValue(input.address?.country, 100) || 'United States',
  };

  if (!resortName || !phone || !email || !timezone) {
    return { valid: false, message: 'Resort name, phone, email, and timezone are required.' };
  }
  if (!address.street || !address.city || !address.state || !address.postalCode) {
    return { valid: false, message: 'Complete property address is required.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, message: 'Enter a valid property email.' };
  }
  if (!validUrl(logoUrl)) {
    return { valid: false, message: 'Logo URL must be a valid http or https URL.' };
  }
  if (logoUrl && !isCloudinaryPublicIdInFolder(logoPublicId, CLOUDINARY_FOLDERS.settings)) {
    return { valid: false, message: 'Logo uploads must use the settings folder.' };
  }
  if (
    !timePattern.test(checkInTime) ||
    !timePattern.test(checkOutTime) ||
    !timePattern.test(keyReturnTime)
  ) {
    return { valid: false, message: 'Check-in, checkout, and key return times are required.' };
  }

  return {
    valid: true,
    data: {
      resortName,
      logoUrl,
      logoPublicId,
      address,
      phone,
      email,
      timezone,
      checkInTime,
      checkOutTime,
      keyReturnTime,
    },
  };
}
