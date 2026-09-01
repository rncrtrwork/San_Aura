import { Types } from 'mongoose';
import type { HeroSectionMutationRequest } from '@/lib/contentManager';

export type HeroSectionValidationResult =
  | { valid: true; data: HeroSectionMutationRequest }
  | { valid: false; message: string };

type HeroSectionInput = Partial<Omit<HeroSectionMutationRequest, 'active'>> & {
  active?: boolean;
};

function textValue(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

function cleanSectionKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function validateHeroSection(input: HeroSectionInput | null): HeroSectionValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Hero section details are required.' };
  }

  const sectionKey = typeof input.sectionKey === 'string' ? cleanSectionKey(input.sectionKey) : '';
  const imageId = typeof input.imageId === 'string' ? textValue(input.imageId, 80) : '';
  const eyebrow = typeof input.eyebrow === 'string' ? textValue(input.eyebrow, 120) : '';
  const heading = typeof input.heading === 'string' ? textValue(input.heading, 200) : '';
  const body = typeof input.body === 'string' ? textValue(input.body, 3000) : '';
  const active = input.active === true;

  if (!heading) {
    return { valid: false, message: 'Hero H1 text is required.' };
  }
  if (imageId && !Types.ObjectId.isValid(imageId)) {
    return { valid: false, message: 'Select a valid hero image.' };
  }

  return {
    valid: true,
    data: {
      sectionKey,
      imageId,
      eyebrow,
      heading,
      body,
      active,
    },
  };
}
