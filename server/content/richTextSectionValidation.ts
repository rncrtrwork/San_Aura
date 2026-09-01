import type { RichTextSectionMutationRequest } from '@/lib/contentManager';

export type RichTextSectionValidationResult =
  | { valid: true; data: RichTextSectionMutationRequest }
  | { valid: false; message: string };

type RichTextSectionInput = Partial<Omit<RichTextSectionMutationRequest, 'active'>> & {
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

export function validateRichTextSection(
  input: RichTextSectionInput | null,
): RichTextSectionValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Rich text section details are required.' };
  }

  const sectionKey = typeof input.sectionKey === 'string' ? cleanSectionKey(input.sectionKey) : '';
  const body = typeof input.body === 'string' ? textValue(input.body, 50000) : '';
  const active = input.active === true;

  if (!body) {
    return { valid: false, message: 'Rich text body is required.' };
  }

  return {
    valid: true,
    data: {
      sectionKey,
      body,
      active,
    },
  };
}
