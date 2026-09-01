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

export type MediaAssetMutationResponse = {
  media?: {
    id: string;
    filename: string;
  };
  message?: string;
};
