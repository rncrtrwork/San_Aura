import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { MediaBulkActionRequest, MediaBulkActionResponse } from '@/lib/mediaForms';
import { Album } from '@/models/Album';
import { MediaAsset, type MediaAssetDocument } from '@/models/MediaAsset';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';
import { validateMediaBulkAction } from '@/server/media/mediaValidation';

export const runtime = 'nodejs';

function mediaSnapshot(asset: MediaAssetDocument) {
  return {
    filename: asset.filename,
    albumRef: asset.albumRef?.toString() ?? null,
    approvalStatus: asset.approvalStatus,
    publishToWebsite: asset.publishToWebsite,
    privacyConfirmedNoPeople: asset.privacyConfirmedNoPeople,
    archived: asset.archived,
  };
}

export const POST = requirePermission('media.write', async (request: NextRequest, staff) => {
  let body: Partial<MediaBulkActionRequest> | null;
  try {
    body = (await request.json()) as Partial<MediaBulkActionRequest>;
  } catch {
    return NextResponse.json<MediaBulkActionResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateMediaBulkAction(body);
  if (!validation.valid) {
    return NextResponse.json<MediaBulkActionResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const mediaObjectIds = validation.data.mediaIds.map((mediaId) => new Types.ObjectId(mediaId));
  const albumRef =
    validation.data.action === 'addToAlbum' ? new Types.ObjectId(validation.data.albumId) : null;

  if (albumRef) {
    const albumExists = await Album.exists({ _id: albumRef });
    if (!albumExists) {
      return NextResponse.json<MediaBulkActionResponse>(
        { message: 'Selected album was not found.' },
        { status: 404 },
      );
    }
  }

  const assets = await MediaAsset.find({ _id: { $in: mediaObjectIds } });
  const confirmationDate = new Date();

  for (const asset of assets) {
    const beforeSnapshot = mediaSnapshot(asset);
    if (validation.data.action === 'approve') {
      asset.approvalStatus = 'approved';
      asset.privacyConfirmedNoPeople = true;
      asset.privacyConfirmedBy = new Types.ObjectId(staff.userId);
      asset.privacyConfirmedAt = confirmationDate;
      await asset.save();
    }
    if (validation.data.action === 'unapprove') {
      asset.approvalStatus = 'draft';
      asset.publishToWebsite = false;
      await asset.save();
    }
    if (validation.data.action === 'addToAlbum') {
      asset.albumRef = albumRef;
      await asset.save();
    }
    if (validation.data.action === 'archive') {
      asset.archived = true;
      asset.publishToWebsite = false;
      await asset.save();
    }
    if (validation.data.action === 'restore') {
      asset.archived = false;
      await asset.save();
    }
    if (validation.data.action === 'delete') {
      await asset.deleteOne();
    }

    await logActivity({
      actorId: staff.userId,
      action: validation.data.action === 'delete' ? 'delete' : 'update',
      entityType: 'MediaAsset',
      entityId: asset._id,
      beforeSnapshot,
      afterSnapshot: validation.data.action === 'delete' ? null : mediaSnapshot(asset),
    });
  }

  return NextResponse.json<MediaBulkActionResponse>({ updatedCount: assets.length });
});
