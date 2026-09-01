import { connectToDatabase } from '@/lib/db';
import {
  type ContentPreviewMedia,
  type ContentPreviewPage,
  type ContentPreviewSection,
} from '@/lib/contentManager';
import { MediaAsset } from '@/models/MediaAsset';
import {
  Page,
  type CtaSectionContent,
  type HeroSectionContent,
  type PagePublishStatus,
  type PageSectionType,
  type RichTextSectionContent,
  type TimelineSectionContent,
} from '@/models/Page';
import { sanitizeRichTextPreviewHtml } from '@/server/content/richTextPreview';

type PreviewSectionLean = {
  key: string;
  type: PageSectionType;
  active: boolean;
  hero?: HeroSectionContent | null;
  richText?: RichTextSectionContent | null;
  timeline?: TimelineSectionContent | null;
  cta?: CtaSectionContent | null;
  gallery?: { heading: string } | null;
};

type PreviewPageLean = {
  slug: string;
  title: string;
  navLabel: string;
  seoTitle: string;
  metaDescription: string;
  publishStatus: PagePublishStatus;
  lastEditedAt: Date;
  sections?: PreviewSectionLean[];
};

type PreviewMediaLean = {
  _id: { toString(): string };
  cloudinaryUrl: string;
  altText: string;
  focalPoint: { x: number; y: number };
};

function sectionImageId(section: PreviewSectionLean): string | null {
  const imageRef = section.hero?.imageRef;
  return imageRef ? imageRef.toString() : null;
}

function heroMedia(
  section: PreviewSectionLean,
  mediaById: Map<string, ContentPreviewMedia>,
): ContentPreviewMedia | null {
  const imageId = sectionImageId(section);
  return imageId ? (mediaById.get(imageId) ?? null) : null;
}

function previewSection(
  section: PreviewSectionLean,
  mediaById: Map<string, ContentPreviewMedia>,
): ContentPreviewSection | null {
  if (section.type === 'hero' && section.hero) {
    return {
      key: section.key,
      type: 'hero',
      active: section.active,
      hero: {
        imageId: sectionImageId(section) ?? '',
        eyebrow: section.hero.eyebrow,
        heading: section.hero.heading,
        body: section.hero.body,
        image: heroMedia(section, mediaById),
      },
    };
  }

  if (section.type === 'richText' && section.richText) {
    return {
      key: section.key,
      type: 'richText',
      active: section.active,
      richText: { body: sanitizeRichTextPreviewHtml(section.richText.body) },
    };
  }

  if (section.type === 'timeline' && section.timeline) {
    return {
      key: section.key,
      type: 'timeline',
      active: section.active,
      timeline: {
        sectionLabel: section.timeline.sectionLabel,
        backgroundColor: section.timeline.backgroundColor,
        layout: section.timeline.layout,
        showOnNavigation: section.timeline.showOnNavigation,
        items: section.timeline.items.map((item) => ({
          year: item.year,
          title: item.title,
          description: item.description,
        })),
      },
    };
  }

  if (section.type === 'cta' && section.cta) {
    return {
      key: section.key,
      type: 'cta',
      active: section.active,
      cta: {
        heading: section.cta.heading,
        body: section.cta.body,
        buttonLabel: section.cta.buttonLabel,
        buttonUrl: section.cta.buttonUrl,
      },
    };
  }

  if (section.type === 'gallery' && section.gallery) {
    return {
      key: section.key,
      type: 'gallery',
      active: section.active,
      gallery: { heading: section.gallery.heading },
    };
  }

  return null;
}

export async function getContentPreviewPage(slug: string): Promise<ContentPreviewPage | null> {
  await connectToDatabase();

  const page = await Page.findOne({ slug })
    .select(
      'slug title navLabel seoTitle metaDescription publishStatus lastEditedAt sections.key sections.type sections.active sections.hero.imageRef sections.hero.eyebrow sections.hero.heading sections.hero.body sections.richText.body sections.timeline.sectionLabel sections.timeline.backgroundColor sections.timeline.layout sections.timeline.showOnNavigation sections.timeline.items sections.cta.heading sections.cta.body sections.cta.buttonLabel sections.cta.buttonUrl sections.gallery.heading',
    )
    .lean<PreviewPageLean | null>();
  if (!page) return null;

  const sections = page.sections ?? [];
  const imageIds = sections
    .map(sectionImageId)
    .filter((imageId): imageId is string => Boolean(imageId));
  const media = imageIds.length
    ? await MediaAsset.find({ _id: { $in: imageIds }, archived: false })
        .select('cloudinaryUrl altText focalPoint')
        .lean<PreviewMediaLean[]>()
    : [];
  const mediaById = new Map<string, ContentPreviewMedia>(
    media.map((asset) => [
      asset._id.toString(),
      {
        url: asset.cloudinaryUrl,
        altText: asset.altText,
        focalPoint: asset.focalPoint,
      },
    ]),
  );
  const previewSections = sections
    .filter((section) => section.active)
    .map((section) => previewSection(section, mediaById))
    .filter((section): section is ContentPreviewSection => Boolean(section));

  return {
    slug: page.slug,
    title: page.title,
    navLabel: page.navLabel,
    seoTitle: page.seoTitle,
    metaDescription: page.metaDescription,
    publishStatus: page.publishStatus,
    lastEditedAt: page.lastEditedAt.toISOString(),
    sections: previewSections,
  };
}
