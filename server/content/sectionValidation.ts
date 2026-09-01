import type { ContentSectionOrderRequest, ContentSectionStatusRequest } from '@/lib/contentManager';

export type ContentSectionOrderValidationResult =
  | { valid: true; data: ContentSectionOrderRequest }
  | { valid: false; message: string };

export type ContentSectionStatusValidationResult =
  | { valid: true; data: ContentSectionStatusRequest }
  | { valid: false; message: string };

function cleanSectionKey(value: string): string {
  return value.trim().slice(0, 80);
}

export function validateContentSectionOrder(
  input: Partial<ContentSectionOrderRequest> | null,
): ContentSectionOrderValidationResult {
  if (!input || typeof input !== 'object' || !Array.isArray(input.sectionKeys)) {
    return { valid: false, message: 'Section order is required.' };
  }

  const sectionKeys = input.sectionKeys
    .filter((key) => typeof key === 'string')
    .map(cleanSectionKey)
    .filter(Boolean);

  if (sectionKeys.length === 0) {
    return { valid: false, message: 'At least one section is required.' };
  }
  if (new Set(sectionKeys).size !== sectionKeys.length) {
    return { valid: false, message: 'Section order cannot include duplicate keys.' };
  }

  return { valid: true, data: { sectionKeys } };
}

export function validateContentSectionStatus(
  input: Partial<ContentSectionStatusRequest> | null,
): ContentSectionStatusValidationResult {
  if (!input || typeof input !== 'object' || typeof input.active !== 'boolean') {
    return { valid: false, message: 'Choose whether this section is active.' };
  }

  return { valid: true, data: { active: input.active } };
}
