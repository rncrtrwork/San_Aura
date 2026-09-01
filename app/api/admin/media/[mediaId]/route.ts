import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import type { MediaAssetMutationResponse, MediaAssetUpdateRequest } from '@/lib/mediaForms';
import { connectToDatabase } from '@/lib/db';
import { Album } from '@/models/Album';
import { MediaAsset } from '@/models/MediaAsset';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { validateMediaAssetUpdate } from '@/server/media/mediaValidation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ mediaId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'media.write');
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { mediaId } = await context.params;
  if (!Types.ObjectId.isValid(mediaId)) {
    return NextResponse.json<MediaAssetMutationResponse>(
      { message: 'Media asset not found.' },
      { status: 404 },
    );
  }

  let body: Partial<MediaAssetUpdateRequest> | null;
  try {
    body = (await request.json()) as Partial<MediaAssetUpdateRequest>;
  } catch {
    return NextResponse.json<MediaAssetMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateMediaAssetUpdate(body);
  if (!validation.valid) {
    return NextResponse.json<MediaAssetMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const asset = await MediaAsset.findById(mediaId);
  if (!asset) {
    return NextResponse.json<MediaAssetMutationResponse>(
      { message: 'Media asset not found.' },
      { status: 404 },
    );
  }

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

  const beforeSnapshot = {
    altText: asset.altText,
    caption: asset.caption,
    albumRef: asset.albumRef?.toString() ?? null,
    usage: asset.usage,
    approvalStatus: asset.approvalStatus,
    publishToWebsite: asset.publishToWebsite,
    focalPointX: asset.focalPoint.x,
    focalPointY: asset.focalPoint.y,
  };

  asset.altText = validation.data.altText;
  asset.caption = validation.data.caption;
  asset.albumRef = albumRef;
  asset.usage = validation.data.usage;
  asset.approvalStatus = validation.data.approvalStatus;
  asset.publishToWebsite = validation.data.publishToWebsite;
  asset.focalPoint = validation.data.focalPoint;
  await asset.save();

  await logActivity({
    actorId: authorization.staff.userId,
    action: 'update',
    entityType: 'MediaAsset',
    entityId: asset._id,
    beforeSnapshot,
    afterSnapshot: {
      altText: asset.altText,
      caption: asset.caption,
      albumRef: asset.albumRef?.toString() ?? null,
      usage: asset.usage,
      approvalStatus: asset.approvalStatus,
      publishToWebsite: asset.publishToWebsite,
      focalPointX: asset.focalPoint.x,
      focalPointY: asset.focalPoint.y,
    },
  });

  return NextResponse.json<MediaAssetMutationResponse>({
    media: {
      id: asset._id.toString(),
      filename: asset.filename,
    },
  });
}
