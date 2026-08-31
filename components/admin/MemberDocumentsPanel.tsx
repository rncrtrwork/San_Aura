'use client';

import { ExternalLink, FileUp, LoaderCircle } from 'lucide-react';
import Script from 'next/script';
import { useState } from 'react';
import type {
  CloudinarySignatureResponse,
  CloudinaryWidgetConfig,
  MemberDocumentCreateRequest,
  MemberDocumentResponse,
} from '@/lib/cloudinaryUpload';
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  documentTracksExpiry,
  type DocumentType,
} from '@/lib/documentOptions';
import type { MemberDocumentItem } from '@/server/members/getMemberDocuments';

type MemberDocumentsPanelProps = {
  memberId: string;
  initialDocuments: MemberDocumentItem[];
};

const inputClass =
  'h-11 rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900';

function mimeTypeForUpload(info: CloudinaryUploadInfo): string {
  const format = info.format.toLowerCase();
  if (format === 'pdf') {
    return 'application/pdf';
  }
  return info.resource_type === 'image'
    ? `image/${format === 'jpg' ? 'jpeg' : format}`
    : 'application/octet-stream';
}

function expiryIndicator(expiresAt: string | null): { label: string; className: string } | null {
  if (!expiresAt) {
    return null;
  }
  const expiration = new Date(expiresAt);
  const daysRemaining = Math.ceil((expiration.getTime() - Date.now()) / 86_400_000);
  if (daysRemaining < 0) {
    return { label: 'Expired', className: 'bg-red-50 text-admin-danger' };
  }
  if (daysRemaining <= 30) {
    return { label: 'Renews soon', className: 'bg-admin-accent/10 text-admin-accent' };
  }
  return { label: 'Current', className: 'bg-admin-success/10 text-admin-success' };
}

export function MemberDocumentsPanel({ memberId, initialDocuments }: MemberDocumentsPanelProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [documentType, setDocumentType] = useState<DocumentType>('photoId');
  const [expiresAt, setExpiresAt] = useState('');
  const [widgetReady, setWidgetReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function persistUpload(info: CloudinaryUploadInfo) {
    const payload: MemberDocumentCreateRequest = {
      type: documentType,
      cloudinaryUrl: info.secure_url,
      cloudinaryPublicId: info.public_id,
      originalFilename: info.original_filename,
      mimeType: mimeTypeForUpload(info),
      expiresAt:
        documentTracksExpiry(documentType) && expiresAt
          ? new Date(`${expiresAt}T12:00:00`).toISOString()
          : null,
    };
    const response = await fetch(`/api/admin/members/${memberId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as MemberDocumentResponse;
    if (!response.ok || !result.document) {
      throw new Error(result.message ?? 'The file uploaded, but its record could not be saved.');
    }
    setDocuments((current) => [result.document!, ...current]);
  }

  async function openUploadWidget() {
    if (documentTracksExpiry(documentType) && !expiresAt) {
      setError('Choose an expiration date before uploading this document.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const configResponse = await fetch(
        `/api/admin/members/${memberId}/documents/upload-signature`,
      );
      const config = (await configResponse.json()) as CloudinaryWidgetConfig;
      if (!configResponse.ok || !config.cloudName || !config.apiKey) {
        throw new Error(config.message ?? 'Document uploads are unavailable.');
      }
      if (!window.cloudinary) {
        throw new Error('The upload service is still loading.');
      }

      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: config.cloudName,
          apiKey: config.apiKey,
          uploadSignature: (callback, paramsToSign) => {
            void fetch(`/api/admin/members/${memberId}/documents/upload-signature`, {
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
          folder: 'sun-aura/member-documents',
          tags: ['member-document', documentType],
          context: { member_id: memberId, document_type: documentType },
          sources: ['local', 'camera'],
          resourceType: 'auto',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
          maxFileSize: 10_000_000,
          multiple: false,
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
              .catch((uploadError: Error) => setError(uploadError.message))
              .finally(() => {
                setUploading(false);
                widget.destroy();
              });
          }
        },
      );
      widget.open();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : 'Document uploads are unavailable.',
      );
      setUploading(false);
    }
  }

  const acceptsExpiry = documentTracksExpiry(documentType);

  return (
    <div className="p-5 sm:p-6">
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="afterInteractive"
        onReady={() => setWidgetReady(true)}
      />
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-admin-border bg-admin-canvas p-4">
        <label className="grid gap-1.5 text-sm font-semibold text-forest-900">
          Document type
          <select
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value as DocumentType)}
            className={inputClass}
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {DOCUMENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
        {acceptsExpiry ? (
          <label className="grid gap-1.5 text-sm font-semibold text-forest-900">
            Expiration date
            <input
              type="date"
              required
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              className={inputClass}
            />
          </label>
        ) : null}
        <button
          type="button"
          onClick={openUploadWidget}
          disabled={!widgetReady || uploading}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white transition-colors hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <FileUp aria-hidden="true" className="size-4" />
          )}
          {uploading ? 'Uploading…' : widgetReady ? 'Upload Document' : 'Loading uploader…'}
        </button>
      </div>
      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-admin-danger/30 bg-red-50 px-4 py-3 text-sm text-admin-danger"
        >
          {error}
        </p>
      ) : null}

      {documents.length === 0 ? (
        <div className="py-12 text-center">
          <p className="font-semibold text-forest-900">No documents on file</p>
          <p className="mt-1 text-sm text-admin-muted">Upload the first member document above.</p>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-admin-border">
          {documents.map((document) => {
            const indicator = expiryIndicator(document.expiresAt);
            return (
              <li
                key={document.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-forest-900">
                    {document.filename}
                  </p>
                  <p className="mt-0.5 text-xs text-admin-muted">
                    {DOCUMENT_TYPE_LABELS[document.type]} · Uploaded{' '}
                    {new Date(document.uploadedAt).toLocaleDateString('en-US')}
                  </p>
                  {document.expiresAt ? (
                    <p className="mt-1 text-xs font-semibold text-admin-muted">
                      Renews on{' '}
                      {new Date(document.expiresAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  ) : documentTracksExpiry(document.type) ? (
                    <p className="mt-1 text-xs font-semibold text-admin-danger">
                      Renewal date needed
                    </p>
                  ) : null}
                </div>
                {indicator ? (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${indicator.className}`}
                  >
                    {indicator.label}
                  </span>
                ) : null}
                <a
                  href={document.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-admin-accent hover:text-admin-accent-hover"
                >
                  View
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
