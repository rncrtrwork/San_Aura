import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { ManagedContentItemRequest, ManagedContentItemResponse } from '@/lib/faqRules';
import { Policy } from '@/models/Policy';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { validateManagedContentItem } from '@/server/faqRules/managedContentValidation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ itemId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'content.write');
  if (!authorization.authorized) return authorization.response;

  const { itemId } = await context.params;
  if (!Types.ObjectId.isValid(itemId)) {
    return NextResponse.json<ManagedContentItemResponse>(
      { message: 'Policy not found.' },
      { status: 404 },
    );
  }

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
  const item = await Policy.findById(itemId).select(
    'category title slug body relatedLinks displayOrder status seoTitle metaDescription revisionHistory',
  );
  if (!item) {
    return NextResponse.json<ManagedContentItemResponse>(
      { message: 'Policy not found.' },
      { status: 404 },
    );
  }

  const duplicate = await Policy.exists({
    _id: { $ne: item._id },
    slug: validation.data.slug,
  });
  if (duplicate) {
    return NextResponse.json<ManagedContentItemResponse>(
      { message: 'A policy with this slug already exists.' },
      { status: 409 },
    );
  }

  const beforeSnapshot = {
    category: item.category,
    title: item.title,
    slug: item.slug,
    status: item.status,
    displayOrder: item.displayOrder,
  };
  item.set({
    category: validation.data.category,
    title: validation.data.title,
    slug: validation.data.slug,
    body: validation.data.body,
    relatedLinks: validation.data.relatedLinks,
    displayOrder: validation.data.displayOrder,
    status: validation.data.status,
    seoTitle: validation.data.seoTitle,
    metaDescription: validation.data.metaDescription,
  });
  item.revisionHistory.push({
    title: validation.data.title,
    body: validation.data.body,
    editedBy: new Types.ObjectId(authorization.staff.userId),
    editedAt: new Date(),
  });
  await item.save();

  await logActivity({
    actorId: authorization.staff.userId,
    action: beforeSnapshot.status !== item.status ? 'status-change' : 'update',
    entityType: 'Policy',
    entityId: item._id,
    beforeSnapshot,
    afterSnapshot: {
      category: item.category,
      title: item.title,
      slug: item.slug,
      status: item.status,
      displayOrder: item.displayOrder,
    },
  });

  return NextResponse.json<ManagedContentItemResponse>({
    item: {
      id: item._id.toString(),
      title: item.title,
    },
    message: 'Policy updated.',
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'content.write');
  if (!authorization.authorized) return authorization.response;

  const { itemId } = await context.params;
  if (!Types.ObjectId.isValid(itemId)) {
    return NextResponse.json<ManagedContentItemResponse>(
      { message: 'Policy not found.' },
      { status: 404 },
    );
  }

  await connectToDatabase();
  const item = await Policy.findById(itemId).select('category title slug status displayOrder');
  if (!item) {
    return NextResponse.json<ManagedContentItemResponse>(
      { message: 'Policy not found.' },
      { status: 404 },
    );
  }

  const beforeSnapshot = {
    category: item.category,
    title: item.title,
    slug: item.slug,
    status: item.status,
    displayOrder: item.displayOrder,
  };
  await item.deleteOne();
  await logActivity({
    actorId: authorization.staff.userId,
    action: 'delete',
    entityType: 'Policy',
    entityId: item._id,
    beforeSnapshot,
  });

  return NextResponse.json<ManagedContentItemResponse>({
    message: 'Policy deleted.',
  });
}
