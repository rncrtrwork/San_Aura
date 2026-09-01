import type { CtaSectionMutationRequest } from '@/lib/contentManager';

export type CtaSectionValidationResult =
  | { valid: true; data: CtaSectionMutationRequest }
  | { valid: false; message: string };

type CtaSectionInput = Partial<Omit<CtaSectionMutationRequest, 'active'>> & {
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

function validButtonUrl(value: string): boolean {
  if (value.startsWith('/')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateCtaSection(input: CtaSectionInput | null): CtaSectionValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'CTA section details are required.' };
  }

  const sectionKey = typeof input.sectionKey === 'string' ? cleanSectionKey(input.sectionKey) : '';
  const heading = typeof input.heading === 'string' ? textValue(input.heading, 200) : '';
  const body = typeof input.body === 'string' ? textValue(input.body, 3000) : '';
  const buttonLabel = typeof input.buttonLabel === 'string' ? textValue(input.buttonLabel, 80) : '';
  const buttonUrl = typeof input.buttonUrl === 'string' ? textValue(input.buttonUrl, 2000) : '';
  const active = input.active === true;

  if (!heading || !buttonLabel || !buttonUrl) {
    return { valid: false, message: 'CTA heading, button label, and button URL are required.' };
  }
  if (!validButtonUrl(buttonUrl)) {
    return { valid: false, message: 'CTA button URL must be a relative, http, or https URL.' };
  }

  return {
    valid: true,
    data: {
      sectionKey,
      heading,
      body,
      buttonLabel,
      buttonUrl,
      active,
    },
  };
}
