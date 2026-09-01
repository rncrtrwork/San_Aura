import {
  CONTENT_PAGE_PUBLISH_STATUSES,
  normalizeContentPageSlug,
  type ContentPageCreateRequest,
} from '@/lib/contentManager';

export type ContentPageValidationResult =
  | { valid: true; data: ContentPageCreateRequest }
  | { valid: false; message: string };

type ContentPageInput = Partial<
  Omit<ContentPageCreateRequest, 'navVisibility' | 'publishStatus'>
> & {
  navVisibility?: boolean;
  publishStatus?: string;
};

function textValue(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export function validateContentPage(input: ContentPageInput | null): ContentPageValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Page details are required.' };
  }

  const title = typeof input.title === 'string' ? textValue(input.title, 200) : '';
  const requestedSlug = typeof input.slug === 'string' ? input.slug : '';
  const slug = normalizeContentPageSlug(requestedSlug || title);
  const navLabel = typeof input.navLabel === 'string' ? textValue(input.navLabel, 80) : title;
  const navVisibility = input.navVisibility === true;
  const seoTitle = typeof input.seoTitle === 'string' ? textValue(input.seoTitle, 60) : '';
  const metaDescription =
    typeof input.metaDescription === 'string' ? textValue(input.metaDescription, 160) : '';
  const publishStatus = CONTENT_PAGE_PUBLISH_STATUSES.find(
    (status) => status === input.publishStatus,
  );

  if (!title) {
    return { valid: false, message: 'Page title is required.' };
  }
  if (!slug) {
    return { valid: false, message: 'A valid page slug is required.' };
  }
  if (!publishStatus) {
    return { valid: false, message: 'Select a valid page publish status.' };
  }

  return {
    valid: true,
    data: {
      title,
      slug,
      navLabel: navLabel || title,
      navVisibility,
      seoTitle,
      metaDescription,
      publishStatus,
    },
  };
}
