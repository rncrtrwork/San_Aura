import { connectToDatabase } from '@/lib/db';
import {
  CONTENT_PAGE_DEFAULTS,
  CONTENT_PAGE_SLUGS,
  parseContentPageSlug,
  type ContentOverview,
  type ContentPageListItem,
  type ContentPageSlug,
} from '@/lib/contentManager';
import { Page, type PagePublishStatus, type PageSectionType } from '@/models/Page';

type PageListItemLean = {
  slug: ContentPageSlug;
  title: string;
  navLabel: string;
  publishStatus: PagePublishStatus;
  lastEditedAt: Date;
  sections?: { type: PageSectionType }[];
};

function pageListItem(
  slug: ContentPageSlug,
  page: PageListItemLean | undefined,
): ContentPageListItem {
  const defaults = CONTENT_PAGE_DEFAULTS[slug];
  const sectionTypes = page?.sections?.map((section) => section.type) ?? [];

  return {
    slug,
    title: page?.title ?? defaults.title,
    navLabel: page?.navLabel || defaults.navLabel,
    publishStatus: page?.publishStatus ?? 'draft',
    lastEditedAt: page?.lastEditedAt.toISOString() ?? null,
    sectionCount: sectionTypes.length,
    sectionTypes,
    exists: Boolean(page),
  };
}

export async function getContentOverview(
  params: Record<string, string | string[] | undefined>,
): Promise<ContentOverview> {
  await connectToDatabase();
  const activeSlug = parseContentPageSlug(params.page);
  const storedPages = await Page.find({ slug: { $in: [...CONTENT_PAGE_SLUGS] } })
    .select('slug title navLabel publishStatus lastEditedAt sections.type')
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
