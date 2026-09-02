import { Search } from 'lucide-react';
import { MediaDetailPanel } from '@/components/admin/MediaDetailPanel';
import { MediaLibraryGrid } from '@/components/admin/MediaLibraryGrid';
import { MediaUploadPanel } from '@/components/admin/MediaUploadPanel';
import type { MediaLibraryFilters } from '@/lib/mediaLibrary';
import { requirePagePermission } from '@/server/auth/pageAuthorization';
import { getMediaLibrary, parseMediaLibraryFilters } from '@/server/media/getMediaLibrary';

export const dynamic = 'force-dynamic';

type GalleryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function galleryFilters(
  params: Record<string, string | string[] | undefined>,
): MediaLibraryFilters {
  const parsedFilters = parseMediaLibraryFilters(params);
  return {
    ...parsedFilters,
    view: parsedFilters.view === 'archived' ? 'archived' : 'all',
    mediaType: 'image',
    albumId: '',
    usage: 'all',
    approvalStatus: 'all',
  };
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  await requirePagePermission('media.read');
  const params = await searchParams;
  const selectedMediaValue = params.media;
  const selectedMediaId = typeof selectedMediaValue === 'string' ? selectedMediaValue : '';
  const filters = galleryFilters(params);
  const { media } = await getMediaLibrary(filters);
  const selectedMedia = media.find((asset) => asset.id === selectedMediaId) ?? null;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-admin-sidebar to-admin-sidebar-active px-6 py-7 text-white shadow-admin">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-gold-600">
          Public Website
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl">Gallery Photos</h1>
        <p className="mt-2 max-w-2xl text-sm text-cream">
          Upload and manage the photos shown on the public gallery page. New uploads publish
          automatically, and staff can hide or archive photos anytime.
        </p>
      </header>

      <MediaUploadPanel />

      <form className="admin-card flex flex-col gap-3 p-4 sm:flex-row">
        {filters.view === 'archived' ? <input type="hidden" name="view" value="archived" /> : null}
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search gallery photos</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted"
          />
          <input
            type="search"
            name="search"
            defaultValue={filters.search}
            placeholder="Search photo description, caption, or filename"
            className="h-11 w-full rounded-lg border border-admin-border bg-white pl-9 pr-3 text-sm text-forest-900"
          />
        </label>
        <button
          type="submit"
          className="h-11 rounded-lg border border-admin-sidebar px-5 text-sm font-bold text-admin-sidebar hover:bg-admin-sidebar hover:text-white"
        >
          Search
        </button>
      </form>

      <div
        className={`grid items-start gap-6 ${
          selectedMedia ? 'xl:grid-cols-[minmax(0,1fr)_24rem]' : ''
        }`}
      >
        <MediaLibraryGrid media={media} filters={filters} selectedMediaId={selectedMediaId} />

        {selectedMedia ? <MediaDetailPanel asset={selectedMedia} filters={filters} /> : null}
      </div>
    </div>
  );
}
