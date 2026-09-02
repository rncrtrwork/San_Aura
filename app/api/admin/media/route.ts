import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import type { MediaAssetMutationResponse, MediaAssetCreateRequest } from '@/lib/mediaForms';
import { connectToDatabase } from '@/lib/db';
import { Album } from '@/models/Album';
import { MediaAsset } from '@/models/MediaAsset';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';
import { validateMediaAssetCreate } from '@/server/media/mediaValidation';

export const runtime = 'nodejs';

export const POST = requirePermission('media.write', async (request: NextRequest, staff) => {
  let body: Partial<MediaAssetCreateRequest> | null;
  try {
    body = (await request.json()) as Partial<MediaAssetCreateRequest>;
  } catch {
    return NextResponse.json<MediaAssetMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateMediaAssetCreate(body);
  if (!validation.valid) {
    return NextResponse.json<MediaAssetMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const albumRef = validation.data.albumId ? new Types.ObjectId(validation.data.albumId) : null;
  if (albumRef) {
    const albumExists = await Album.exists({ _id: albumRef });
    if (!albumExists) {
      return NextResponse.json<MediaAssetMutationResponse>(
        { message: 'Selected album was not found.' },
        { status: 404 },
      );
    }
  }

  const asset = await MediaAsset.create({
    filename: validation.data.filename,
    cloudinaryUrl: validation.data.cloudinaryUrl,
    cloudinaryPublicId: validation.data.cloudinaryPublicId,
    mimeType: validation.data.mimeType,
    altText: validation.data.altText,
    caption: validation.data.caption,
    albumRef,
    usage: validation.data.usage,
    approvalStatus: 'approved',
    publishToWebsite: true,
    privacyConfirmedNoPeople: true,
    privacyConfirmedBy: staff.userId,
    privacyConfirmedAt: new Date(),
    focalPoint: { x: 50, y: 50 },
    dimensions: validation.data.dimensions,
    archived: false,
    uploadedBy: staff.userId,
  });

  await logActivity({
    actorId: staff.userId,
    action: 'create',
    entityType: 'MediaAsset',
    entityId: asset._id,
    afterSnapshot: {
      filename: asset.filename,
      approvalStatus: asset.approvalStatus,
      publishToWebsite: asset.publishToWebsite,
      privacyConfirmedNoPeople: asset.privacyConfirmedNoPeople,
    },
  });

  return NextResponse.json<MediaAssetMutationResponse>(
    {
      media: {
        id: asset._id.toString(),
        filename: asset.filename,
      },
    },
    { status: 201 },
  );
});
