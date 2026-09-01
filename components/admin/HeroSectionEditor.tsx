'use client';

import { ImageUp, LoaderCircle, Save } from 'lucide-react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CloudinarySignatureResponse, CloudinaryWidgetConfig } from '@/lib/cloudinaryUpload';
import type {
  ContentPageSlug,
  ContentSectionDetail,
  ContentSectionMutationResponse,
  HeroSectionMutationRequest,
} from '@/lib/contentManager';
import type { MediaAssetCreateRequest, MediaAssetMutationResponse } from '@/lib/mediaForms';

type HeroSectionEditorProps = {
  pageSlug: ContentPageSlug;
  selectedSection: ContentSectionDetail | null;
};

function normalizeFilename(info: CloudinaryUploadInfo): string {
  const base = info.original_filename.trim() || info.public_id.split('/').at(-1) || 'hero-image';
  return info.format ? `${base}.${info.format.toLowerCase()}` : base;
}

function mimeTypeForUpload(info: CloudinaryUploadInfo): string {
  const format = info.format.toLowerCase();
  if (info.resource_type === 'image') return `image/${format === 'jpg' ? 'jpeg' : format}`;
  return 'application/octet-stream';
}

function dimensionsForUpload(info: CloudinaryUploadInfo): { width: number; height: number } {
  return {
    width: typeof info.width === 'number' && info.width > 0 ? Math.round(info.width) : 1,
    height: typeof info.height === 'number' && info.height > 0 ? Math.round(info.height) : 1,
  };
}

export function HeroSectionEditor({ pageSlug, selectedSection }: HeroSectionEditorProps) {
  const router = useRouter();
  const selectedHero = selectedSection?.type === 'hero' ? selectedSection.hero : null;
  const [sectionKey, setSectionKey] = useState(
    selectedSection?.type === 'hero' ? selectedSection.key : '',
  );
  const [imageId, setImageId] = useState(selectedHero?.imageId ?? '');
  const [eyebrow, setEyebrow] = useState(selectedHero?.eyebrow ?? '');
  const [heading, setHeading] = useState(selectedHero?.heading ?? '');
  const [body, setBody] = useState(selectedHero?.body ?? '');
  const [active, setActive] = useState(
    selectedSection?.type === 'hero' ? selectedSection.active : true,
  );
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const [saving, setSaving] = useState(false);
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
      throw new Error(
        result.message ?? 'The hero image uploaded, but its record could not be saved.',
      );
    }
    setImageId(result.media.id);
    setNotice(`Hero image ready: ${result.media.filename}`);
  }

  async function openUploadWidget() {
    if (!privacyConfirmed) {
      setError('Confirm the hero image contains no identifiable people before uploading.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');
    try {
      const configResponse = await fetch('/api/admin/media/upload-signature');
      const config = (await configResponse.json()) as CloudinaryWidgetConfig;
      if (!configResponse.ok || !config.cloudName || !config.apiKey) {
        throw new Error(config.message ?? 'Hero image uploads are unavailable.');
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
                setSaving(false);
                widget.close();
              });
          },
          folder: 'sun-aura/media',
          tags: ['content-hero'],
          context: { privacy_confirmed_no_people: String(privacyConfirmed) },
          sources: ['local'],
          resourceType: 'auto',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
          maxFileSize: 12_000_000,
          multiple: false,
        },
        (widgetError, result) => {
          if (widgetError) {
            setError('The hero image upload could not be completed.');
            setSaving(false);
            return;
          }
          if (result.event === 'close' || result.event === 'abort') {
            setSaving(false);
          }
          if (result.event === 'success' && result.info) {
            void persistUpload(result.info)
              .then(() => router.refresh())
              .catch((uploadError: Error) => setError(uploadError.message))
              .finally(() => setSaving(false));
          }
        },
      );
      widget.open();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to open uploads.');
      setSaving(false);
    }
  }

  async function saveHeroSection() {
    setSaving(true);
    setError('');
    setNotice('');
    const payload: HeroSectionMutationRequest = {
      sectionKey,
      imageId,
      eyebrow,
      heading,
      body,
      active,
    };

    try {
      const response = await fetch(`/api/admin/content/pages/${pageSlug}/sections/hero`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ContentSectionMutationResponse;
      if (!response.ok) {
        throw new Error(result.message ?? 'Unable to save hero section.');
      }
      setSectionKey(result.section?.key ?? sectionKey);
      setNotice(result.message ?? 'Hero section saved.');
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save hero section.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-admin-border bg-cream-alt/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            Hero Editor
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">
            {selectedHero ? 'Edit hero section' : 'Add hero section'}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-admin-muted">
            Set the public page hero image, eyebrow, H1 text, and supporting introduction.
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-admin-muted">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="size-4 rounded border-admin-border text-admin-accent"
          />
          Active
        </label>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Hero image asset ID
          </span>
          <input
            value={imageId}
            onChange={(event) => setImageId(event.target.value)}
            placeholder="Media asset ObjectId"
            maxLength={80}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          />
        </label>
        <label>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Eyebrow
          </span>
          <input
            value={eyebrow}
            onChange={(event) => setEyebrow(event.target.value)}
            placeholder="Welcome to Sun Aura"
            maxLength={120}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          />
        </label>
        <label className="lg:col-span-2">
          <span className="flex justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            H1 text
            <span>{heading.length}/200</span>
          </span>
          <input
            value={heading}
            onChange={(event) => setHeading(event.target.value.slice(0, 200))}
            placeholder="A peaceful adults-only resort experience"
            maxLength={200}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          />
        </label>
        <label className="lg:col-span-2">
          <span className="flex justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Intro body
            <span>{body.length}/3000</span>
          </span>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value.slice(0, 3000))}
            maxLength={3000}
            className="mt-2 min-h-24 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900"
          />
        </label>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-admin-accent/25 bg-white p-4 text-sm text-forest-900">
        <input
          type="checkbox"
          checked={privacyConfirmed}
          onChange={(event) => setPrivacyConfirmed(event.target.checked)}
          className="mt-1 size-4 rounded border-admin-border text-admin-accent"
        />
        <span>
          <span className="font-bold">Hero image contains no identifiable people.</span>
          <span className="mt-1 block text-xs leading-relaxed text-admin-muted">
            Required before opening the image uploader.
          </span>
        </span>
      </label>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openUploadWidget}
          disabled={!widgetReady || saving}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-admin-sidebar px-4 text-sm font-bold text-admin-sidebar hover:bg-admin-sidebar hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ImageUp aria-hidden="true" className="size-4" />
          Upload hero image
        </button>
        <button
          type="button"
          onClick={() => void saveHeroSection()}
          disabled={saving || !heading.trim()}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          Save hero
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
