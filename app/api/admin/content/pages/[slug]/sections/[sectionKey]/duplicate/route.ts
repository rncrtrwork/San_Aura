import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { isValidContentPageSlug, type ContentSectionMutationResponse } from '@/lib/contentManager';
import { Page, type PageSection } from '@/models/Page';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { contentSectionSummary } from '@/server/content/sectionSummary';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ slug: string; sectionKey: string }>;
};

function copySection(section: PageSection, key: string): PageSection {
  return {
    key,
    type: section.type,
    active: false,
    hero: section.hero
      ? {
          imageRef: section.hero.imageRef,
          eyebrow: section.hero.eyebrow,
          heading: `${section.hero.heading} Copy`,
          body: section.hero.body,
        }
      : null,
    richText: section.richText ? { body: section.richText.body } : null,
    timeline: section.timeline
      ? {
          sectionLabel: `${section.timeline.sectionLabel} Copy`,
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
    cta: section.cta
      ? {
          heading: `${section.cta.heading} Copy`,
          body: section.cta.body,
          buttonLabel: section.cta.buttonLabel,
          buttonUrl: section.cta.buttonUrl,
        }
      : null,
    gallery: section.gallery
      ? {
          heading: `${section.gallery.heading || 'Gallery'} Copy`,
          albumRef: section.gallery.albumRef,
        }
      : null,
  };
}

export async function POST(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'content.write');
  if (!authorization.authorized) return authorization.response;

  const { slug, sectionKey } = await context.params;
  if (!isValidContentPageSlug(slug)) {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: 'Content page not found.' },
      { status: 404 },
    );
  }

  await connectToDatabase();
  const page = await Page.findOne({ slug }).select('title slug sections lastEditedAt');
  const sectionIndex = page?.sections.findIndex((entry) => entry.key === sectionKey) ?? -1;
  const section = sectionIndex >= 0 ? page?.sections[sectionIndex] : null;
  if (!page || !section) {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: 'Content section not found.' },
      { status: 404 },
    );
  }

  const duplicateKey = `${section.key}-copy-${Date.now()}`.slice(0, 80);
  const duplicate = copySection(section, duplicateKey);
  page.sections.splice(sectionIndex + 1, 0, duplicate);
  page.lastEditedAt = new Date();
  await page.save();

  await logActivity({
    actorId: authorization.staff.userId,
    action: 'create',
    entityType: 'Page',
    entityId: page._id,
    afterSnapshot: {
      slug: page.slug,
      sectionKey: duplicate.key,
      sectionType: duplicate.type,
      active: duplicate.active,
    },
  });

  return NextResponse.json<ContentSectionMutationResponse>(
    {
      message: 'Section duplicated.',
      section: contentSectionSummary(duplicate),
    },
    { status: 201 },
  );
}
