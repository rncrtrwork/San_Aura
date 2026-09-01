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

export function parseContentPageSlug(value: string | string[] | undefined): ContentPageSlug {
  const slug = typeof value === 'string' ? value : '';
  return CONTENT_PAGE_SLUGS.find((entry) => entry === slug) ?? 'home';
}

export function isContentPageSlug(value: string): value is ContentPageSlug {
  return CONTENT_PAGE_SLUGS.some((entry) => entry === value);
}
