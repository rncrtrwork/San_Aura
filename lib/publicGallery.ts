import type { FocalPoint } from '@/lib/mediaOptions';

export type PublicGalleryAsset = {
  id: string;
  url: string;
  altText: string;
  caption: string;
  mediaType: 'image' | 'video';
  album: { id: string; path: string } | null;
  focalPoint: FocalPoint;
};

export type PublicGalleryAlbumGroup = {
  albumLabel: string;
  assets: PublicGalleryAsset[];
};

export function groupedPublicGalleryAssets(
  assets: PublicGalleryAsset[],
): PublicGalleryAlbumGroup[] {
  const groups = new Map<string, PublicGalleryAsset[]>();

  for (const asset of assets) {
    const label = asset.album?.path ?? 'Resort Highlights';
    groups.set(label, [...(groups.get(label) ?? []), asset]);
  }

  return Array.from(groups.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([albumLabel, albumAssets]) => ({ albumLabel, assets: albumAssets }));
}
