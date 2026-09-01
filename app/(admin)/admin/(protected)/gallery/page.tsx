import { FileText, ImageIcon, Search, Video } from 'lucide-react';
import type { MediaAssetCard, MediaLibraryFilters, MediaTypeFilter } from '@/lib/mediaLibrary';
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

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function galleryHref(mediaType: MediaTypeFilter, filters: MediaLibraryFilters): string {
  const params = new URLSearchParams();
  if (mediaType !== 'all') params.set('mediaType', mediaType);
  if (filters.search) params.set('search', filters.search);
  if (filters.albumId) params.set('albumId', filters.albumId);
  if (filters.usage !== 'all') params.set('usage', filters.usage);
  if (filters.approvalStatus !== 'all') params.set('approvalStatus', filters.approvalStatus);
  const query = params.toString();
  return query ? `/admin/gallery?${query}` : '/admin/gallery';
}

function mediaIcon(asset: MediaAssetCard) {
  if (asset.mediaType === 'image') return <ImageIcon aria-hidden="true" className="size-5" />;
  if (asset.mediaType === 'video') return <Video aria-hidden="true" className="size-5" />;
  return <FileText aria-hidden="true" className="size-5" />;
}

function mediaPreview(asset: MediaAssetCard) {
  if (asset.mediaType === 'image') {
    return (
      <div
        aria-hidden="true"
        className="h-full w-full bg-cover bg-center"
        style={{
          backgroundImage: `url("${asset.cloudinaryUrl}")`,
          backgroundPosition: `${asset.focalPoint.x}% ${asset.focalPoint.y}%`,
        }}
      />
    );
  }

  return (
    <span className="grid h-full place-items-center bg-cream-alt text-admin-muted">
      {mediaIcon(asset)}
    </span>
  );
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  await requirePagePermission('media.read');
  const filters = parseMediaLibraryFilters(await searchParams);
  const { media, albums } = await getMediaLibrary(filters);
  const mediaTypes: MediaTypeFilter[] = ['all', 'image', 'video', 'document'];

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

      <form className="admin-card grid gap-4 p-4 lg:grid-cols-[minmax(14rem,1.4fr)_repeat(3,minmax(11rem,1fr))_auto]">
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

      <section className="admin-card overflow-hidden" aria-labelledby="media-grid-heading">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border px-5 py-4 sm:px-6">
          <h2 id="media-grid-heading" className="font-bold text-forest-900">
            Media Library
          </h2>
          <span className="text-sm text-admin-muted">Showing {media.length}</span>
        </div>
        {media.length === 0 ? (
          <div className="grid justify-items-center px-6 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-cream-alt text-admin-accent">
              <ImageIcon aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-4 font-semibold text-forest-900">No media matches these filters</p>
            <p className="mt-1 text-sm text-admin-muted">
              Adjust your filters or upload new media assets.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {media.map((asset) => (
              <article
                key={asset.id}
                className="overflow-hidden rounded-xl border border-admin-border bg-white shadow-sm"
              >
                <div className="aspect-[4/3] bg-cream-alt">{mediaPreview(asset)}</div>
                <div className="space-y-3 p-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-forest-900">{asset.filename}</h3>
                    <p className="mt-1 truncate text-xs text-admin-muted">{asset.altText}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-cream-alt px-2.5 py-1 text-xs font-bold capitalize text-forest-900">
                      {asset.approvalStatus}
                    </span>
                    {asset.publishToWebsite ? (
                      <span className="rounded-full bg-admin-success/10 px-2.5 py-1 text-xs font-bold text-admin-success">
                        Published
                      </span>
                    ) : null}
                    {!asset.privacyConfirmedNoPeople ? (
                      <span className="rounded-full bg-admin-danger/10 px-2.5 py-1 text-xs font-bold text-admin-danger">
                        Privacy review needed
                      </span>
                    ) : null}
                  </div>
                  <dl className="grid gap-2 text-xs text-admin-muted">
                    <div className="flex justify-between gap-3">
                      <dt>Album</dt>
                      <dd className="truncate text-right text-forest-900">
                        {asset.album?.path ?? 'Unassigned'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Usage</dt>
                      <dd className="truncate text-right text-forest-900">
                        {asset.usage.length === 0
                          ? 'Unused'
                          : asset.usage.map((entry) => usageLabels[entry]).join(', ')}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Uploaded</dt>
                      <dd className="text-forest-900">
                        {dateFormatter.format(new Date(asset.uploadedAt))}
                      </dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
