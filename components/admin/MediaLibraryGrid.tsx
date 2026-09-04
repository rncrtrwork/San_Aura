'use client';

import { ImageIcon } from 'lucide-react';
import Link from 'next/link';
import type { MediaAssetCard, MediaLibraryFilters } from '@/lib/mediaLibrary';

type MediaLibraryGridProps = {
  media: MediaAssetCard[];
  filters: MediaLibraryFilters;
  selectedMediaId: string;
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function galleryPhotoHref(mediaId: string, filters: MediaLibraryFilters): string {
  const params = new URLSearchParams();
  params.set('media', mediaId);
  if (filters.search) params.set('search', filters.search);
  if (filters.view === 'archived') params.set('view', 'archived');
  return `/admin/gallery?${params.toString()}`;
}

export function MediaLibraryGrid({ media, filters, selectedMediaId }: MediaLibraryGridProps) {
  return (
    <section className="admin-card overflow-hidden" aria-labelledby="gallery-photo-grid-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border px-5 py-4 sm:px-6">
        <div>
          <h2 id="gallery-photo-grid-heading" className="font-bold text-forest-900">
            Gallery photos
          </h2>
          <p className="mt-1 text-sm text-admin-muted">
            {media.length} photo{media.length === 1 ? '' : 's'} shown
          </p>
        </div>
        <Link
          href={filters.view === 'archived' ? '/admin/gallery' : '/admin/gallery?view=archived'}
          className="rounded-lg border border-admin-border px-4 py-2 text-sm font-bold text-admin-muted hover:bg-cream-alt hover:text-forest-900"
        >
          {filters.view === 'archived' ? 'View active photos' : 'View archived'}
        </Link>
      </div>

      {media.length === 0 ? (
        <div className="grid justify-items-center px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-cream-alt text-admin-accent">
            <ImageIcon aria-hidden="true" className="size-5" />
          </span>
          <p className="mt-4 font-semibold text-forest-900">No gallery photos found</p>
          <p className="mt-1 text-sm text-admin-muted">
            Upload photos or adjust your search to update the public gallery.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {media.map((asset) => (
            <article
              key={asset.id}
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                asset.id === selectedMediaId
                  ? 'border-admin-accent ring-2 ring-admin-accent/20'
                  : 'border-admin-border hover:-translate-y-0.5 hover:shadow-card'
              }`}
            >
              <Link href={galleryPhotoHref(asset.id, filters)} className="block">
                <div
                  aria-hidden="true"
                  className="aspect-[4/3] bg-cover bg-center"
                  style={{
                    backgroundImage: `url("${asset.cloudinaryUrl}")`,
                    backgroundPosition: `${asset.focalPoint.x}% ${asset.focalPoint.y}%`,
                  }}
                />
                <div className="space-y-3 p-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-forest-900">{asset.altText}</h3>
                    <p className="mt-1 truncate text-xs text-admin-muted">{asset.filename}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        asset.publishToWebsite && asset.approvalStatus === 'approved'
                          ? 'bg-admin-success/10 text-admin-success'
                          : 'bg-cream-alt text-admin-muted'
                      }`}
                    >
                      {asset.publishToWebsite && asset.approvalStatus === 'approved'
                        ? 'Visible on website'
                        : 'Hidden'}
                    </span>
                    {asset.usage.includes('homepage') ? (
                      <span className="rounded-full bg-admin-accent/10 px-2.5 py-1 text-xs font-bold text-admin-accent">
                        Home gallery
                      </span>
                    ) : null}
                    <span className="text-xs text-admin-muted">
                      {dateFormatter.format(new Date(asset.uploadedAt))}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
