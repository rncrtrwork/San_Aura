import { Types } from 'mongoose';
import { groupedPublicGalleryAssets, type PublicGalleryAlbumGroup } from '@/lib/publicGallery';
import { mediaTypeFromMime } from '@/lib/mediaLibrary';
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
        privacyConfirmedNoPeople: true,
        mimeType: /^(image|video)\//,
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
        const mediaType = mediaTypeFromMime(asset.mimeType);

        return {
          id: asset._id.toString(),
          url: asset.cloudinaryUrl,
          altText: asset.altText,
          caption: asset.caption,
          mediaType: mediaType === 'video' ? 'video' : 'image',
          album: album
            ? {
                id: album._id.toString(),
                path: albumPath(album, albumById),
              }
            : null,
          focalPoint: asset.focalPoint,
        };
      }),
    );
  } catch {
    return groupedPublicGalleryAssets([]);
  }
}
