import type { AddonMutationRequest } from '@/lib/addons';
import { ADDON_TYPES, type AddonType } from '@/models/Addon';

export type ValidAddonInput = AddonMutationRequest;

type ValidationResult = { valid: true; data: ValidAddonInput } | { valid: false; message: string };

function isAddonType(value: string): value is AddonType {
  return ADDON_TYPES.some((type) => type === value);
}

function finitePrice(value: number): number | null {
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100) / 100;
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

export function validateAddonMutation(body: AddonMutationRequest): ValidationResult {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const type = typeof body.type === 'string' && isAddonType(body.type) ? body.type : null;
  const price = finitePrice(body.price);
  const partnerUrl = typeof body.partnerUrl === 'string' ? body.partnerUrl.trim() : '';

  if (!name || name.length > 120) {
    return { valid: false, message: 'Enter an add-on name under 120 characters.' };
  }
  if (description.length > 2000) {
    return { valid: false, message: 'Keep the description under 2,000 characters.' };
  }
  if (!type) {
    return { valid: false, message: 'Choose a valid add-on type.' };
  }
  if (price === null) {
    return { valid: false, message: 'Enter a valid add-on price.' };
  }
  if (type === 'external-partner' && !partnerUrl) {
    return { valid: false, message: 'External partner add-ons need a partner URL.' };
  }
  if (!validUrl(partnerUrl)) {
    return { valid: false, message: 'Enter a valid partner URL.' };
  }
  if (typeof body.active !== 'boolean') {
    return { valid: false, message: 'Choose whether this add-on is active.' };
  }

  return {
    valid: true,
    data: {
      name,
      description,
      type,
      price,
      partnerUrl,
      active: body.active,
    },
  };
}
