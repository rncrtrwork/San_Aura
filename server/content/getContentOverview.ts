import { connectToDatabase } from '@/lib/db';
import {
  CONTENT_PAGE_DEFAULTS,
  CONTENT_PAGE_SLUGS,
  parseContentPageSlug,
  type ContentOverview,
  type ContentPageListItem,
  type ContentPageSlug,
  type ContentSectionDetail,
  type ContentSectionSummary,
} from '@/lib/contentManager';
import { Page, type PagePublishStatus, type PageSectionType } from '@/models/Page';

type PageListItemLean = {
  slug: ContentPageSlug;
  title: string;
  navLabel: string;
  publishStatus: PagePublishStatus;
  lastEditedAt: Date;
  sections?: {
    key: string;
    type: PageSectionType;
    active: boolean;
    hero?: {
      imageRef: { toString(): string } | null;
      eyebrow: string;
      heading: string;
      body: string;
    } | null;
    richText?: { body: string } | null;
    timeline?: {
      sectionLabel: string;
      backgroundColor: string;
      layout: 'alternating' | 'stacked';
      showOnNavigation: boolean;
      items: { year: string; title: string; description: string }[];
    } | null;
    cta?: { heading: string } | null;
    gallery?: { heading: string } | null;
  }[];
};

function textPreview(value: string): string {
  const preview = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return preview.length > 70 ? `${preview.slice(0, 67)}...` : preview;
}

function sectionLabel(section: NonNullable<PageListItemLean['sections']>[number]): string {
  if (section.type === 'hero') return section.hero?.heading || 'Hero section';
  if (section.type === 'richText') {
    return textPreview(section.richText?.body ?? '') || 'Rich text section';
  }
  if (section.type === 'timeline') return section.timeline?.sectionLabel || 'Timeline section';
  if (section.type === 'cta') return section.cta?.heading || 'CTA section';
  return section.gallery?.heading || 'Gallery section';
}

function sectionSummary(
  section: NonNullable<PageListItemLean['sections']>[number],
): ContentSectionSummary {
  return {
    key: section.key,
    type: section.type,
    active: section.active,
    label: sectionLabel(section),
  };
}

function sectionDetail(
  section: NonNullable<PageListItemLean['sections']>[number],
): ContentSectionDetail {
  const summary = sectionSummary(section);

  return {
    ...summary,
    hero: section.hero
      ? {
          imageId: section.hero.imageRef?.toString() ?? '',
          eyebrow: section.hero.eyebrow,
          heading: section.hero.heading,
          body: section.hero.body,
        }
      : null,
    richText: section.richText ? { body: section.richText.body } : null,
    timeline: section.timeline
      ? {
          sectionLabel: section.timeline.sectionLabel,
          backgroundColor: section.timeline.backgroundColor,
          layout: section.timeline.layout,
          showOnNavigation: section.timeline.showOnNavigation,
          items: section.timeline.items.map((item) => ({
            year: item.year,
            title: item.title,
            description: item.description,
          })),
        }
      : null,
  };
}

function pageListItem(
  slug: ContentPageSlug,
  page: PageListItemLean | undefined,
): ContentPageListItem {
  const defaults = CONTENT_PAGE_DEFAULTS[slug];
  const sections = page?.sections?.map(sectionSummary) ?? [];
  const sectionTypes = sections.map((section) => section.type);

  return {
    slug,
    title: page?.title ?? defaults.title,
    navLabel: page?.navLabel || defaults.navLabel,
    publishStatus: page?.publishStatus ?? 'draft',
    lastEditedAt: page?.lastEditedAt.toISOString() ?? null,
    sectionCount: sectionTypes.length,
    sectionTypes,
    sections,
    exists: Boolean(page),
  };
}

export async function getContentOverview(
  params: Record<string, string | string[] | undefined>,
): Promise<ContentOverview> {
  await connectToDatabase();
  const activeSlug = parseContentPageSlug(params.page);
  const storedPages = await Page.find({ slug: { $in: [...CONTENT_PAGE_SLUGS] } })
    .select(
      'slug title navLabel publishStatus lastEditedAt sections.key sections.type sections.active sections.hero.imageRef sections.hero.eyebrow sections.hero.heading sections.hero.body sections.richText.body sections.timeline.sectionLabel sections.timeline.backgroundColor sections.timeline.layout sections.timeline.showOnNavigation sections.timeline.items sections.cta.heading sections.gallery.heading',
    )
    .lean<PageListItemLean[]>();
  const pagesBySlug = new Map(storedPages.map((page) => [page.slug, page]));
  const pages = CONTENT_PAGE_SLUGS.map((slug) => pageListItem(slug, pagesBySlug.get(slug)));
  const selectedPage = pages.find((page) => page.slug === activeSlug) ?? pages[0];
  const selectedPageSource = pagesBySlug.get(selectedPage.slug);
  const requestedSectionKey = typeof params.section === 'string' ? params.section : '';
  const selectedSectionSource =
    selectedPageSource?.sections?.find((section) => section.key === requestedSectionKey) ??
    selectedPageSource?.sections?.[0] ??
    null;

  return {
    activeSlug,
    pages,
    selectedPage,
    selectedSection: selectedSectionSource ? sectionDetail(selectedSectionSource) : null,
    totalSections: pages.reduce((total, page) => total + page.sectionCount, 0),
    draftCount: pages.filter((page) => page.publishStatus === 'draft').length,
    publishedCount: pages.filter((page) => page.publishStatus === 'published').length,
  };
}
