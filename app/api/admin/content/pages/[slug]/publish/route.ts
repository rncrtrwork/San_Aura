import { NextResponse, type NextRequest } from 'next/server';
import { isValidContentPageSlug, type ContentPagePublishResponse } from '@/lib/contentManager';
import { connectToDatabase } from '@/lib/db';
import { Page } from '@/models/Page';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { contentPagePublishSnapshot } from '@/server/content/pagePublishSnapshot';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'content.write');
  if (!authorization.authorized) return authorization.response;

  const { slug } = await context.params;
  if (!isValidContentPageSlug(slug)) {
    return NextResponse.json<ContentPagePublishResponse>(
      { message: 'Content page not found.' },
      { status: 404 },
    );
  }

  await connectToDatabase();
  const page = await Page.findOne({ slug }).select(
    'slug title publishStatus lastEditedAt sections.key sections.type sections.active',
  );
  if (!page) {
    return NextResponse.json<ContentPagePublishResponse>(
      { message: 'Content page not found.' },
      { status: 404 },
    );
  }

  if (page.publishStatus === 'published') {
    return NextResponse.json<ContentPagePublishResponse>({
      message: 'Page is already published.',
      publishStatus: page.publishStatus,
      lastEditedAt: page.lastEditedAt.toISOString(),
    });
  }

  const beforeSnapshot = contentPagePublishSnapshot(page);
  page.publishStatus = 'published';
  page.lastEditedAt = new Date();
  await page.save();

  await logActivity({
    actorId: authorization.staff.userId,
    action: 'publish',
    entityType: 'Page',
    entityId: page._id,
    beforeSnapshot,
    afterSnapshot: contentPagePublishSnapshot(page),
  });

  return NextResponse.json<ContentPagePublishResponse>({
    message: 'Page published.',
    publishStatus: page.publishStatus,
    lastEditedAt: page.lastEditedAt.toISOString(),
  });
}
