import type { PagePublishStatus, PageSectionType } from '@/models/Page';

export const CONTENT_PAGE_SLUGS = [
  'home',
  'our-story',
  'history',
  'first-visit',
  'contact',
  'footer',
] as const;

export type ContentPageSlug = (typeof CONTENT_PAGE_SLUGS)[number];

export type ContentPageListItem = {
  slug: ContentPageSlug;
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
  activeSlug: ContentPageSlug;
  pages: ContentPageListItem[];
  selectedPage: ContentPageListItem;
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

export function parseContentPageSlug(value: string | string[] | undefined): ContentPageSlug {
  const slug = typeof value === 'string' ? value : '';
  return CONTENT_PAGE_SLUGS.find((entry) => entry === slug) ?? 'home';
}

export function isContentPageSlug(value: string): value is ContentPageSlug {
  return CONTENT_PAGE_SLUGS.some((entry) => entry === value);
}
