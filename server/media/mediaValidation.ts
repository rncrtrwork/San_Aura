import { Types } from 'mongoose';
import type { MediaAssetCreateRequest } from '@/lib/mediaForms';
import { MEDIA_USAGE_TYPES, type MediaUsage } from '@/lib/mediaOptions';

export type MediaValidationResult =
  | { valid: true; data: MediaAssetCreateRequest }
  | { valid: false; message: string };

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
