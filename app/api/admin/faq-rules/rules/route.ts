import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { ManagedContentItemRequest, ManagedContentItemResponse } from '@/lib/faqRules';
import { ResortRule } from '@/models/ResortRule';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';
import { validateManagedContentItem } from '@/server/faqRules/managedContentValidation';

export const runtime = 'nodejs';

export const POST = requirePermission('content.write', async (request: NextRequest, staff) => {
  let body: Partial<ManagedContentItemRequest> | null;
  try {
    body = (await request.json()) as Partial<ManagedContentItemRequest>;
  } catch {
    return NextResponse.json<ManagedContentItemResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateManagedContentItem(body);
  if (!validation.valid) {
    return NextResponse.json<ManagedContentItemResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const existing = await ResortRule.exists({ slug: validation.data.slug });
  if (existing) {
    return NextResponse.json<ManagedContentItemResponse>(
      { message: 'A resort rule with this slug already exists.' },
      { status: 409 },
    );
  }

  const item = await ResortRule.create({
    category: validation.data.category,
    title: validation.data.title,
    slug: validation.data.slug,
    body: validation.data.body,
    relatedLinks: validation.data.relatedLinks,
    displayOrder: validation.data.displayOrder,
    status: validation.data.status,
    seoTitle: validation.data.seoTitle,
    metaDescription: validation.data.metaDescription,
    revisionHistory: [
      {
        title: validation.data.title,
        body: validation.data.body,
        editedBy: staff.userId,
        editedAt: new Date(),
      },
    ],
  });

  await logActivity({
    actorId: staff.userId,
    action: 'create',
    entityType: 'ResortRule',
    entityId: item._id,
    afterSnapshot: {
      category: item.category,
      title: item.title,
      slug: item.slug,
      status: item.status,
      displayOrder: item.displayOrder,
    },
  });

  return NextResponse.json<ManagedContentItemResponse>(
    {
      item: {
        id: item._id.toString(),
        title: item.title,
      },
    },
    { status: 201 },
  );
});
