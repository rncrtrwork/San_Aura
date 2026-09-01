import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import {
  isValidContentPageSlug,
  type ContentSectionMutationResponse,
  type ContentSectionStatusRequest,
} from '@/lib/contentManager';
import { Page } from '@/models/Page';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { contentSectionSummary } from '@/server/content/sectionSummary';
import { validateContentSectionStatus } from '@/server/content/sectionValidation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ slug: string; sectionKey: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'content.write');
  if (!authorization.authorized) return authorization.response;

  const { slug, sectionKey } = await context.params;
  if (!isValidContentPageSlug(slug)) {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: 'Content page not found.' },
      { status: 404 },
    );
  }

  let body: Partial<ContentSectionStatusRequest> | null;
  try {
    body = (await request.json()) as Partial<ContentSectionStatusRequest>;
  } catch {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateContentSectionStatus(body);
  if (!validation.valid) {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const page = await Page.findOne({ slug }).select('title slug sections lastEditedAt');
  const section = page?.sections.find((entry) => entry.key === sectionKey);
  if (!page || !section) {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: 'Content section not found.' },
      { status: 404 },
    );
  }

  const beforeActive = section.active;
  section.active = validation.data.active;
  page.lastEditedAt = new Date();
  await page.save();

  await logActivity({
    actorId: authorization.staff.userId,
    action: 'update',
    entityType: 'Page',
    entityId: page._id,
    beforeSnapshot: { slug: page.slug, sectionKey: section.key, active: beforeActive },
    afterSnapshot: { slug: page.slug, sectionKey: section.key, active: section.active },
  });

  return NextResponse.json<ContentSectionMutationResponse>({
    message: 'Section status saved.',
    section: contentSectionSummary(section),
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
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
  const section = page?.sections.find((entry) => entry.key === sectionKey);
  if (!page || !section) {
    return NextResponse.json<ContentSectionMutationResponse>(
      { message: 'Content section not found.' },
      { status: 404 },
    );
  }

  page.sections.splice(
    0,
    page.sections.length,
    ...page.sections.filter((entry) => entry.key !== sectionKey),
  );
  page.lastEditedAt = new Date();
  await page.save();

  await logActivity({
    actorId: authorization.staff.userId,
    action: 'delete',
    entityType: 'Page',
    entityId: page._id,
    beforeSnapshot: {
      slug: page.slug,
      sectionKey: section.key,
      sectionType: section.type,
      active: section.active,
    },
  });

  return NextResponse.json<ContentSectionMutationResponse>({
    message: 'Section deleted.',
  });
}
