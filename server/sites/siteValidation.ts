import type { SiteMutationRequest } from '@/lib/adminSites';
import {
  SITE_STATUSES,
  SITE_TYPES,
  type MapPosition,
  type SiteStatus,
  type SiteType,
} from '@/models/Site';

export type ValidSiteInput = SiteMutationRequest;

type ValidationResult = { valid: true; data: ValidSiteInput } | { valid: false; message: string };

function isSiteType(value: string): value is SiteType {
  return SITE_TYPES.some((type) => type === value);
}

function isSiteStatus(value: string): value is SiteStatus {
  return SITE_STATUSES.some((status) => status === value);
}

function cleanStringList(value: string[]): string[] {
  return Array.isArray(value)
    ? value
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 30)
    : [];
}

function optionalLength(value: number | null): number | null {
  if (value === null) return null;
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100) / 100;
}

function validMapPosition(value: MapPosition | null): MapPosition | null {
  if (value === null) return null;
  const x = value.x;
  const y = value.y;
  if (
    typeof x !== 'number' ||
    typeof y !== 'number' ||
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    x < 0 ||
    x > 100 ||
    y < 0 ||
    y > 100
  ) {
    return null;
  }
  return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
}

export function validateSiteMutation(body: SiteMutationRequest): ValidationResult {
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  const type = typeof body.type === 'string' && isSiteType(body.type) ? body.type : null;
  const area = typeof body.area === 'string' ? body.area.trim() : '';
  const status = typeof body.status === 'string' && isSiteStatus(body.status) ? body.status : null;
  const amenities = cleanStringList(body.amenities);
  const maintenanceNote =
    typeof body.maintenanceNote === 'string' ? body.maintenanceNote.trim() : '';
  const length = optionalLength(body.length);
  const hookups = cleanStringList(body.hookups);
  const mapPosition = validMapPosition(body.mapPosition);

  if (!code || code.length > 40) {
    return { valid: false, message: 'Enter a site code under 40 characters.' };
  }
  if (!type) {
    return { valid: false, message: 'Choose a valid site type.' };
  }
  if (!area || area.length > 100) {
    return { valid: false, message: 'Enter a site area under 100 characters.' };
  }
  if (!status) {
    return { valid: false, message: 'Choose a valid site status.' };
  }
  if (body.length !== null && length === null) {
    return { valid: false, message: 'Enter a valid site length or leave it blank.' };
  }
  if (maintenanceNote.length > 2000) {
    return { valid: false, message: 'Keep the maintenance note under 2,000 characters.' };
  }
  if (body.mapPosition !== null && mapPosition === null) {
    return { valid: false, message: 'Enter valid map coordinates between 0 and 100.' };
  }
  if (typeof body.active !== 'boolean') {
    return { valid: false, message: 'Choose whether this site is active.' };
  }

  return {
    valid: true,
    data: {
      code,
      type,
      area,
      amenities,
      status,
      maintenanceNote,
      length,
      hookups,
      mapPosition,
      active: body.active,
    },
  };
}
