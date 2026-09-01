import { NextResponse, type NextRequest } from 'next/server';
import type {
  ContentPageCreateRequest,
  ContentPageCreateResponse,
  ContentPageListItem,
} from '@/lib/contentManager';
import { connectToDatabase } from '@/lib/db';
import { Page } from '@/models/Page';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';
import { validateContentPage } from '@/server/content/pageValidation';

export const runtime = 'nodejs';

function serializePage(page: {
  slug: string;
  title: string;
  navLabel: string;
  publishStatus: ContentPageListItem['publishStatus'];
  navVisibility: boolean;
  lastEditedAt: Date;
  sections: { type: ContentPageListItem['sectionTypes'][number] }[];
}): ContentPageListItem {
  const sectionTypes = page.sections.map((section) => section.type);

  return {
    slug: page.slug,
    title: page.title,
    navLabel: page.navLabel,
    publishStatus: page.publishStatus,
    lastEditedAt: page.lastEditedAt.toISOString(),
    sectionCount: sectionTypes.length,
    sectionTypes,
    sections: [],
    exists: true,
  };
}

export const POST = requirePermission('content.write', async (request: NextRequest, staff) => {
  let body: Partial<ContentPageCreateRequest> | null;
  try {
    body = (await request.json()) as Partial<ContentPageCreateRequest>;
  } catch {
    return NextResponse.json<ContentPageCreateResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateContentPage(body);
  if (!validation.valid) {
    return NextResponse.json<ContentPageCreateResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const existing = await Page.exists({ slug: validation.data.slug });
  if (existing) {
    return NextResponse.json<ContentPageCreateResponse>(
      { message: 'A content page with this slug already exists.' },
      { status: 409 },
    );
  }

  const now = new Date();
  const page = await Page.create({
    slug: validation.data.slug,
    title: validation.data.title,
    navLabel: validation.data.navLabel,
    navVisibility: validation.data.navVisibility,
    seoTitle: validation.data.seoTitle,
    metaDescription: validation.data.metaDescription,
    publishStatus: validation.data.publishStatus,
    sections: [],
    lastEditedAt: now,
  });

  await logActivity({
    actorId: staff.userId,
    action: 'create',
    entityType: 'Page',
    entityId: page._id,
    afterSnapshot: {
      slug: page.slug,
      title: page.title,
      publishStatus: page.publishStatus,
      navVisibility: page.navVisibility,
    },
  });

  return NextResponse.json<ContentPageCreateResponse>(
    {
      page: serializePage(page),
      message: 'Content page created.',
    },
    { status: 201 },
  );
});
