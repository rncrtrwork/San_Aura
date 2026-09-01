import { NextResponse, type NextRequest } from 'next/server';
import {
  CONTENT_PAGE_DEFAULTS,
  isContentPageSlug,
  isValidContentPageSlug,
  type ContentSectionMutationResponse,
  type RichTextSectionMutationRequest,
} from '@/lib/contentManager';
import { connectToDatabase } from '@/lib/db';
import { Page, type PageSection } from '@/models/Page';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { validateRichTextSection } from '@/server/content/richTextSectionValidation';
import { contentSectionSummary } from '@/server/content/sectionSummary';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function newRichTextSectionKey(slug: string, currentKeys: string[]): string {
  const base = `rich-text-${slug}`.slice(0, 70);
  if (!currentKeys.includes(base)) return base;
  for (let index = 2; index < 100; index += 1) {
    const key = `${base}-${index}`.slice(0, 80);
    if (!currentKeys.includes(key)) return key;
  }
  return `${base}-${Date.now()}`.slice(0, 80);
}

function richTextSection(input: RichTextSectionMutationRequest, key: string): PageSection {
  return {
    key,
    type: 'richText',
    active: input.active,
    hero: null,
    richText: { body: input.body },
    timeline: null,
    cta: null,
    gallery: null,
  };
}

export async function POST(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'content.write');
  if (!authorization.authorized) return authorization.response;

  const { slug } = await context.params;
  if (!isValidContentPageSlug(slug)) {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: 'Content page not found.' },
      { status: 404 },
    );
  }

  let body: Partial<RichTextSectionMutationRequest> | null;
  try {
    body = (await request.json()) as Partial<RichTextSectionMutationRequest>;
  } catch {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateRichTextSection(body);
  if (!validation.valid) {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const storedPage = await Page.findOne({ slug }).select(
    'slug title sections lastEditedAt publishStatus',
  );
  if (!storedPage && !isContentPageSlug(slug)) {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: 'Content page not found.' },
      { status: 404 },
    );
  }
  const defaults = isContentPageSlug(slug)
    ? CONTENT_PAGE_DEFAULTS[slug]
    : { title: slug, navLabel: slug };
  const page =
    storedPage ??
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
  if (existingSection && existingSection.type !== 'richText') {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: 'Selected section is not a rich text section.' },
      { status: 400 },
    );
  }

  const sectionKey =
    existingSection?.key ??
    validation.data.sectionKey ??
    newRichTextSectionKey(
      slug,
      page.sections.map((section) => section.key),
    );
  const nextSection = richTextSection(validation.data, sectionKey);
  if (existingIndex >= 0) {
    page.sections.splice(existingIndex, 1, nextSection);
  } else {
    page.sections.push(nextSection);
  }
  page.publishStatus = 'draft';
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
      message: existingIndex >= 0 ? 'Rich text section saved.' : 'Rich text section added.',
      section: contentSectionSummary(nextSection),
    },
    { status: existingIndex >= 0 ? 200 : 201 },
  );
}
