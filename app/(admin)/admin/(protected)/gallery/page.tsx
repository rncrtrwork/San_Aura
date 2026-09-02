import { AlbumManagementPanel } from '@/components/admin/AlbumManagementPanel';
import { MediaDetailPanel } from '@/components/admin/MediaDetailPanel';
import { MediaLibraryGrid } from '@/components/admin/MediaLibraryGrid';
import { MediaUploadPanel } from '@/components/admin/MediaUploadPanel';
import { PrivacyBanner } from '@/components/admin/PrivacyBanner';
import { Search } from 'lucide-react';
import type { MediaLibraryFilters, MediaLibraryView, MediaTypeFilter } from '@/lib/mediaLibrary';
import { requirePagePermission } from '@/server/auth/pageAuthorization';
import { getMediaLibrary, parseMediaLibraryFilters } from '@/server/media/getMediaLibrary';

export const dynamic = 'force-dynamic';

type GalleryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const mediaTypeLabels: Record<MediaTypeFilter, string> = {
  all: 'All media',
  image: 'Images',
  video: 'Videos',
  document: 'Documents',
};

const usageLabels = {
  all: 'All usage',
  homepage: 'Homepage Gallery',
  stayType: 'Stay Types',
  event: 'Events',
  mapAsset: 'Map Assets',
} as const;

const approvalLabels = {
  all: 'All statuses',
  draft: 'Draft',
  approved: 'Approved',
  rejected: 'Rejected',
} as const;

const viewLabels: Record<MediaLibraryView, string> = {
  all: 'All Media',
  homepage: 'Homepage Gallery',
  stayType: 'Stay Types',
  event: 'Events',
  mapAsset: 'Map Assets',
  archived: 'Archived',
};

function galleryHref(mediaType: MediaTypeFilter, filters: MediaLibraryFilters): string {
  const params = new URLSearchParams();
  if (filters.view !== 'all') params.set('view', filters.view);
  if (mediaType !== 'all') params.set('mediaType', mediaType);
  if (filters.search) params.set('search', filters.search);
  if (filters.albumId) params.set('albumId', filters.albumId);
  if (filters.usage !== 'all') params.set('usage', filters.usage);
  if (filters.approvalStatus !== 'all') params.set('approvalStatus', filters.approvalStatus);
  const query = params.toString();
  return query ? `/admin/gallery?${query}` : '/admin/gallery';
}

function galleryViewHref(view: MediaLibraryView, filters: MediaLibraryFilters): string {
  const params = new URLSearchParams();
  if (view !== 'all') params.set('view', view);
  if (filters.mediaType !== 'all') params.set('mediaType', filters.mediaType);
  if (filters.search) params.set('search', filters.search);
  if (filters.albumId) params.set('albumId', filters.albumId);
  if (filters.usage !== 'all' && view === 'all') params.set('usage', filters.usage);
  if (filters.approvalStatus !== 'all') params.set('approvalStatus', filters.approvalStatus);
  const query = params.toString();
  return query ? `/admin/gallery?${query}` : '/admin/gallery';
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  await requirePagePermission('media.read');
  const params = await searchParams;
  const selectedMediaValue = params.media;
  const selectedMediaId = typeof selectedMediaValue === 'string' ? selectedMediaValue : '';
  const filters = parseMediaLibraryFilters(params);
  const { media, albums } = await getMediaLibrary(filters);
  const mediaTypes: MediaTypeFilter[] = ['all', 'image', 'video', 'document'];
  const libraryViews: MediaLibraryView[] = [
    'all',
    'homepage',
    'stayType',
    'event',
    'mapAsset',
    'archived',
  ];
  const selectedMedia = media.find((asset) => asset.id === selectedMediaId) ?? null;

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
          Content Library
        </p>
        <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">Gallery</h1>
        <p className="mt-2 max-w-2xl text-sm text-admin-muted">
          Search, filter, and prepare resort imagery for approved website usage.
        </p>
      </header>

      <MediaUploadPanel albums={albums} />

      <AlbumManagementPanel albums={albums} />

      <nav aria-label="Media library views" className="admin-card flex overflow-x-auto p-2">
        {libraryViews.map((view) => {
          const active = view === filters.view;
          return (
            <a
              key={view}
              href={galleryViewHref(view, filters)}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-w-max rounded-lg px-4 py-2 text-sm font-bold ${
                active
                  ? 'bg-admin-sidebar text-white'
                  : 'text-admin-muted hover:bg-cream-alt hover:text-forest-900'
              }`}
            >
              {viewLabels[view]}
            </a>
          );
        })}
      </nav>

      <form className="admin-card grid gap-4 p-4 lg:grid-cols-[minmax(14rem,1.4fr)_repeat(3,minmax(11rem,1fr))_auto]">
        {filters.view !== 'all' ? <input type="hidden" name="view" value={filters.view} /> : null}
        {filters.mediaType !== 'all' ? (
          <input type="hidden" name="mediaType" value={filters.mediaType} />
        ) : null}
        <label className="relative">
          <span className="sr-only">Search media</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted"
          />
          <input
            type="search"
            name="search"
            defaultValue={filters.search}
            placeholder="Search filename, alt text, caption"
            className="h-11 w-full rounded-lg border border-admin-border bg-white pl-9 pr-3 text-sm text-forest-900"
          />
        </label>
        <label>
          <span className="sr-only">Album</span>
          <select
            name="albumId"
            defaultValue={filters.albumId}
            className="h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          >
            <option value="">All albums</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {'— '.repeat(album.depth)}
                {album.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Usage</span>
          <select
            name="usage"
            defaultValue={filters.usage}
            className="h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          >
            {Object.entries(usageLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Approval status</span>
          <select
            name="approvalStatus"
            defaultValue={filters.approvalStatus}
            className="h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          >
            {Object.entries(approvalLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="h-11 rounded-lg border border-admin-sidebar px-5 text-sm font-bold text-admin-sidebar hover:bg-admin-sidebar hover:text-white"
        >
          Apply
        </button>
      </form>

      <nav aria-label="Media type" className="flex overflow-x-auto border-b border-admin-border">
        {mediaTypes.map((mediaType) => {
          const active = mediaType === filters.mediaType;
          return (
            <a
              key={mediaType}
              href={galleryHref(mediaType, filters)}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-w-max border-b-2 px-4 py-3 text-sm font-semibold ${
                active
                  ? 'border-admin-accent text-admin-accent'
                  : 'border-transparent text-admin-muted hover:text-forest-900'
              }`}
            >
              {mediaTypeLabels[mediaType]}
            </a>
          );
        })}
      </nav>

      <div
        className={`grid items-start gap-6 ${
          selectedMedia ? 'xl:grid-cols-[minmax(0,1fr)_24rem]' : ''
        }`}
      >
        <MediaLibraryGrid
          media={media}
          albums={albums}
          filters={filters}
          selectedMediaId={selectedMediaId}
        />

        {selectedMedia ? (
          <MediaDetailPanel asset={selectedMedia} albums={albums} filters={filters} />
        ) : null}
      </div>
    </div>
  );
}
