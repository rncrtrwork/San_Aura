import {
  FAQ_PUBLISH_STATUSES,
  type FaqRelatedLinkInput,
  type ManagedContentItemRequest,
} from '@/lib/faqRules';

export type ManagedContentValidationResult =
  | { valid: true; data: ManagedContentItemRequest }
  | { valid: false; message: string };

type ManagedContentItemInput = Partial<Omit<ManagedContentItemRequest, 'status'>> & {
  status?: string;
};

function textValue(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);
}

function validUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function relatedLinks(input: FaqRelatedLinkInput[] | undefined): FaqRelatedLinkInput[] | null {
  if (!Array.isArray(input)) {
    return [];
  }

  const links = input
    .map((link) => ({
      label: typeof link.label === 'string' ? textValue(link.label, 120) : '',
      url: typeof link.url === 'string' ? textValue(link.url, 2000) : '',
    }))
    .filter((link) => link.label || link.url);

  if (links.length > 5 || links.some((link) => !link.label || !validUrl(link.url))) {
    return null;
  }

  return links;
}

export function validateManagedContentItem(
  input: ManagedContentItemInput | null,
): ManagedContentValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Content item details are required.' };
  }

  const category = typeof input.category === 'string' ? textValue(input.category, 120) : '';
  const title = typeof input.title === 'string' ? textValue(input.title, 300) : '';
  const body = typeof input.body === 'string' ? textValue(input.body, 50000) : '';
  const slugInput = typeof input.slug === 'string' ? input.slug : '';
  const slug = slugify(slugInput || title);
  const requestedDisplayOrder = input.displayOrder;
  const displayOrder =
    typeof requestedDisplayOrder === 'number' && Number.isInteger(requestedDisplayOrder)
      ? requestedDisplayOrder
      : 0;
  const status = input.status;
  const seoTitle = typeof input.seoTitle === 'string' ? textValue(input.seoTitle, 60) : '';
  const metaDescription =
    typeof input.metaDescription === 'string' ? textValue(input.metaDescription, 160) : '';
  const validStatus = FAQ_PUBLISH_STATUSES.find((entry) => entry === status);
  const parsedLinks = relatedLinks(input.relatedLinks);

  if (!category || !title || !body) {
    return { valid: false, message: 'Category, title, and body are required.' };
  }
  if (!slug) {
    return { valid: false, message: 'A valid slug is required.' };
  }
  if (displayOrder < 0 || displayOrder > 100000) {
    return { valid: false, message: 'Display order must be between 0 and 100000.' };
  }
  if (!validStatus) {
    return { valid: false, message: 'Select a valid publishing status.' };
  }
  if (!parsedLinks) {
    return { valid: false, message: 'Related links must include labels and valid URLs.' };
  }

  return {
    valid: true,
    data: {
      category,
      title,
      slug,
      body,
      relatedLinks: parsedLinks,
      displayOrder,
      status: validStatus,
      seoTitle,
      metaDescription,
    },
  };
}
