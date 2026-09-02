'use client';

import { CameraOff, ImageUp, LoaderCircle } from 'lucide-react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CLOUDINARY_FOLDERS } from '@/lib/cloudinaryFolders';
import type { CloudinarySignatureResponse, CloudinaryWidgetConfig } from '@/lib/cloudinaryUpload';
import type { MediaAssetCreateRequest, MediaAssetMutationResponse } from '@/lib/mediaForms';
import type { MediaAlbumOption } from '@/lib/mediaLibrary';
import { MEDIA_USAGE_TYPES, type MediaUsage } from '@/lib/mediaOptions';

type MediaUploadPanelProps = {
  albums: MediaAlbumOption[];
};

const usageLabels: Record<MediaUsage, string> = {
  homepage: 'Homepage Gallery',
  stayType: 'Stay Types',
  event: 'Events',
  mapAsset: 'Map Assets',
};

function normalizeFilename(info: CloudinaryUploadInfo): string {
  const base = info.original_filename.trim() || info.public_id.split('/').at(-1) || 'media';
  return info.format ? `${base}.${info.format.toLowerCase()}` : base;
}

function mimeTypeForUpload(info: CloudinaryUploadInfo): string {
  const format = info.format.toLowerCase();
  if (format === 'pdf') return 'application/pdf';
  if (info.resource_type === 'image') return `image/${format === 'jpg' ? 'jpeg' : format}`;
  if (info.resource_type === 'video') return `video/${format}`;
  return 'application/octet-stream';
}

function dimensionsForUpload(info: CloudinaryUploadInfo): { width: number; height: number } {
  return {
    width: typeof info.width === 'number' && info.width > 0 ? Math.round(info.width) : 1,
    height: typeof info.height === 'number' && info.height > 0 ? Math.round(info.height) : 1,
  };
}

export function MediaUploadPanel({ albums }: MediaUploadPanelProps) {
  const router = useRouter();
  const [albumId, setAlbumId] = useState('');
  const [selectedUsage, setSelectedUsage] = useState<MediaUsage[]>([]);
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  function toggleUsage(usage: MediaUsage) {
    setSelectedUsage((current) =>
      current.includes(usage) ? current.filter((entry) => entry !== usage) : [...current, usage],
    );
  }

  async function persistUpload(info: CloudinaryUploadInfo) {
    const filename = normalizeFilename(info);
    const payload: MediaAssetCreateRequest = {
      cloudinaryUrl: info.secure_url,
      cloudinaryPublicId: info.public_id,
      filename,
      mimeType: mimeTypeForUpload(info),
      altText: filename,
      caption: '',
      albumId,
      usage: selectedUsage,
      privacyConfirmedNoPeople: privacyConfirmed,
      dimensions: dimensionsForUpload(info),
    };

    const response = await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as MediaAssetMutationResponse;
    if (!response.ok || !result.media) {
      throw new Error(result.message ?? 'The file uploaded, but its record could not be saved.');
    }
    setNotice(`Saved ${result.media.filename} to the media library.`);
  }

  async function openUploadWidget() {
    if (!privacyConfirmed) {
      setError('Confirm the upload contains no identifiable people before selecting files.');
      return;
    }

    setUploading(true);
    setError('');
    setNotice('');
    try {
      const configResponse = await fetch('/api/admin/media/upload-signature');
      const config = (await configResponse.json()) as CloudinaryWidgetConfig;
      if (!configResponse.ok || !config.cloudName || !config.apiKey) {
        throw new Error(config.message ?? 'Media uploads are unavailable.');
      }
      if (!window.cloudinary) {
        throw new Error('The upload service is still loading.');
      }

      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: config.cloudName,
          apiKey: config.apiKey,
          uploadSignature: (callback, paramsToSign) => {
            void fetch('/api/admin/media/upload-signature', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paramsToSign }),
            })
              .then((response) => response.json())
              .then((result: CloudinarySignatureResponse) => {
                if (!result.signature) {
                  throw new Error(result.message ?? 'Unable to authorize the upload.');
                }
                callback(result.signature);
              })
              .catch(() => {
                setError('Unable to authorize the upload.');
                setUploading(false);
                widget.close();
              });
          },
          folder: CLOUDINARY_FOLDERS.media,
          tags: ['media-library'],
          context: { privacy_confirmed_no_people: String(privacyConfirmed) },
          sources: ['local', 'camera'],
          resourceType: 'auto',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'mp4', 'mov', 'pdf'],
          maxFileSize: 20_000_000,
          multiple: true,
        },
        (widgetError, result) => {
          if (widgetError) {
            setError('The upload could not be completed.');
            setUploading(false);
            return;
          }
          if (result.event === 'close' || result.event === 'abort') {
            setUploading(false);
          }
          if (result.event === 'success' && result.info) {
            void persistUpload(result.info)
              .then(() => router.refresh())
              .catch((uploadError: Error) => setError(uploadError.message));
          }
        },
      );
      widget.open();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to open uploads.');
      setUploading(false);
    }
  }

  return (
    <section className="admin-card p-5" aria-labelledby="media-upload-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            Upload Media
          </p>
          <h2 id="media-upload-heading" className="mt-1 font-serif text-2xl text-forest-900">
            Add assets to the library
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-admin-muted">
            Files upload to Cloudinary and are saved as draft media records for review.
          </p>
        </div>
        <button
          type="button"
          onClick={openUploadWidget}
          disabled={!widgetReady || uploading}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <ImageUp aria-hidden="true" className="size-4" />
          )}
          Upload Media
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(13rem,0.9fr)_minmax(0,1.4fr)]">
        <label>
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
            Initial usage
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {MEDIA_USAGE_TYPES.map((usage) => (
              <label
                key={usage}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${
                  selectedUsage.includes(usage)
                    ? 'border-admin-accent bg-admin-accent text-white'
                    : 'border-admin-border bg-white text-admin-muted'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedUsage.includes(usage)}
                  onChange={() => toggleUsage(usage)}
                  className="sr-only"
                />
                {usageLabels[usage]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-admin-accent/25 bg-[#FFF7E8] p-4 text-sm text-forest-900">
        <input
          type="checkbox"
          checked={privacyConfirmed}
          onChange={(event) => setPrivacyConfirmed(event.target.checked)}
          className="mt-1 size-4 rounded border-admin-border text-admin-accent"
        />
        <span>
          <span className="flex items-center gap-2 font-bold">
            <CameraOff aria-hidden="true" className="size-4 text-admin-accent" />I confirm these
            files contain no identifiable people.
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-admin-muted">
            This confirmation is recorded on each uploaded asset before it can enter the approval
            workflow.
          </span>
        </span>
      </label>

      {error ? <p className="mt-3 text-sm font-semibold text-admin-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm font-semibold text-admin-success">{notice}</p> : null}

      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="lazyOnload"
        onLoad={() => setWidgetReady(true)}
      />
    </section>
  );
}
