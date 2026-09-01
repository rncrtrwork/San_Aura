import {
  FAQ_PUBLISH_STATUSES,
  type FaqItemCreateRequest,
  type FaqRelatedLinkInput,
} from '@/lib/faqRules';

export type FaqItemValidationResult =
  | { valid: true; data: FaqItemCreateRequest }
  | { valid: false; message: string };

type FaqItemCreateInput = Partial<Omit<FaqItemCreateRequest, 'status'>> & {
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

export function validateFaqItemCreate(input: FaqItemCreateInput | null): FaqItemValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'FAQ item details are required.' };
  }

  const category = typeof input.category === 'string' ? textValue(input.category, 120) : '';
  const question = typeof input.question === 'string' ? textValue(input.question, 300) : '';
  const answer = typeof input.answer === 'string' ? textValue(input.answer, 50000) : '';
  const slugInput = typeof input.slug === 'string' ? input.slug : '';
  const slug = slugify(slugInput || question);
  const requestedDisplayOrder = input.displayOrder;
  const displayOrder =
    typeof requestedDisplayOrder === 'number' && Number.isInteger(requestedDisplayOrder)
      ? requestedDisplayOrder
      : 0;
  const status = input.status;
  const seoTitle = typeof input.seoTitle === 'string' ? textValue(input.seoTitle, 60) : '';
  const metaDescription =
    typeof input.metaDescription === 'string' ? textValue(input.metaDescription, 160) : '';
  const featured = input.featured === true;
  const validStatus = FAQ_PUBLISH_STATUSES.find((entry) => entry === status);
  const parsedLinks = relatedLinks(input.relatedLinks);

  if (!category || !question || !answer) {
    return { valid: false, message: 'Category, question, and answer are required.' };
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
      question,
      slug,
      answer,
      relatedLinks: parsedLinks,
      displayOrder,
      status: validStatus,
      seoTitle,
      metaDescription,
      featured,
    },
  };
}
