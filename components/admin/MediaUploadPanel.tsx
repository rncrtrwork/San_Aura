'use client';

import { ImageUp, LoaderCircle } from 'lucide-react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CLOUDINARY_FOLDERS } from '@/lib/cloudinaryFolders';
import type { CloudinarySignatureResponse, CloudinaryWidgetConfig } from '@/lib/cloudinaryUpload';
import type { MediaAssetCreateRequest, MediaAssetMutationResponse } from '@/lib/mediaForms';

function normalizeFilename(info: CloudinaryUploadInfo): string {
  const base = info.original_filename.trim() || info.public_id.split('/').at(-1) || 'gallery';
  return info.format ? `${base}.${info.format.toLowerCase()}` : base;
}

function mimeTypeForUpload(info: CloudinaryUploadInfo): string {
  const format = info.format.toLowerCase();
  return `image/${format === 'jpg' ? 'jpeg' : format}`;
}

function dimensionsForUpload(info: CloudinaryUploadInfo): { width: number; height: number } {
  return {
    width: typeof info.width === 'number' && info.width > 0 ? Math.round(info.width) : 1,
    height: typeof info.height === 'number' && info.height > 0 ? Math.round(info.height) : 1,
  };
}

export function MediaUploadPanel() {
  const router = useRouter();
  const [widgetReady, setWidgetReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function persistUpload(info: CloudinaryUploadInfo) {
    const filename = normalizeFilename(info);
    const payload: MediaAssetCreateRequest = {
      cloudinaryUrl: info.secure_url,
      cloudinaryPublicId: info.public_id,
      filename,
      mimeType: mimeTypeForUpload(info),
      altText: filename,
      caption: '',
      albumId: '',
      usage: ['homepage'],
      privacyConfirmedNoPeople: true,
      dimensions: dimensionsForUpload(info),
    };

    const response = await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as MediaAssetMutationResponse;
    if (!response.ok || !result.media) {
      throw new Error(result.message ?? 'The photo uploaded, but its record could not be saved.');
    }
    setNotice(`Published ${result.media.filename} to the public gallery.`);
  }

  async function openUploadWidget() {
    setUploading(true);
    setError('');
    setNotice('');

    try {
      const configResponse = await fetch('/api/admin/media/upload-signature');
      const config = (await configResponse.json()) as CloudinaryWidgetConfig;
      if (!configResponse.ok || !config.cloudName || !config.apiKey) {
        throw new Error(config.message ?? 'Gallery uploads are unavailable.');
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
          tags: ['gallery'],
          sources: ['local', 'camera'],
          resourceType: 'image',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
          maxFileSize: 20_000_000,
          multiple: true,
        },
        (widgetError, result) => {
          if (widgetError) {
            setError('The photo upload could not be completed.');
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
    <section
      className="overflow-hidden rounded-2xl border border-admin-border bg-gradient-to-br from-white to-cream-alt p-5 shadow-admin"
      aria-labelledby="media-upload-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            Gallery Photos
          </p>
          <h2 id="media-upload-heading" className="mt-1 font-serif text-2xl text-forest-900">
            Upload photos to the public gallery
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-admin-muted">
            Add resort photos. New uploads are published to the website gallery automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={openUploadWidget}
          disabled={!widgetReady || uploading}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-admin-sidebar px-5 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <ImageUp aria-hidden="true" className="size-4" />
          )}
          Upload Photos
        </button>
      </div>

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
