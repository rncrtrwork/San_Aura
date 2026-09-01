import {
  MEDIA_APPROVAL_STATUSES,
  MEDIA_USAGE_TYPES,
  type FocalPoint,
  type MediaApprovalStatus,
  type MediaDimensions,
  type MediaUsage,
} from '@/lib/mediaOptions';

export const MEDIA_TYPE_FILTERS = ['all', 'image', 'video', 'document'] as const;
export const MEDIA_APPROVAL_FILTERS = ['all', ...MEDIA_APPROVAL_STATUSES] as const;
export const MEDIA_USAGE_FILTERS = ['all', ...MEDIA_USAGE_TYPES] as const;
export const MEDIA_LIBRARY_VIEWS = [
  'all',
  'homepage',
  'stayType',
  'event',
  'mapAsset',
  'archived',
] as const;

export type MediaTypeFilter = (typeof MEDIA_TYPE_FILTERS)[number];
export type MediaApprovalFilter = (typeof MEDIA_APPROVAL_FILTERS)[number];
export type MediaUsageFilter = (typeof MEDIA_USAGE_FILTERS)[number];
export type MediaLibraryView = (typeof MEDIA_LIBRARY_VIEWS)[number];

export type MediaLibraryFilters = {
  view: MediaLibraryView;
  search: string;
  mediaType: MediaTypeFilter;
  albumId: string;
  usage: MediaUsageFilter;
  approvalStatus: MediaApprovalFilter;
};

export type MediaAlbumOption = {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  depth: number;
};

export type MediaAssetCard = {
  id: string;
  filename: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  mimeType: string;
  mediaType: Exclude<MediaTypeFilter, 'all'>;
  altText: string;
  caption: string;
  album: MediaAlbumOption | null;
  usage: MediaUsage[];
  approvalStatus: MediaApprovalStatus;
  publishToWebsite: boolean;
  privacyConfirmedNoPeople: boolean;
  focalPoint: FocalPoint;
  dimensions: MediaDimensions;
  archived: boolean;
  uploadedAt: string;
};

export type MediaLibraryResult = {
  media: MediaAssetCard[];
  albums: MediaAlbumOption[];
  filters: MediaLibraryFilters;
};

export function mediaTypeFromMime(mimeType: string): Exclude<MediaTypeFilter, 'all'> {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'document';
}
