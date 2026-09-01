'use client';

import { FileText, ImageIcon, LoaderCircle, Trash2, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type {
  MediaBulkAction,
  MediaBulkActionRequest,
  MediaBulkActionResponse,
} from '@/lib/mediaForms';
import type { MediaAlbumOption, MediaAssetCard, MediaLibraryFilters } from '@/lib/mediaLibrary';
import type { MediaUsage } from '@/lib/mediaOptions';

type MediaLibraryGridProps = {
  media: MediaAssetCard[];
  albums: MediaAlbumOption[];
  filters: MediaLibraryFilters;
  selectedMediaId: string;
};

const usageLabels: Record<MediaUsage, string> = {
  homepage: 'Homepage Gallery',
  stayType: 'Stay Types',
  event: 'Events',
  mapAsset: 'Map Assets',
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function mediaDetailHref(mediaId: string, filters: MediaLibraryFilters): string {
  const params = new URLSearchParams();
  params.set('media', mediaId);
  if (filters.view !== 'all') params.set('view', filters.view);
  if (filters.mediaType !== 'all') params.set('mediaType', filters.mediaType);
  if (filters.search) params.set('search', filters.search);
  if (filters.albumId) params.set('albumId', filters.albumId);
  if (filters.usage !== 'all') params.set('usage', filters.usage);
  if (filters.approvalStatus !== 'all') params.set('approvalStatus', filters.approvalStatus);
  return `/admin/gallery?${params.toString()}`;
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

export function MediaLibraryGrid({
  media,
  albums,
  filters,
  selectedMediaId,
}: MediaLibraryGridProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [albumId, setAlbumId] = useState('');
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);
  const [busyAction, setBusyAction] = useState<MediaBulkAction | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const allSelected = media.length > 0 && selectedIds.length === media.length;

  function toggleSelected(mediaId: string) {
    setSelectedIds((current) =>
      current.includes(mediaId)
        ? current.filter((selectedId) => selectedId !== mediaId)
        : [...current, mediaId],
    );
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : media.map((asset) => asset.id));
  }

  async function runBulkAction(action: MediaBulkAction) {
    if (selectedIds.length === 0) {
      setError('Select at least one media asset.');
      return;
    }
    if (action === 'addToAlbum' && !albumId) {
      setError('Choose an album before assigning selected media.');
      return;
    }
    if (action === 'approve' && !privacyConfirmed) {
      setError('Confirm selected media contains no identifiable people before approval.');
      return;
    }
    if (
      action === 'delete' &&
      !confirm('Delete selected media records from the library? Cloudinary files will remain.')
    ) {
      return;
    }

    setBusyAction(action);
    setError('');
    setNotice('');
    const payload: MediaBulkActionRequest = {
      action,
      mediaIds: selectedIds,
      albumId,
      privacyConfirmedNoPeople: privacyConfirmed,
    };

    try {
      const response = await fetch('/api/admin/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as MediaBulkActionResponse;
      if (!response.ok || typeof result.updatedCount !== 'number') {
        throw new Error(result.message ?? 'Unable to apply bulk action.');
      }
      setNotice(
        `Updated ${result.updatedCount} media asset${result.updatedCount === 1 ? '' : 's'}.`,
      );
      setSelectedIds([]);
      router.refresh();
    } catch (bulkError) {
      setError(bulkError instanceof Error ? bulkError.message : 'Unable to apply bulk action.');
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className="admin-card overflow-hidden" aria-labelledby="media-grid-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border px-5 py-4 sm:px-6">
        <div>
          <h2 id="media-grid-heading" className="font-bold text-forest-900">
            Media Library
          </h2>
          <p className="mt-1 text-sm text-admin-muted">Showing {media.length}</p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-admin-muted">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="size-4 rounded border-admin-border text-admin-accent"
          />
          Select all
        </label>
      </div>

      <div className="border-b border-admin-border bg-cream-alt/60 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-forest-900">{selectedIds.length} selected</span>
          <button
            type="button"
            onClick={() => runBulkAction('approve')}
            disabled={busyAction !== null}
            className="rounded-lg bg-admin-success px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            {busyAction === 'approve' ? 'Approving…' : 'Approve'}
          </button>
          <button
            type="button"
            onClick={() => runBulkAction('unapprove')}
            disabled={busyAction !== null}
            className="rounded-lg border border-admin-border bg-white px-3 py-2 text-xs font-bold text-admin-muted disabled:opacity-60"
          >
            Unapprove
          </button>
          <select
            value={albumId}
            onChange={(event) => setAlbumId(event.target.value)}
            className="h-9 rounded-lg border border-admin-border bg-white px-3 text-xs font-semibold text-forest-900"
          >
            <option value="">Choose album</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {'— '.repeat(album.depth)}
                {album.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => runBulkAction('addToAlbum')}
            disabled={busyAction !== null}
            className="rounded-lg border border-admin-border bg-white px-3 py-2 text-xs font-bold text-admin-muted disabled:opacity-60"
          >
            Add to Album
          </button>
          <button
            type="button"
            onClick={() => runBulkAction('archive')}
            disabled={busyAction !== null}
            className="rounded-lg border border-admin-border bg-white px-3 py-2 text-xs font-bold text-admin-muted disabled:opacity-60"
          >
            Archive
          </button>
          <button
            type="button"
            onClick={() => runBulkAction('delete')}
            disabled={busyAction !== null}
            className="inline-flex items-center gap-2 rounded-lg border border-admin-danger/40 bg-white px-3 py-2 text-xs font-bold text-admin-danger disabled:opacity-60"
          >
            {busyAction === 'delete' ? (
              <LoaderCircle aria-hidden="true" className="size-3 animate-spin" />
            ) : (
              <Trash2 aria-hidden="true" className="size-3" />
            )}
            Delete
          </button>
        </div>
        <label className="mt-3 flex items-start gap-2 text-xs font-semibold text-admin-muted">
          <input
            type="checkbox"
            checked={privacyConfirmed}
            onChange={(event) => setPrivacyConfirmed(event.target.checked)}
            className="mt-0.5 size-4 rounded border-admin-border text-admin-accent"
          />
          I confirm selected media contains no identifiable people before approval.
        </label>
        {error ? <p className="mt-2 text-sm font-semibold text-admin-danger">{error}</p> : null}
        {notice ? <p className="mt-2 text-sm font-semibold text-admin-success">{notice}</p> : null}
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
              className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
                asset.id === selectedMediaId ? 'border-admin-accent' : 'border-admin-border'
              }`}
            >
              <div className="relative">
                <label className="absolute left-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-white/90 shadow-sm">
                  <span className="sr-only">Select {asset.filename}</span>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(asset.id)}
                    onChange={() => toggleSelected(asset.id)}
                    className="size-4 rounded border-admin-border text-admin-accent"
                  />
                </label>
                <Link href={mediaDetailHref(asset.id, filters)} className="block">
                  <div className="aspect-[4/3] bg-cream-alt">{mediaPreview(asset)}</div>
                </Link>
              </div>
              <Link href={mediaDetailHref(asset.id, filters)} className="block space-y-3 p-4">
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
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
