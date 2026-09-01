import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mediaTypeFromMime } from '@/lib/mediaLibrary';
import { parseMediaLibraryFilters } from '@/server/media/getMediaLibrary';

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
