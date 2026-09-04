import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { MediaAssetCreateRequest } from '@/lib/mediaForms';
import { mediaTypeFromMime } from '@/lib/mediaLibrary';
import { parseMediaLibraryFilters } from '@/server/media/getMediaLibrary';
import {
  validateMediaAssetCreate,
  validateMediaAssetUpdate,
  validateMediaBulkAction,
  validateMediaAlbumCreate,
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
    view: 'all',
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
    view: 'all',
    search: '',
    mediaType: 'all',
    albumId: '',
    usage: 'all',
    approvalStatus: 'all',
  });
});

test('media library filters accept usage and archived tab views', () => {
  const homepage = parseMediaLibraryFilters({ view: 'homepage' });
  const archived = parseMediaLibraryFilters({ view: 'archived' });

  assert.equal(homepage.view, 'homepage');
  assert.equal(archived.view, 'archived');
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

test('media upload validation allows gallery photos without homepage selection', () => {
  const result = validateMediaAssetCreate({
    ...validUpload,
    usage: [],
  });

  assert.equal(result.valid, true);
});

test('media upload validation allows admin gallery uploads without privacy confirmation', () => {
  const result = validateMediaAssetCreate({
    ...validUpload,
    privacyConfirmedNoPeople: false,
  });

  assert.equal(result.valid, true);
});

test('media upload validation rejects non-image gallery uploads', () => {
  const result = validateMediaAssetCreate({
    ...validUpload,
    filename: 'brochure.pdf',
    mimeType: 'application/pdf',
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
    approvalStatus: 'approved',
    publishToWebsite: true,
    privacyConfirmedNoPeople: true,
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
    approvalStatus: 'approved',
    publishToWebsite: false,
    privacyConfirmedNoPeople: true,
    focalPoint: {
      x: 101,
      y: 42,
    },
  });

  assert.equal(result.valid, false);
});

test('media detail validation rejects publishing unapproved assets', () => {
  const result = validateMediaAssetUpdate({
    altText: 'Cabin porch at sunset',
    caption: '',
    albumId: '',
    usage: ['stayType'],
    approvalStatus: 'draft',
    publishToWebsite: true,
    privacyConfirmedNoPeople: true,
    focalPoint: {
      x: 50,
      y: 50,
    },
  });

  assert.equal(result.valid, false);
});

test('media detail validation allows approval without privacy confirmation', () => {
  const result = validateMediaAssetUpdate({
    altText: 'Cabin porch at sunset',
    caption: '',
    albumId: '',
    usage: ['stayType'],
    approvalStatus: 'approved',
    publishToWebsite: false,
    privacyConfirmedNoPeople: false,
    focalPoint: {
      x: 50,
      y: 50,
    },
  });

  assert.equal(result.valid, true);
});

test('media bulk validation accepts approve actions', () => {
  const result = validateMediaBulkAction({
    action: 'approve',
    mediaIds: ['64f5f5f5f5f5f5f5f5f5f5f5'],
    albumId: '',
    privacyConfirmedNoPeople: true,
  });

  assert.equal(result.valid, true);
});

test('media bulk validation accepts approve actions without privacy confirmation', () => {
  const result = validateMediaBulkAction({
    action: 'approve',
    mediaIds: ['64f5f5f5f5f5f5f5f5f5f5f5'],
    albumId: '',
    privacyConfirmedNoPeople: false,
  });

  assert.equal(result.valid, true);
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

test('media bulk validation accepts gallery photo restore actions', () => {
  const result = validateMediaBulkAction({
    action: 'restore',
    mediaIds: ['64f5f5f5f5f5f5f5f5f5f5f5'],
    albumId: '',
    privacyConfirmedNoPeople: false,
  });

  assert.equal(result.valid, true);
});

test('media album validation creates stable nested album slugs', () => {
  const result = validateMediaAlbumCreate({
    name: 'Stay Types > Cabins',
    parentId: '64f5f5f5f5f5f5f5f5f5f5f5',
  });

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.slug, 'stay-types-cabins');
  }
});

test('media album validation rejects invalid parent ids', () => {
  const result = validateMediaAlbumCreate({
    name: 'Cabins',
    parentId: 'not-an-id',
  });

  assert.equal(result.valid, false);
});
