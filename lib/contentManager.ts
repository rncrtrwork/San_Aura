import type { PagePublishStatus, PageSectionType } from '@/models/Page';

export const CONTENT_PAGE_PUBLISH_STATUSES = ['draft', 'published'] as const;
export const CONTENT_EDITOR_SECTION_TYPES = ['hero', 'richText', 'timeline', 'cta'] as const;
export const CONTENT_PAGE_SLUGS = [
  'home',
  'our-story',
  'history',
  'first-visit',
  'contact',
  'footer',
] as const;

export type ContentPageSlug = (typeof CONTENT_PAGE_SLUGS)[number];
export type ContentEditorSectionType = (typeof CONTENT_EDITOR_SECTION_TYPES)[number];

export type ContentPageListItem = {
  slug: string;
  title: string;
  navLabel: string;
  publishStatus: PagePublishStatus;
  lastEditedAt: string | null;
  sectionCount: number;
  sectionTypes: PageSectionType[];
  sections: ContentSectionSummary[];
  exists: boolean;
};

export type ContentOverview = {
  activeSlug: string;
  pages: ContentPageListItem[];
  selectedPage: ContentPageListItem;
  selectedSection: ContentSectionDetail | null;
  totalSections: number;
  draftCount: number;
  publishedCount: number;
};

export const CONTENT_PAGE_DEFAULTS: Record<ContentPageSlug, { title: string; navLabel: string }> = {
  home: { title: 'Home', navLabel: 'Home' },
  'our-story': { title: 'Our Story', navLabel: 'Our Story' },
  history: { title: 'History', navLabel: 'History' },
  'first-visit': { title: 'First Visit', navLabel: 'First Visit' },
  contact: { title: 'Contact', navLabel: 'Contact' },
  footer: { title: 'Footer', navLabel: 'Footer' },
};

export type ContentSectionSummary = {
  key: string;
  type: PageSectionType;
  active: boolean;
  label: string;
};

export type ContentHeroSection = {
  imageId: string;
  eyebrow: string;
  heading: string;
  body: string;
};

export type ContentRichTextSection = {
  body: string;
};

export type ContentTimelineItem = {
  year: string;
  title: string;
  description: string;
};

export type ContentTimelineSection = {
  sectionLabel: string;
  backgroundColor: string;
  layout: 'alternating' | 'stacked';
  showOnNavigation: boolean;
  items: ContentTimelineItem[];
};

export type ContentCtaSection = {
  heading: string;
  body: string;
  buttonLabel: string;
  buttonUrl: string;
};

export type ContentSectionDetail = ContentSectionSummary & {
  hero: ContentHeroSection | null;
  richText: ContentRichTextSection | null;
  timeline: ContentTimelineSection | null;
  cta: ContentCtaSection | null;
};

export type HeroSectionMutationRequest = {
  sectionKey: string;
  imageId: string;
  eyebrow: string;
  heading: string;
  body: string;
  active: boolean;
};

export type RichTextSectionMutationRequest = {
  sectionKey: string;
  body: string;
  active: boolean;
};

export type TimelineSectionMutationRequest = {
  sectionKey: string;
  sectionLabel: string;
  backgroundColor: string;
  layout: 'alternating' | 'stacked';
  showOnNavigation: boolean;
  items: ContentTimelineItem[];
  active: boolean;
};

export type CtaSectionMutationRequest = {
  sectionKey: string;
  heading: string;
  body: string;
  buttonLabel: string;
  buttonUrl: string;
  active: boolean;
};

export type ContentSectionOrderRequest = {
  sectionKeys: string[];
};

export type ContentSectionOrderResponse = {
  message?: string;
  sectionKeys?: string[];
};

export type ContentSectionStatusRequest = {
  active: boolean;
};

export type ContentSectionMutationResponse = {
  message?: string;
  section?: ContentSectionSummary;
};

export type ContentPageCreateRequest = {
  title: string;
  slug: string;
  navLabel: string;
  navVisibility: boolean;
  seoTitle: string;
  metaDescription: string;
  publishStatus: PagePublishStatus;
};

export type ContentPageCreateResponse = {
  page?: ContentPageListItem;
  message?: string;
};

export type ContentPagePublishResponse = {
  message?: string;
  publishStatus?: PagePublishStatus;
  lastEditedAt?: string;
};

export type ContentPreviewMedia = {
  url: string;
  altText: string;
  focalPoint: { x: number; y: number };
};

export type ContentPreviewSection =
  | {
      key: string;
      type: 'hero';
      active: boolean;
      hero: ContentHeroSection & { image: ContentPreviewMedia | null };
    }
  | {
      key: string;
      type: 'richText';
      active: boolean;
      richText: ContentRichTextSection;
    }
  | {
      key: string;
      type: 'timeline';
      active: boolean;
      timeline: ContentTimelineSection;
    }
  | {
      key: string;
      type: 'cta';
      active: boolean;
      cta: ContentCtaSection;
    }
  | {
      key: string;
      type: 'gallery';
      active: boolean;
      gallery: { heading: string };
    };

export type ContentPreviewPage = {
  slug: string;
  title: string;
  navLabel: string;
  seoTitle: string;
  metaDescription: string;
  publishStatus: PagePublishStatus;
  lastEditedAt: string;
  sections: ContentPreviewSection[];
};

export function normalizeContentPageSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);
}

export function parseContentPageSlug(value: string | string[] | undefined): string {
  const slug = typeof value === 'string' ? normalizeContentPageSlug(value) : '';
  return slug || 'home';
}

export function isContentPageSlug(value: string): value is ContentPageSlug {
  return CONTENT_PAGE_SLUGS.some((entry) => entry === value);
}

export function isValidContentPageSlug(value: string): boolean {
  return normalizeContentPageSlug(value) === value && value.length > 0;
}

export function parseContentEditorSectionType(
  value: string | string[] | undefined,
): ContentEditorSectionType | null {
  const sectionType = typeof value === 'string' ? value : '';
  return CONTENT_EDITOR_SECTION_TYPES.find((entry) => entry === sectionType) ?? null;
}
