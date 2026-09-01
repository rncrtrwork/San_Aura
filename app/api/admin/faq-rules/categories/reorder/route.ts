import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { FaqCategoryReorderRequest, FaqCategoryReorderResponse } from '@/lib/faqRules';
import { FAQItem } from '@/models/FAQItem';
import { Policy } from '@/models/Policy';
import { ResortRule } from '@/models/ResortRule';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';
import { validateFaqCategoryReorder } from '@/server/faqRules/categoryValidation';

export const runtime = 'nodejs';

export const POST = requirePermission('content.write', async (request: NextRequest, staff) => {
  let body: Partial<FaqCategoryReorderRequest> | null;
  try {
    body = (await request.json()) as Partial<FaqCategoryReorderRequest>;
  } catch {
    return NextResponse.json<FaqCategoryReorderResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateFaqCategoryReorder(body);
  if (!validation.valid) {
    return NextResponse.json<FaqCategoryReorderResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const operations = validation.data.categories.map((category, index) => ({
    updateMany: {
      filter: { category },
      update: { $set: { displayOrder: index * 1000 } },
    },
  }));
  const result =
    validation.data.tab === 'rules'
      ? await ResortRule.bulkWrite(operations)
      : validation.data.tab === 'policies'
        ? await Policy.bulkWrite(operations)
        : await FAQItem.bulkWrite(operations);

  await logActivity({
    actorId: staff.userId,
    action: 'update',
    entityType:
      validation.data.tab === 'rules'
        ? 'ResortRule'
        : validation.data.tab === 'policies'
          ? 'Policy'
          : 'FAQItem',
    entityId: staff.userId,
    afterSnapshot: {
      categoryOrder: validation.data.categories,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    },
  });

  return NextResponse.json<FaqCategoryReorderResponse>({ updatedCount: result.modifiedCount });
});
