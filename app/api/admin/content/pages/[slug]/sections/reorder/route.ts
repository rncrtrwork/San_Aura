import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import {
  isContentPageSlug,
  type ContentSectionOrderRequest,
  type ContentSectionOrderResponse,
} from '@/lib/contentManager';
import { Page } from '@/models/Page';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { validateContentSectionOrder } from '@/server/content/sectionValidation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'content.write');
  if (!authorization.authorized) return authorization.response;

  const { slug } = await context.params;
  if (!isContentPageSlug(slug)) {
    return NextResponse.json<ContentSectionOrderResponse>(
      { message: 'Content page not found.' },
      { status: 404 },
    );
  }

  let body: Partial<ContentSectionOrderRequest> | null;
  try {
    body = (await request.json()) as Partial<ContentSectionOrderRequest>;
  } catch {
    return NextResponse.json<ContentSectionOrderResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateContentSectionOrder(body);
  if (!validation.valid) {
    return NextResponse.json<ContentSectionOrderResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const page = await Page.findOne({ slug }).select('title slug sections lastEditedAt');
  if (!page) {
    return NextResponse.json<ContentSectionOrderResponse>(
      { message: 'Content page not found.' },
      { status: 404 },
    );
  }

  const currentKeys = page.sections.map((section) => section.key);
  const requestedKeySet = new Set(validation.data.sectionKeys);
  const currentKeySet = new Set(currentKeys);
  const includesEveryCurrentKey = currentKeys.every((key) => requestedKeySet.has(key));
  const includesOnlyCurrentKeys = validation.data.sectionKeys.every((key) =>
    currentKeySet.has(key),
  );
  if (
    validation.data.sectionKeys.length !== currentKeys.length ||
    !includesEveryCurrentKey ||
    !includesOnlyCurrentKeys
  ) {
    return NextResponse.json<ContentSectionOrderResponse>(
      { message: 'Section order must include every current section exactly once.' },
      { status: 400 },
    );
  }

  const sectionsByKey = new Map(page.sections.map((section) => [section.key, section]));
  page.sections.splice(
    0,
    page.sections.length,
    ...validation.data.sectionKeys.flatMap((key) => {
      const section = sectionsByKey.get(key);
      return section ? [section] : [];
    }),
  );
  page.lastEditedAt = new Date();
  await page.save();

  await logActivity({
    actorId: authorization.staff.userId,
    action: 'update',
    entityType: 'Page',
    entityId: page._id,
    beforeSnapshot: { slug: page.slug, sectionOrder: currentKeys },
    afterSnapshot: { slug: page.slug, sectionOrder: validation.data.sectionKeys },
  });

  return NextResponse.json<ContentSectionOrderResponse>({
    message: 'Section order saved.',
    sectionKeys: validation.data.sectionKeys,
  });
}
