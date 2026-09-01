import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { FaqItemCreateRequest, FaqItemCreateResponse } from '@/lib/faqRules';
import { FAQItem } from '@/models/FAQItem';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';
import { validateFaqItemCreate } from '@/server/faqRules/faqItemValidation';

export const runtime = 'nodejs';

export const POST = requirePermission('content.write', async (request: NextRequest, staff) => {
  let body: Partial<FaqItemCreateRequest> | null;
  try {
    body = (await request.json()) as Partial<FaqItemCreateRequest>;
  } catch {
    return NextResponse.json<FaqItemCreateResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateFaqItemCreate(body);
  if (!validation.valid) {
    return NextResponse.json<FaqItemCreateResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const existing = await FAQItem.exists({ slug: validation.data.slug });
  if (existing) {
    return NextResponse.json<FaqItemCreateResponse>(
      { message: 'A FAQ item with this slug already exists.' },
      { status: 409 },
    );
  }

  const item = await FAQItem.create({
    category: validation.data.category,
    question: validation.data.question,
    slug: validation.data.slug,
    answer: validation.data.answer,
    relatedLinks: validation.data.relatedLinks,
    displayOrder: validation.data.displayOrder,
    status: validation.data.status,
    featured: validation.data.featured,
    seoTitle: validation.data.seoTitle,
    metaDescription: validation.data.metaDescription,
    revisionHistory: [
      {
        title: validation.data.question,
        body: validation.data.answer,
        editedBy: staff.userId,
        editedAt: new Date(),
      },
    ],
  });

  await logActivity({
    actorId: staff.userId,
    action: 'create',
    entityType: 'FAQItem',
    entityId: item._id,
    afterSnapshot: {
      category: item.category,
      question: item.question,
      slug: item.slug,
      status: item.status,
      displayOrder: item.displayOrder,
      featured: item.featured,
    },
  });

  return NextResponse.json<FaqItemCreateResponse>(
    {
      item: {
        id: item._id.toString(),
        question: item.question,
      },
    },
    { status: 201 },
  );
});
