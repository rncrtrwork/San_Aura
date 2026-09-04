import { Types } from 'mongoose';
import {
  groupedPublicGalleryAssets,
  type PublicGalleryAlbumGroup,
  type PublicGalleryAsset,
} from '@/lib/publicGallery';
import { connectToDatabase } from '@/lib/db';
import { Album } from '@/models/Album';
import { MediaAsset } from '@/models/MediaAsset';

type AlbumLean = {
  _id: Types.ObjectId;
  name: string;
  parentRef: Types.ObjectId | null;
};

type PublicGalleryAssetLean = {
  _id: Types.ObjectId;
  cloudinaryUrl: string;
  mimeType: string;
  altText: string;
  caption: string;
  albumRef: Types.ObjectId | null;
  focalPoint: { x: number; y: number };
};

function publicGalleryAsset(
  asset: PublicGalleryAssetLean,
  album: { id: string; path: string } | null,
): PublicGalleryAsset {
  return {
    id: asset._id.toString(),
    url: asset.cloudinaryUrl,
    altText: asset.altText,
    caption: asset.caption,
    mediaType: 'image',
    album,
    focalPoint: asset.focalPoint,
  };
}

function albumPath(album: AlbumLean, albumById: Map<string, AlbumLean>): string {
  const names = [album.name];
  let parentRef = album.parentRef;

  while (parentRef) {
    const parent = albumById.get(parentRef.toString());
    if (!parent) break;
    names.unshift(parent.name);
    parentRef = parent.parentRef;
  }

  return names.join(' > ');
}

export async function getPublicGalleryPage(): Promise<PublicGalleryAlbumGroup[]> {
  try {
    await connectToDatabase();
    const [albums, assets] = await Promise.all([
      Album.find().select('name parentRef').sort({ name: 1 }).lean<AlbumLean[]>(),
      MediaAsset.find({
        archived: false,
        approvalStatus: 'approved',
        publishToWebsite: true,
        mimeType: /^image\//,
      })
        .select('cloudinaryUrl mimeType altText caption albumRef focalPoint uploadedAt createdAt')
        .sort({ uploadedAt: -1, createdAt: -1 })
        .limit(120)
        .lean<PublicGalleryAssetLean[]>(),
    ]);
    const albumById = new Map(albums.map((album) => [album._id.toString(), album]));

    return groupedPublicGalleryAssets(
      assets.map((asset) => {
        const album = asset.albumRef ? (albumById.get(asset.albumRef.toString()) ?? null) : null;
        return publicGalleryAsset(
          asset,
          album
            ? {
                id: album._id.toString(),
                path: albumPath(album, albumById),
              }
            : null,
        );
      }),
    );
  } catch {
    return groupedPublicGalleryAssets([]);
  }
}

export async function getPublicHomeGalleryImages(): Promise<PublicGalleryAsset[]> {
  try {
    await connectToDatabase();
    const assets = await MediaAsset.find({
      archived: false,
      approvalStatus: 'approved',
      publishToWebsite: true,
      usage: 'homepage',
      mimeType: /^image\//,
    })
      .select('cloudinaryUrl mimeType altText caption albumRef focalPoint uploadedAt createdAt')
      .sort({ uploadedAt: -1, createdAt: -1 })
      .limit(24)
      .lean<PublicGalleryAssetLean[]>();

    return assets.map((asset) => publicGalleryAsset(asset, null));
  } catch {
    return [];
  }
}
