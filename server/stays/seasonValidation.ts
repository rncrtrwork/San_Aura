import { Types } from 'mongoose';
import type { SeasonMutationRequest } from '@/lib/seasons';

export type ValidSeasonInput = {
  name: string;
  startsOn: Date;
  endsOn: Date;
  active: boolean;
  rateOverrides: Array<{
    stayTypeRef: Types.ObjectId;
    baseRate: number;
    weekendRate: number;
  }>;
};

type ValidationResult = { valid: true; data: ValidSeasonInput } | { valid: false; message: string };

function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function finiteRate(value: number): number | null {
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100) / 100;
}

export function validateSeasonMutation(body: SeasonMutationRequest): ValidationResult {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const startsOn = typeof body.startsOn === 'string' ? parseDateInput(body.startsOn) : null;
  const endsOn = typeof body.endsOn === 'string' ? parseDateInput(body.endsOn) : null;

  if (!name || name.length > 100) {
    return { valid: false, message: 'Enter a season name under 100 characters.' };
  }
  if (!startsOn || !endsOn || endsOn < startsOn) {
    return { valid: false, message: 'Choose a valid season date range.' };
  }
  if (typeof body.active !== 'boolean') {
    return { valid: false, message: 'Choose whether this season is active.' };
  }
  if (!Array.isArray(body.rateOverrides)) {
    return { valid: false, message: 'Add valid season rate overrides.' };
  }

  const overrides = new Map<string, ValidSeasonInput['rateOverrides'][number]>();
  for (const override of body.rateOverrides) {
    const baseRate = finiteRate(override.baseRate);
    const weekendRate = finiteRate(override.weekendRate);
    if (
      typeof override.stayTypeId !== 'string' ||
      !Types.ObjectId.isValid(override.stayTypeId) ||
      baseRate === null ||
      weekendRate === null
    ) {
      return { valid: false, message: 'Add valid season rate overrides.' };
    }
    overrides.set(override.stayTypeId, {
      stayTypeRef: new Types.ObjectId(override.stayTypeId),
      baseRate,
      weekendRate,
    });
  }

  return {
    valid: true,
    data: {
      name,
      startsOn,
      endsOn,
      active: body.active,
      rateOverrides: Array.from(overrides.values()),
    },
  };
}
