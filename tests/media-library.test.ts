import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { MediaAssetCreateRequest } from '@/lib/mediaForms';
import { mediaTypeFromMime } from '@/lib/mediaLibrary';
import { parseMediaLibraryFilters } from '@/server/media/getMediaLibrary';
import {
  validateMediaAssetCreate,
  validateMediaAssetUpdate,
  validateMediaBulkAction,
} from '@/server/media/mediaValidation';

const validUpload: MediaAssetCreateRequest = {
  cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sun-aura/media/cabin.jpg',
  cloudinaryPublicId: 'sun-aura/media/cabin',
  filename: 'cabin.jpg',
  mimeType: 'image/jpeg',
  altText: 'Cabin exterior',
  caption: '',
  albumId: '',
  usage: ['homepage'],
  privacyConfirmedNoPeople: true,
  dimensions: {
    width: 1200,
    height: 800,
  },
};

test('media library filters accept known filter values', () => {
  const filters = parseMediaLibraryFilters({
    search: ' cabins ',
    mediaType: 'image',
    albumId: '64f5f5f5f5f5f5f5f5f5f5f5',
    usage: 'homepage',
    approvalStatus: 'approved',
  });

  assert.deepEqual(filters, {
    search: 'cabins',
    mediaType: 'image',
    albumId: '64f5f5f5f5f5f5f5f5f5f5f5',
    usage: 'homepage',
    approvalStatus: 'approved',
  });
});

test('media library filters fall back when values are invalid', () => {
  const filters = parseMediaLibraryFilters({
    mediaType: 'audio',
    albumId: 'not-an-id',
    usage: 'hero',
    approvalStatus: 'published',
  });

  assert.deepEqual(filters, {
    search: '',
    mediaType: 'all',
    albumId: '',
    usage: 'all',
    approvalStatus: 'all',
  });
});

test('media mime type classification groups image, video, and document assets', () => {
  assert.equal(mediaTypeFromMime('image/webp'), 'image');
  assert.equal(mediaTypeFromMime('video/mp4'), 'video');
  assert.equal(mediaTypeFromMime('application/pdf'), 'document');
});

test('media upload validation accepts Cloudinary media folder uploads', () => {
  const result = validateMediaAssetCreate(validUpload);

  assert.equal(result.valid, true);
});

test('media upload validation requires no people confirmation', () => {
  const result = validateMediaAssetCreate({
    ...validUpload,
    privacyConfirmedNoPeople: false,
  });

  assert.equal(result.valid, false);
});

test('media upload validation rejects assets outside the media folder', () => {
  const result = validateMediaAssetCreate({
    ...validUpload,
    cloudinaryPublicId: 'sun-aura/events/cabin',
  });

  assert.equal(result.valid, false);
});

test('media detail validation accepts metadata and focal point updates', () => {
  const result = validateMediaAssetUpdate({
    altText: 'Cabin porch at sunset',
    caption: 'Quiet cabin exterior',
    albumId: '',
    usage: ['stayType'],
    focalPoint: {
      x: 35,
      y: 42,
    },
  });

  assert.equal(result.valid, true);
});

test('media detail validation rejects focal points outside the image bounds', () => {
  const result = validateMediaAssetUpdate({
    altText: 'Cabin porch at sunset',
    caption: '',
    albumId: '',
    usage: ['stayType'],
    focalPoint: {
      x: 101,
      y: 42,
    },
  });

  assert.equal(result.valid, false);
});

test('media bulk validation accepts approve actions with privacy confirmation', () => {
  const result = validateMediaBulkAction({
    action: 'approve',
    mediaIds: ['64f5f5f5f5f5f5f5f5f5f5f5'],
    albumId: '',
    privacyConfirmedNoPeople: true,
  });

  assert.equal(result.valid, true);
});

test('media bulk validation requires privacy confirmation before approval', () => {
  const result = validateMediaBulkAction({
    action: 'approve',
    mediaIds: ['64f5f5f5f5f5f5f5f5f5f5f5'],
    albumId: '',
    privacyConfirmedNoPeople: false,
  });

  assert.equal(result.valid, false);
});

test('media bulk validation requires an album for bulk album assignment', () => {
  const result = validateMediaBulkAction({
    action: 'addToAlbum',
    mediaIds: ['64f5f5f5f5f5f5f5f5f5f5f5'],
    albumId: '',
    privacyConfirmedNoPeople: false,
  });

  assert.equal(result.valid, false);
});
