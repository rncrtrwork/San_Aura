'use client';

import { FileText, LoaderCircle, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { MediaAssetUpdateRequest, MediaAssetMutationResponse } from '@/lib/mediaForms';
import type { MediaAlbumOption, MediaAssetCard, MediaLibraryFilters } from '@/lib/mediaLibrary';
import { MEDIA_USAGE_TYPES, type MediaUsage } from '@/lib/mediaOptions';

type MediaDetailPanelProps = {
  asset: MediaAssetCard;
  albums: MediaAlbumOption[];
  filters: MediaLibraryFilters;
};

const usageLabels: Record<MediaUsage, string> = {
  homepage: 'Homepage Gallery',
  stayType: 'Stay Types',
  event: 'Events',
  mapAsset: 'Map Assets',
};

function closeHref(filters: MediaLibraryFilters): string {
  const params = new URLSearchParams();
  if (filters.mediaType !== 'all') params.set('mediaType', filters.mediaType);
  if (filters.search) params.set('search', filters.search);
  if (filters.albumId) params.set('albumId', filters.albumId);
  if (filters.usage !== 'all') params.set('usage', filters.usage);
  if (filters.approvalStatus !== 'all') params.set('approvalStatus', filters.approvalStatus);
  const query = params.toString();
  return query ? `/admin/gallery?${query}` : '/admin/gallery';
}

function formatFileSize(dimensions: MediaAssetCard['dimensions']): string {
  return `${dimensions.width} × ${dimensions.height}px`;
}

export function MediaDetailPanel({ asset, albums, filters }: MediaDetailPanelProps) {
  const router = useRouter();
  const [altText, setAltText] = useState(asset.altText);
  const [caption, setCaption] = useState(asset.caption);
  const [albumId, setAlbumId] = useState(asset.album?.id ?? '');
  const [usage, setUsage] = useState<MediaUsage[]>(asset.usage);
  const [focalX, setFocalX] = useState(asset.focalPoint.x);
  const [focalY, setFocalY] = useState(asset.focalPoint.y);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  function toggleUsage(nextUsage: MediaUsage) {
    setUsage((current) =>
      current.includes(nextUsage)
        ? current.filter((entry) => entry !== nextUsage)
        : [...current, nextUsage],
    );
  }

  async function saveMedia() {
    setSaving(true);
    setError('');
    setNotice('');
    const payload: MediaAssetUpdateRequest = {
      altText,
      caption,
      albumId,
      usage,
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
        throw new Error(result.message ?? 'Unable to save media details.');
      }
      setNotice('Media details saved.');
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save media details.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="admin-card overflow-hidden" aria-labelledby="media-detail-heading">
      <div className="flex items-start justify-between gap-4 border-b border-admin-border px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-accent">
            Media Detail
          </p>
          <h2 id="media-detail-heading" className="mt-1 font-serif text-2xl text-forest-900">
            {asset.filename}
          </h2>
        </div>
        <Link
          href={closeHref(filters)}
          className="grid size-9 place-items-center rounded-full text-admin-muted hover:bg-cream-alt hover:text-forest-900"
          aria-label="Close media detail"
        >
          <X aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <div className="space-y-5 p-5">
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-cream-alt">
          {asset.mediaType === 'image' ? (
            <div
              aria-hidden="true"
              className="h-full w-full bg-cover"
              style={{
                backgroundImage: `url("${asset.cloudinaryUrl}")`,
                backgroundPosition: `${focalX}% ${focalY}%`,
              }}
            />
          ) : (
            <span className="grid h-full place-items-center text-admin-muted">
              <FileText aria-hidden="true" className="size-8" />
            </span>
          )}
        </div>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Alt Text
          </span>
          <input
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
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
            className="mt-2 min-h-24 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900"
            maxLength={1000}
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Album
          </span>
          <select
            value={albumId}
            onChange={(event) => setAlbumId(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          >
            <option value="">Unassigned</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {'— '.repeat(album.depth)}
                {album.name}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Usage
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {MEDIA_USAGE_TYPES.map((entry) => (
              <label
                key={entry}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${
                  usage.includes(entry)
                    ? 'border-admin-accent bg-admin-accent text-white'
                    : 'border-admin-border bg-white text-admin-muted'
                }`}
              >
                <input
                  type="checkbox"
                  checked={usage.includes(entry)}
                  onChange={() => toggleUsage(entry)}
                  className="sr-only"
                />
                {usageLabels[entry]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            <SlidersHorizontal aria-hidden="true" className="size-4" />
            Focal Point
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
            Current focal point: {focalX}% / {focalY}%
          </p>
        </fieldset>

        <dl className="grid gap-3 rounded-lg bg-cream-alt p-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-admin-muted">File type</dt>
            <dd className="font-semibold text-forest-900">{asset.mimeType}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-admin-muted">Dimensions</dt>
            <dd className="font-semibold text-forest-900">{formatFileSize(asset.dimensions)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-admin-muted">Cloudinary ID</dt>
            <dd className="max-w-44 truncate font-semibold text-forest-900">
              {asset.cloudinaryPublicId}
            </dd>
          </div>
        </dl>

        {error ? <p className="text-sm font-semibold text-admin-danger">{error}</p> : null}
        {notice ? <p className="text-sm font-semibold text-admin-success">{notice}</p> : null}

        <button
          type="button"
          onClick={saveMedia}
          disabled={saving}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
          Save Details
        </button>
      </div>
    </aside>
  );
}
