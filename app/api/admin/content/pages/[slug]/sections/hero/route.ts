import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import {
  CONTENT_PAGE_DEFAULTS,
  isContentPageSlug,
  type ContentSectionMutationResponse,
  type HeroSectionMutationRequest,
} from '@/lib/contentManager';
import { connectToDatabase } from '@/lib/db';
import { MediaAsset } from '@/models/MediaAsset';
import { Page, type PageSection } from '@/models/Page';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { validateHeroSection } from '@/server/content/heroSectionValidation';
import { contentSectionSummary } from '@/server/content/sectionSummary';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function newHeroSectionKey(slug: string, currentKeys: string[]): string {
  const base = `hero-${slug}`.slice(0, 72);
  if (!currentKeys.includes(base)) return base;
  for (let index = 2; index < 100; index += 1) {
    const key = `${base}-${index}`.slice(0, 80);
    if (!currentKeys.includes(key)) return key;
  }
  return `${base}-${Date.now()}`.slice(0, 80);
}

function heroSection(input: HeroSectionMutationRequest, key: string): PageSection {
  return {
    key,
    type: 'hero',
    active: input.active,
    hero: {
      imageRef: input.imageId ? new Types.ObjectId(input.imageId) : null,
      eyebrow: input.eyebrow,
      heading: input.heading,
      body: input.body,
    },
    richText: null,
    timeline: null,
    cta: null,
    gallery: null,
  };
}

export async function POST(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'content.write');
  if (!authorization.authorized) return authorization.response;

  const { slug } = await context.params;
  if (!isContentPageSlug(slug)) {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: 'Content page not found.' },
      { status: 404 },
    );
  }

  let body: Partial<HeroSectionMutationRequest> | null;
  try {
    body = (await request.json()) as Partial<HeroSectionMutationRequest>;
  } catch {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateHeroSection(body);
  if (!validation.valid) {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  if (validation.data.imageId) {
    const mediaExists = await MediaAsset.exists({ _id: validation.data.imageId });
    if (!mediaExists) {
      return NextResponse.json<ContentSectionMutationResponse>(
        { message: 'Selected hero image was not found.' },
        { status: 404 },
      );
    }
  }

  const defaults = CONTENT_PAGE_DEFAULTS[slug];
  const page =
    (await Page.findOne({ slug }).select('slug title sections lastEditedAt')) ??
    new Page({
      slug,
      title: defaults.title,
      navLabel: defaults.navLabel,
      sections: [],
      navVisibility: true,
      seoTitle: '',
      metaDescription: '',
      publishStatus: 'draft',
      lastEditedAt: new Date(),
    });
  const beforeCount = page.sections.length;
  const existingIndex = validation.data.sectionKey
    ? page.sections.findIndex((section) => section.key === validation.data.sectionKey)
    : -1;
  const existingSection = existingIndex >= 0 ? page.sections[existingIndex] : null;
  if (existingSection && existingSection.type !== 'hero') {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: 'Selected section is not a hero section.' },
      { status: 400 },
    );
  }

  const sectionKey =
    existingSection?.key ??
    validation.data.sectionKey ??
    newHeroSectionKey(
      slug,
      page.sections.map((section) => section.key),
    );
  const nextSection = heroSection(validation.data, sectionKey);
  if (existingIndex >= 0) {
    page.sections.splice(existingIndex, 1, nextSection);
  } else {
    page.sections.push(nextSection);
  }
  page.lastEditedAt = new Date();
  await page.save();

  await logActivity({
    actorId: authorization.staff.userId,
    action: existingIndex >= 0 ? 'update' : 'create',
    entityType: 'Page',
    entityId: page._id,
    beforeSnapshot: { slug: page.slug, sectionCount: beforeCount },
    afterSnapshot: {
      slug: page.slug,
      sectionKey: nextSection.key,
      sectionType: nextSection.type,
      active: nextSection.active,
    },
  });

  return NextResponse.json<ContentSectionMutationResponse>(
    {
      message: existingIndex >= 0 ? 'Hero section saved.' : 'Hero section added.',
      section: contentSectionSummary(nextSection),
    },
    { status: existingIndex >= 0 ? 200 : 201 },
  );
}
