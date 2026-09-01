import type { MediaUsage } from '@/lib/mediaOptions';

export type MediaAssetCreateRequest = {
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  filename: string;
  mimeType: string;
  altText: string;
  caption: string;
  albumId: string;
  usage: MediaUsage[];
  privacyConfirmedNoPeople: boolean;
  dimensions: {
    width: number;
    height: number;
  };
};

export type MediaAssetUpdateRequest = {
  altText: string;
  caption: string;
  albumId: string;
  usage: MediaUsage[];
  focalPoint: {
    x: number;
    y: number;
  };
};

export type MediaBulkAction = 'approve' | 'unapprove' | 'addToAlbum' | 'archive' | 'delete';

export type MediaBulkActionRequest = {
  action: MediaBulkAction;
  mediaIds: string[];
  albumId: string;
  privacyConfirmedNoPeople: boolean;
};

export type MediaAssetMutationResponse = {
  media?: {
    id: string;
    filename: string;
  };
  message?: string;
};

export type MediaBulkActionResponse = {
  updatedCount?: number;
  message?: string;
};
