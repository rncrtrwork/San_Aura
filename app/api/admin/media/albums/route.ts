import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { MediaAlbumCreateRequest, MediaAlbumCreateResponse } from '@/lib/mediaForms';
import { Album } from '@/models/Album';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';
import { validateMediaAlbumCreate } from '@/server/media/mediaValidation';

export const runtime = 'nodejs';

export const POST = requirePermission('media.write', async (request: NextRequest, staff) => {
  let body: Partial<MediaAlbumCreateRequest> | null;
  try {
    body = (await request.json()) as Partial<MediaAlbumCreateRequest>;
  } catch {
    return NextResponse.json<MediaAlbumCreateResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateMediaAlbumCreate(body);
  if (!validation.valid) {
    return NextResponse.json<MediaAlbumCreateResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const parentRef = validation.data.parentId ? new Types.ObjectId(validation.data.parentId) : null;
  if (parentRef) {
    const parentExists = await Album.exists({ _id: parentRef });
    if (!parentExists) {
      return NextResponse.json<MediaAlbumCreateResponse>(
        { message: 'Parent album was not found.' },
        { status: 404 },
      );
    }
  }

  const duplicate = await Album.exists({ parentRef, slug: validation.data.slug });
  if (duplicate) {
    return NextResponse.json<MediaAlbumCreateResponse>(
      { message: 'An album with this name already exists at that level.' },
      { status: 409 },
    );
  }

  const album = await Album.create({
    name: validation.data.name,
    slug: validation.data.slug,
    parentRef,
  });

  await logActivity({
    actorId: staff.userId,
    action: 'create',
    entityType: 'Album',
    entityId: album._id,
    afterSnapshot: {
      name: album.name,
      slug: album.slug,
      parentRef: album.parentRef?.toString() ?? null,
    },
  });

  return NextResponse.json<MediaAlbumCreateResponse>(
    {
      album: {
        id: album._id.toString(),
        name: album.name,
      },
    },
    { status: 201 },
  );
});
