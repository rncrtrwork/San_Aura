import { Types } from 'mongoose';
import type {
  MediaAssetCreateRequest,
  MediaAssetUpdateRequest,
  MediaBulkAction,
  MediaBulkActionRequest,
} from '@/lib/mediaForms';
import { MEDIA_USAGE_TYPES, type MediaUsage } from '@/lib/mediaOptions';

export type MediaValidationResult =
  | { valid: true; data: MediaAssetCreateRequest }
  | { valid: false; message: string };

export type MediaUpdateValidationResult =
  | { valid: true; data: MediaAssetUpdateRequest }
  | { valid: false; message: string };

export type MediaBulkValidationResult =
  | { valid: true; data: MediaBulkActionRequest }
  | { valid: false; message: string };

const MEDIA_BULK_ACTIONS: MediaBulkAction[] = [
  'approve',
  'unapprove',
  'addToAlbum',
  'archive',
  'delete',
];

function textValue(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

function hasValidUsage(usage: MediaUsage[]): boolean {
  return usage.every((entry) => MEDIA_USAGE_TYPES.includes(entry));
}

function isValidMediaUrl(value: string): boolean {
  return value.startsWith('https://res.cloudinary.com/') && value.length <= 2000;
}

function isValidMediaPublicId(value: string): boolean {
  return value.startsWith('sun-aura/media/') && value.length <= 500;
}

function focalValue(value: number): number | null {
  return Number.isInteger(value) && value >= 0 && value <= 100 ? value : null;
}

export function validateMediaAssetCreate(
  input: Partial<MediaAssetCreateRequest> | null,
): MediaValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Media details are required.' };
  }

  const filename = typeof input.filename === 'string' ? textValue(input.filename, 255) : '';
  const cloudinaryUrl =
    typeof input.cloudinaryUrl === 'string' ? textValue(input.cloudinaryUrl, 2000) : '';
  const cloudinaryPublicId =
    typeof input.cloudinaryPublicId === 'string' ? textValue(input.cloudinaryPublicId, 500) : '';
  const mimeType = typeof input.mimeType === 'string' ? textValue(input.mimeType, 120) : '';
  const altText = typeof input.altText === 'string' ? textValue(input.altText, 300) : '';
  const caption = typeof input.caption === 'string' ? textValue(input.caption, 1000) : '';
  const albumId = typeof input.albumId === 'string' ? input.albumId.trim() : '';
  const usage = Array.isArray(input.usage) ? input.usage : [];
  const dimensions = input.dimensions;

  if (!filename || !mimeType || !altText) {
    return { valid: false, message: 'Filename, MIME type, and alt text are required.' };
  }
  if (!isValidMediaUrl(cloudinaryUrl) || !isValidMediaPublicId(cloudinaryPublicId)) {
    return { valid: false, message: 'Uploaded media must come from the resort media folder.' };
  }
  if (albumId && !Types.ObjectId.isValid(albumId)) {
    return { valid: false, message: 'Selected album is invalid.' };
  }
  if (!hasValidUsage(usage)) {
    return { valid: false, message: 'Selected usage is invalid.' };
  }
  if (
    !dimensions ||
    !Number.isInteger(dimensions.width) ||
    !Number.isInteger(dimensions.height) ||
    dimensions.width < 1 ||
    dimensions.height < 1
  ) {
    return { valid: false, message: 'Media dimensions are required.' };
  }
  if (!input.privacyConfirmedNoPeople) {
    return { valid: false, message: 'Confirm this upload contains no identifiable people.' };
  }

  return {
    valid: true,
    data: {
      filename,
      cloudinaryUrl,
      cloudinaryPublicId,
      mimeType,
      altText,
      caption,
      albumId,
      usage,
      privacyConfirmedNoPeople: true,
      dimensions,
    },
  };
}

export function validateMediaAssetUpdate(
  input: Partial<MediaAssetUpdateRequest> | null,
): MediaUpdateValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Media details are required.' };
  }

  const altText = typeof input.altText === 'string' ? textValue(input.altText, 300) : '';
  const caption = typeof input.caption === 'string' ? textValue(input.caption, 1000) : '';
  const albumId = typeof input.albumId === 'string' ? input.albumId.trim() : '';
  const usage = Array.isArray(input.usage) ? input.usage : [];
  const focalPoint = input.focalPoint;
  const focalX = focalPoint ? focalValue(focalPoint.x) : null;
  const focalY = focalPoint ? focalValue(focalPoint.y) : null;

  if (!altText) {
    return { valid: false, message: 'Alt text is required.' };
  }
  if (albumId && !Types.ObjectId.isValid(albumId)) {
    return { valid: false, message: 'Selected album is invalid.' };
  }
  if (!hasValidUsage(usage)) {
    return { valid: false, message: 'Selected usage is invalid.' };
  }
  if (focalX === null || focalY === null) {
    return { valid: false, message: 'Focal point must stay between 0 and 100.' };
  }

  return {
    valid: true,
    data: {
      altText,
      caption,
      albumId,
      usage,
      focalPoint: {
        x: focalX,
        y: focalY,
      },
    },
  };
}

export function validateMediaBulkAction(
  input: Partial<MediaBulkActionRequest> | null,
): MediaBulkValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Bulk action details are required.' };
  }

  const action = input.action;
  const mediaIds = Array.isArray(input.mediaIds)
    ? input.mediaIds.filter(
        (mediaId) => typeof mediaId === 'string' && Types.ObjectId.isValid(mediaId),
      )
    : [];
  const albumId = typeof input.albumId === 'string' ? input.albumId.trim() : '';

  if (!action || !MEDIA_BULK_ACTIONS.includes(action)) {
    return { valid: false, message: 'Select a valid bulk action.' };
  }
  if (mediaIds.length === 0) {
    return { valid: false, message: 'Select at least one media asset.' };
  }
  if (mediaIds.length > 100) {
    return { valid: false, message: 'Bulk actions are limited to 100 assets.' };
  }
  if (action === 'addToAlbum' && (!albumId || !Types.ObjectId.isValid(albumId))) {
    return { valid: false, message: 'Choose an album for this bulk action.' };
  }
  if (action === 'approve' && !input.privacyConfirmedNoPeople) {
    return { valid: false, message: 'Confirm selected assets contain no identifiable people.' };
  }

  return {
    valid: true,
    data: {
      action,
      mediaIds,
      albumId,
      privacyConfirmedNoPeople: input.privacyConfirmedNoPeople === true,
    },
  };
}
