'use client';

import { Archive, LoaderCircle, RotateCcw, SlidersHorizontal, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type {
  MediaAssetMutationResponse,
  MediaAssetUpdateRequest,
  MediaBulkActionResponse,
} from '@/lib/mediaForms';
import type { MediaAssetCard, MediaLibraryFilters } from '@/lib/mediaLibrary';

type MediaDetailPanelProps = {
  asset: MediaAssetCard;
  filters: MediaLibraryFilters;
};

function closeHref(filters: MediaLibraryFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.view === 'archived') params.set('view', 'archived');
  const query = params.toString();
  return query ? `/admin/gallery?${query}` : '/admin/gallery';
}

function formatDimensions(dimensions: MediaAssetCard['dimensions']): string {
  return `${dimensions.width} × ${dimensions.height}px`;
}

export function MediaDetailPanel({ asset, filters }: MediaDetailPanelProps) {
  const router = useRouter();
  const [altText, setAltText] = useState(asset.altText);
  const [caption, setCaption] = useState(asset.caption);
  const [publishToWebsite, setPublishToWebsite] = useState(asset.publishToWebsite);
  const [focalX, setFocalX] = useState(asset.focalPoint.x);
  const [focalY, setFocalY] = useState(asset.focalPoint.y);
  const [saving, setSaving] = useState(false);
  const [busyAction, setBusyAction] = useState<'archive' | 'restore' | 'delete' | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function savePhoto() {
    setSaving(true);
    setError('');
    setNotice('');
    const payload: MediaAssetUpdateRequest = {
      altText,
      caption,
      albumId: '',
      usage: ['homepage'],
      approvalStatus: 'approved',
      publishToWebsite,
      privacyConfirmedNoPeople: true,
      focalPoint: {
        x: focalX,
        y: focalY,
      },
    };

    try {
      const response = await fetch(`/api/admin/media/${asset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as MediaAssetMutationResponse;
      if (!response.ok || !result.media) {
        throw new Error(result.message ?? 'Unable to save gallery photo.');
      }
      setNotice('Gallery photo saved.');
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save gallery photo.');
    } finally {
      setSaving(false);
    }
  }

  async function runRecordAction(action: 'archive' | 'restore' | 'delete') {
    if (
      action === 'delete' &&
      !confirm('Delete this gallery photo record? The Cloudinary file will remain.')
    ) {
      return;
    }

    setBusyAction(action);
    setError('');
    setNotice('');

    try {
      const response = await fetch('/api/admin/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          mediaIds: [asset.id],
          albumId: '',
          privacyConfirmedNoPeople: true,
        }),
      });
      const result = (await response.json()) as MediaBulkActionResponse;
      if (!response.ok || typeof result.updatedCount !== 'number') {
        throw new Error(result.message ?? 'Unable to update gallery photo.');
      }
      router.push('/admin/gallery');
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : 'Unable to update gallery photo.',
      );
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <aside className="admin-card overflow-hidden" aria-labelledby="media-detail-heading">
      <div className="flex items-start justify-between gap-4 border-b border-admin-border px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-accent">
            Edit Photo
          </p>
          <h2 id="media-detail-heading" className="mt-1 font-serif text-2xl text-forest-900">
            Gallery details
          </h2>
        </div>
        <Link
          href={closeHref(filters)}
          className="grid size-9 place-items-center rounded-full text-admin-muted hover:bg-cream-alt hover:text-forest-900"
          aria-label="Close gallery photo detail"
        >
          <X aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <div className="space-y-5 p-5">
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-cream-alt">
          <div
            aria-hidden="true"
            className="h-full w-full bg-cover"
            style={{
              backgroundImage: `url("${asset.cloudinaryUrl}")`,
              backgroundPosition: `${focalX}% ${focalY}%`,
            }}
          />
        </div>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Image description
          </span>
          <input
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            placeholder="Pool and lounge chairs under summer light"
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
            maxLength={300}
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Caption
          </span>
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Optional short caption shown on the public gallery."
            className="mt-2 min-h-24 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900"
            maxLength={1000}
          />
        </label>

        <label className="flex items-start gap-3 rounded-xl bg-cream-alt p-4 text-sm text-forest-900">
          <input
            type="checkbox"
            checked={publishToWebsite}
            onChange={(event) => setPublishToWebsite(event.target.checked)}
            className="mt-1 size-4 rounded border-admin-border text-admin-accent"
          />
          <span>
            <span className="font-bold">Show this photo on the public gallery</span>
            <span className="mt-1 block text-xs leading-relaxed text-admin-muted">
              Turn this off to keep the photo saved in admin but hidden from guests.
            </span>
          </span>
        </label>

        <fieldset>
          <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            <SlidersHorizontal aria-hidden="true" className="size-4" />
            Crop focus
          </legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="text-xs font-semibold text-admin-muted">Horizontal</span>
              <input
                type="range"
                min="0"
                max="100"
                value={focalX}
                onChange={(event) => setFocalX(Number(event.target.value))}
                className="mt-2 w-full accent-admin-accent"
              />
            </label>
            <label>
              <span className="text-xs font-semibold text-admin-muted">Vertical</span>
              <input
                type="range"
                min="0"
                max="100"
                value={focalY}
                onChange={(event) => setFocalY(Number(event.target.value))}
                className="mt-2 w-full accent-admin-accent"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-admin-muted">
            Current focus: {focalX}% / {focalY}%
          </p>
        </fieldset>

        <dl className="grid gap-3 rounded-lg bg-cream-alt p-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-admin-muted">File</dt>
            <dd className="max-w-44 truncate font-semibold text-forest-900">{asset.filename}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-admin-muted">Dimensions</dt>
            <dd className="font-semibold text-forest-900">{formatDimensions(asset.dimensions)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-admin-muted">Status</dt>
            <dd className="font-semibold text-forest-900">
              {asset.publishToWebsite ? 'Visible' : 'Hidden'}
            </dd>
          </div>
        </dl>

        {error ? <p className="text-sm font-semibold text-admin-danger">{error}</p> : null}
        {notice ? <p className="text-sm font-semibold text-admin-success">{notice}</p> : null}

        <button
          type="button"
          onClick={savePhoto}
          disabled={saving || !altText.trim()}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
          Save Photo
        </button>

        <div className="grid gap-3 sm:grid-cols-2">
          {asset.archived ? (
            <button
              type="button"
              onClick={() => runRecordAction('restore')}
              disabled={busyAction !== null}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-admin-border bg-white px-4 text-xs font-bold text-admin-muted hover:bg-cream-alt disabled:opacity-60"
            >
              {busyAction === 'restore' ? (
                <LoaderCircle aria-hidden="true" className="size-3 animate-spin" />
              ) : (
                <RotateCcw aria-hidden="true" className="size-3" />
              )}
              Restore
            </button>
          ) : (
            <button
              type="button"
              onClick={() => runRecordAction('archive')}
              disabled={busyAction !== null}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-admin-border bg-white px-4 text-xs font-bold text-admin-muted hover:bg-cream-alt disabled:opacity-60"
            >
              {busyAction === 'archive' ? (
                <LoaderCircle aria-hidden="true" className="size-3 animate-spin" />
              ) : (
                <Archive aria-hidden="true" className="size-3" />
              )}
              Archive
            </button>
          )}
          <button
            type="button"
            onClick={() => runRecordAction('delete')}
            disabled={busyAction !== null}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-admin-danger/40 bg-white px-4 text-xs font-bold text-admin-danger hover:bg-admin-danger/5 disabled:opacity-60"
          >
            {busyAction === 'delete' ? (
              <LoaderCircle aria-hidden="true" className="size-3 animate-spin" />
            ) : (
              <Trash2 aria-hidden="true" className="size-3" />
            )}
            Delete
          </button>
        </div>
      </div>
    </aside>
  );
}
