'use client';

import { CalendarPlus, FileUp, ImageIcon, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useState, type FormEvent } from 'react';
import { CLOUDINARY_FOLDERS } from '@/lib/cloudinaryFolders';
import type { CloudinarySignatureResponse, CloudinaryWidgetConfig } from '@/lib/cloudinaryUpload';
import { buildEventDateTimeRange } from '@/lib/eventDateTime';
import type { EventMutationRequest, EventMutationResponse } from '@/lib/eventForms';

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900 placeholder:text-admin-muted';

function dateValue(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function capacityValue(value: string): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export function EventCreateForm() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [widgetReady, setWidgetReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    const form = new FormData(event.currentTarget);
    const date = fieldValue(form, 'date');
    const startTime = fieldValue(form, 'startTime');
    const endTime = fieldValue(form, 'endTime');
    const dateTimeRange = buildEventDateTimeRange(date, startTime, endTime);
    const payload: EventMutationRequest = {
      title: fieldValue(form, 'title'),
      startsAt: dateTimeRange.startsAt,
      endsAt: dateTimeRange.endsAt,
      location: fieldValue(form, 'location'),
      capacity: capacityValue(fieldValue(form, 'capacity')),
      registrationRequired: form.get('registrationRequired') === 'on',
      description: fieldValue(form, 'description'),
      imageUrl,
      imagePublicId,
      featureOnHomepage: false,
      sendReminder: false,
      status: 'draft',
    };

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as EventMutationResponse;
      if (!response.ok || !result.id) {
        setError(result.message ?? 'Unable to create this event.');
        return;
      }
      router.push(`/admin/events/${result.id}`);
      router.refresh();
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function openUploadWidget() {
    setUploading(true);
    setMessage('');
    setError('');
    try {
      const configResponse = await fetch('/api/admin/events/upload-signature');
      const config = (await configResponse.json()) as CloudinaryWidgetConfig;
      if (!configResponse.ok || !config.cloudName || !config.apiKey) {
        throw new Error(config.message ?? 'Event image uploads are unavailable.');
      }
      if (!window.cloudinary) {
        throw new Error('The upload service is still loading.');
      }

      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: config.cloudName,
          apiKey: config.apiKey,
          uploadSignature: (callback, paramsToSign) => {
            void fetch('/api/admin/events/upload-signature', {
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
          folder: CLOUDINARY_FOLDERS.events,
          tags: ['event', 'draft'],
          context: { usage: 'event_image' },
          sources: ['local', 'camera'],
          resourceType: 'auto',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
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
            setImageUrl(result.info.secure_url);
            setImagePublicId(result.info.public_id);
            setMessage('Event image uploaded. Create the draft to save it.');
            setUploading(false);
            widget.destroy();
          }
        },
      );
      widget.open();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : 'Event image uploads are unavailable.',
      );
      setUploading(false);
    }
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="space-y-6">
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="afterInteractive"
        onReady={() => setWidgetReady(true)}
      />
      <section className="admin-card p-5 sm:p-6">
        <h2 className="font-serif text-2xl text-forest-900">Event Details</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-forest-900">
            Title
            <input name="title" required maxLength={160} className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Location
            <input name="location" required maxLength={200} className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Date
            <input
              name="date"
              type="date"
              required
              defaultValue={dateValue(7)}
              className={inputClass}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-forest-900">
              Start time
              <input
                name="startTime"
                type="time"
                required
                defaultValue="18:00"
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold text-forest-900">
              End time
              <input
                name="endTime"
                type="time"
                required
                defaultValue="20:00"
                className={inputClass}
              />
            </label>
          </div>
          <label className="text-sm font-semibold text-forest-900">
            Capacity
            <input
              name="capacity"
              type="number"
              min={1}
              max={10000}
              className={inputClass}
              placeholder="Leave blank for unlimited"
            />
          </label>
          <label className="flex items-center gap-3 self-end rounded-lg border border-admin-border bg-white px-4 py-3 text-sm font-bold text-forest-900">
            <input
              name="registrationRequired"
              type="checkbox"
              className="size-4 rounded border-admin-border text-admin-accent"
            />
            Registration required
          </label>
          <div className="md:col-span-2">
            <span className="text-sm font-semibold text-forest-900">Event image</span>
            <div className="mt-1.5 overflow-hidden rounded-lg border border-admin-border bg-white">
              {imageUrl ? (
                <div
                  className="min-h-32 bg-cover bg-center sm:min-h-40"
                  style={{ backgroundImage: `url("${imageUrl}")` }}
                  aria-label="Uploaded event image preview"
                />
              ) : (
                <div className="grid min-h-32 place-items-center bg-cream-alt text-admin-muted sm:min-h-40">
                  <div className="text-center">
                    <ImageIcon aria-hidden="true" className="mx-auto size-8" />
                    <p className="mt-2 text-sm font-semibold">No event image uploaded yet.</p>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-admin-border px-4 py-3">
                <p className="text-xs text-admin-muted">
                  JPG, PNG, WebP, or AVIF. Upload is optional.
                </p>
                <button
                  type="button"
                  onClick={openUploadWidget}
                  disabled={!widgetReady || uploading}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-admin-sidebar px-3 text-xs font-bold text-white hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? (
                    <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                  ) : (
                    <FileUp aria-hidden="true" className="size-4" />
                  )}
                  {imageUrl ? 'Replace Image' : widgetReady ? 'Upload Image' : 'Loading Uploader'}
                </button>
              </div>
            </div>
          </div>
          <label className="text-sm font-semibold text-forest-900 md:col-span-2">
            Description
            <textarea
              name="description"
              required
              maxLength={10000}
              className="mt-1.5 min-h-44 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900 placeholder:text-admin-muted"
            />
          </label>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-admin-danger/30 bg-red-50 px-4 py-3 text-sm font-semibold text-admin-danger"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-sm font-semibold text-admin-success">
          {message}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-5 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-60"
        >
          {submitting ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <CalendarPlus aria-hidden="true" className="size-4" />
          )}
          Create Draft
        </button>
      </div>
    </form>
  );
}
