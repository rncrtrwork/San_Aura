import type { StayTypeMutationRequest } from '@/lib/stayTypes';
import { SITE_TYPES, type SiteType } from '@/models/Site';

export type ValidStayTypeInput = StayTypeMutationRequest;

type ValidationResult =
  | { valid: true; data: ValidStayTypeInput }
  | { valid: false; message: string };

function isSiteType(value: string): value is SiteType {
  return SITE_TYPES.some((type) => type === value);
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function optionalSlug(value: string, name: string): string {
  const slug = slugify(value);
  return slug || slugify(name);
}

function finiteNumber(value: number, min: number): number | null {
  if (!Number.isFinite(value) || value < min) return null;
  return Math.round(value * 100) / 100;
}

function integerNumber(value: number, min: number): number | null {
  if (!Number.isInteger(value) || value < min) return null;
  return value;
}

export function validateStayTypeMutation(body: StayTypeMutationRequest): ValidationResult {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const slug = typeof body.slug === 'string' ? optionalSlug(body.slug, name) : slugify(name);
  const siteType =
    typeof body.siteType === 'string' && isSiteType(body.siteType) ? body.siteType : null;
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const amenities = Array.isArray(body.amenities)
    ? body.amenities
        .filter((amenity) => typeof amenity === 'string')
        .map((amenity) => amenity.trim())
        .filter(Boolean)
        .slice(0, 30)
    : [];
  const baseRate = finiteNumber(body.baseRate, 0);
  const weekendRate = finiteNumber(body.weekendRate, 0);
  const extraGuestFee = finiteNumber(body.extraGuestFee, 0);
  const minimumStay = integerNumber(body.minimumStay, 1);
  const cleaningFee = finiteNumber(body.cleaningFee, 0);

  if (!name || name.length > 100) {
    return { valid: false, message: 'Enter a stay type name under 100 characters.' };
  }
  if (!slug || slug.length > 100) {
    return { valid: false, message: 'Enter a valid stay type slug.' };
  }
  if (!siteType) {
    return { valid: false, message: 'Choose a valid site type.' };
  }
  if (description.length > 2000) {
    return { valid: false, message: 'Keep the description under 2,000 characters.' };
  }
  if (
    baseRate === null ||
    weekendRate === null ||
    extraGuestFee === null ||
    minimumStay === null ||
    cleaningFee === null
  ) {
    return { valid: false, message: 'Enter valid rates and minimum stay values.' };
  }
  if (typeof body.active !== 'boolean') {
    return { valid: false, message: 'Choose whether this stay type is active.' };
  }

  return {
    valid: true,
    data: {
      name,
      slug,
      siteType,
      description,
      amenities,
      baseRate,
      weekendRate,
      extraGuestFee,
      minimumStay,
      cleaningFee,
      active: body.active,
    },
  };
}
