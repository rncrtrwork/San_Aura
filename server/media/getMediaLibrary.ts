import { Types } from 'mongoose';
import {
  MEDIA_LIBRARY_VIEWS,
  type MediaAlbumOption,
  type MediaLibraryFilters,
  type MediaLibraryResult,
  mediaTypeFromMime,
} from '@/lib/mediaLibrary';
import { connectToDatabase } from '@/lib/db';
import { Album } from '@/models/Album';
import {
  MEDIA_APPROVAL_STATUSES,
  MEDIA_USAGE_TYPES,
  type FocalPoint,
  type MediaApprovalStatus,
  type MediaDimensions,
  type MediaUsage,
} from '@/lib/mediaOptions';
import { MediaAsset } from '@/models/MediaAsset';

type AlbumLean = {
  _id: Types.ObjectId;
  name: string;
  parentRef: Types.ObjectId | null;
};

type MediaAssetLean = {
  _id: Types.ObjectId;
  filename: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  mimeType: string;
  altText: string;
  caption: string;
  albumRef: Types.ObjectId | null;
  usage: MediaUsage[];
  approvalStatus: MediaApprovalStatus;
  publishToWebsite: boolean;
  privacyConfirmedNoPeople: boolean;
  focalPoint: FocalPoint;
  dimensions: MediaDimensions;
  archived: boolean;
  uploadedAt: Date;
};

type MediaSearchField = { filename: RegExp } | { altText: RegExp } | { caption: RegExp };

type MediaQuery = {
  archived: boolean;
  mimeType?: RegExp | { $not: RegExp };
  albumRef?: Types.ObjectId;
  usage?: MediaUsage;
  approvalStatus?: MediaApprovalStatus;
  $or?: MediaSearchField[];
};

const USAGE_VIEWS: MediaUsage[] = ['homepage', 'stayType', 'event', 'mapAsset'];

function firstValue(params: Record<string, string | string[] | undefined>, key: string): string {
  const value = params[key];
  return typeof value === 'string' ? value.trim() : '';
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validObjectId(value: string): string {
  return Types.ObjectId.isValid(value) ? value : '';
}

export function parseMediaLibraryFilters(
  params: Record<string, string | string[] | undefined>,
): MediaLibraryFilters {
  const mediaType = firstValue(params, 'mediaType');
  const usage = firstValue(params, 'usage');
  const approvalStatus = firstValue(params, 'approvalStatus');
  const view = firstValue(params, 'view');

  return {
    view: MEDIA_LIBRARY_VIEWS.find((entry) => entry === view) ?? 'all',
    search: firstValue(params, 'search').slice(0, 120),
    mediaType:
      mediaType === 'image' || mediaType === 'video' || mediaType === 'document'
        ? mediaType
        : 'all',
    albumId: validObjectId(firstValue(params, 'albumId')),
    usage: MEDIA_USAGE_TYPES.find((entry) => entry === usage) ?? 'all',
    approvalStatus: MEDIA_APPROVAL_STATUSES.find((entry) => entry === approvalStatus) ?? 'all',
  };
}

function buildMediaQuery(filters: MediaLibraryFilters): MediaQuery {
  const query: MediaQuery = { archived: filters.view === 'archived' };
  const viewUsage = USAGE_VIEWS.find((entry) => entry === filters.view);

  if (filters.mediaType === 'image') query.mimeType = /^image\//;
  if (filters.mediaType === 'video') query.mimeType = /^video\//;
  if (filters.mediaType === 'document') query.mimeType = { $not: /^(image|video)\// };
  if (filters.albumId) query.albumRef = new Types.ObjectId(filters.albumId);
  if (viewUsage) query.usage = viewUsage;
  if (!viewUsage && filters.usage !== 'all') query.usage = filters.usage;
  if (filters.approvalStatus !== 'all') query.approvalStatus = filters.approvalStatus;
  if (filters.search) {
    const search = new RegExp(escapeRegex(filters.search), 'i');
    query.$or = [{ filename: search }, { altText: search }, { caption: search }];
  }

  return query;
}

function buildAlbumOptions(albums: AlbumLean[]): MediaAlbumOption[] {
  const byId = new Map(albums.map((album) => [album._id.toString(), album]));
  const children = new Map<string | null, AlbumLean[]>();

  for (const album of albums) {
    const parentId = album.parentRef?.toString() ?? null;
    children.set(parentId, [...(children.get(parentId) ?? []), album]);
  }

  for (const entries of Array.from(children.values())) {
    entries.sort((left, right) => left.name.localeCompare(right.name));
  }

  const options: MediaAlbumOption[] = [];
  const visit = (album: AlbumLean, pathPrefix: string, depth: number): void => {
    const id = album._id.toString();
    const path = pathPrefix ? `${pathPrefix} > ${album.name}` : album.name;
    options.push({
      id,
      name: album.name,
      parentId: album.parentRef?.toString() ?? null,
      path,
      depth,
    });
    for (const child of children.get(id) ?? []) {
      visit(child, path, depth + 1);
    }
  };

  for (const album of children.get(null) ?? []) {
    visit(album, '', 0);
  }

  for (const album of albums) {
    const parentId = album.parentRef?.toString() ?? null;
    if (parentId && !byId.has(parentId)) {
      visit(album, '', 0);
    }
  }

  return options;
}

export async function getMediaLibrary(filters: MediaLibraryFilters): Promise<MediaLibraryResult> {
  await connectToDatabase();
  const [albums, media] = await Promise.all([
    Album.find().select('name parentRef').sort({ name: 1 }).lean<AlbumLean[]>(),
    MediaAsset.find(buildMediaQuery(filters))
      .select(
        'filename cloudinaryUrl cloudinaryPublicId mimeType altText caption albumRef usage approvalStatus publishToWebsite privacyConfirmedNoPeople focalPoint dimensions archived uploadedAt',
      )
      .sort({ uploadedAt: -1, createdAt: -1 })
      .limit(120)
      .lean<MediaAssetLean[]>(),
  ]);

  const albumOptions = buildAlbumOptions(albums);
  const albumsById = new Map(albumOptions.map((album) => [album.id, album]));

  return {
    filters,
    albums: albumOptions,
    media: media.map((asset) => ({
      id: asset._id.toString(),
      filename: asset.filename,
      cloudinaryUrl: asset.cloudinaryUrl,
      cloudinaryPublicId: asset.cloudinaryPublicId,
      mimeType: asset.mimeType,
      mediaType: mediaTypeFromMime(asset.mimeType),
      altText: asset.altText,
      caption: asset.caption,
      album: asset.albumRef ? (albumsById.get(asset.albumRef.toString()) ?? null) : null,
      usage: asset.usage,
      approvalStatus: asset.approvalStatus,
      publishToWebsite: asset.publishToWebsite,
      privacyConfirmedNoPeople: asset.privacyConfirmedNoPeople,
      focalPoint: asset.focalPoint,
      dimensions: asset.dimensions,
      archived: asset.archived,
      uploadedAt: asset.uploadedAt.toISOString(),
    })),
  };
}
