import { connectToDatabase } from '@/lib/db';
import {
  CONTENT_PAGE_DEFAULTS,
  CONTENT_PAGE_SLUGS,
  parseContentPageSlug,
  type ContentOverview,
  type ContentPageListItem,
  type ContentPageSlug,
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
    hero?: { heading: string } | null;
    richText?: { body: string } | null;
    timeline?: { sectionLabel: string } | null;
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
      'slug title navLabel publishStatus lastEditedAt sections.key sections.type sections.active sections.hero.heading sections.richText.body sections.timeline.sectionLabel sections.cta.heading sections.gallery.heading',
    )
    .lean<PageListItemLean[]>();
  const pagesBySlug = new Map(storedPages.map((page) => [page.slug, page]));
  const pages = CONTENT_PAGE_SLUGS.map((slug) => pageListItem(slug, pagesBySlug.get(slug)));
  const selectedPage = pages.find((page) => page.slug === activeSlug) ?? pages[0];

  return {
    activeSlug,
    pages,
    selectedPage,
    totalSections: pages.reduce((total, page) => total + page.sectionCount, 0),
    draftCount: pages.filter((page) => page.publishStatus === 'draft').length,
    publishedCount: pages.filter((page) => page.publishStatus === 'published').length,
  };
}
