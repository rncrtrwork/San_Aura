'use client';

import { CalendarDays, FileUp, ImageIcon, LoaderCircle, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { CLOUDINARY_FOLDERS } from '@/lib/cloudinaryFolders';
import type { CloudinarySignatureResponse, CloudinaryWidgetConfig } from '@/lib/cloudinaryUpload';
import type { EventMutationRequest, EventMutationResponse } from '@/lib/eventForms';
import type { EventListItem } from '@/lib/eventFilters';

type EventEditPanelProps = {
  event: EventListItem;
};

type CalendarMonth = {
  year: number;
  monthIndex: number;
};

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900 placeholder:text-admin-muted';

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'narrow',
  timeZone: 'UTC',
});

function dateInputValue(value: string): string {
  return value.slice(0, 10);
}

function timeInputValue(value: string): string {
  return value.slice(11, 16);
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

function submittedStatus(
  formEvent: FormEvent<HTMLFormElement>,
  currentStatus: EventListItem['status'],
): EventListItem['status'] {
  const nativeEvent = formEvent.nativeEvent as SubmitEvent;
  const submitter =
    nativeEvent.submitter instanceof HTMLButtonElement ? nativeEvent.submitter : null;
  if (submitter?.value === 'draft') return 'draft';
  if (submitter?.value === 'published') return 'published';
  return currentStatus;
}

function daysForMiniCalendar(month: CalendarMonth): Date[] {
  const firstDay = new Date(Date.UTC(month.year, month.monthIndex, 1));
  const dayCount = new Date(Date.UTC(month.year, month.monthIndex + 1, 0)).getUTCDate();
  const leadingDays = firstDay.getUTCDay();
  return [
    ...Array.from(
      { length: leadingDays },
      (_, index) => new Date(Date.UTC(month.year, month.monthIndex, index - leadingDays + 1)),
    ),
    ...Array.from(
      { length: dayCount },
      (_, index) => new Date(Date.UTC(month.year, month.monthIndex, index + 1)),
    ),
  ];
}

function miniCalendarMonth(dateValue: string): CalendarMonth {
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  return { year: date.getUTCFullYear(), monthIndex: date.getUTCMonth() };
}

function registrationPercent(event: EventListItem): number {
  if (event.capacity === null) return 0;
  const totalCapacity = event.registrationsCount + event.capacity;
  return totalCapacity === 0
    ? 100
    : Math.min(100, Math.round((event.registrationsCount / totalCapacity) * 100));
}

export function EventEditPanel({ event }: EventEditPanelProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState(dateInputValue(event.startsAt));
  const [imageUrl, setImageUrl] = useState(event.imageUrl);
  const [imagePublicId, setImagePublicId] = useState(event.imagePublicId);
  const [widgetReady, setWidgetReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const calendarMonth = useMemo(() => miniCalendarMonth(selectedDate), [selectedDate]);
  const calendarDays = useMemo(() => daysForMiniCalendar(calendarMonth), [calendarMonth]);

  function buildPayload(
    form: FormData,
    image: { url: string; publicId: string },
    status: EventListItem['status'],
  ): EventMutationRequest {
    const date = fieldValue(form, 'date');
    const startTime = fieldValue(form, 'startTime');
    const endTime = fieldValue(form, 'endTime');
    return {
      title: fieldValue(form, 'title'),
      startsAt: `${date}T${startTime}:00`,
      endsAt: `${date}T${endTime}:00`,
      location: fieldValue(form, 'location'),
      capacity: capacityValue(fieldValue(form, 'capacity')),
      registrationRequired: form.get('registrationRequired') === 'on',
      description: fieldValue(form, 'description'),
      imageUrl: image.url,
      imagePublicId: image.publicId,
      featureOnHomepage: form.get('featureOnHomepage') === 'on',
      sendReminder: form.get('sendReminder') === 'on',
      status,
    };
  }

  async function saveEvent(payload: EventMutationRequest): Promise<EventMutationResponse> {
    const response = await fetch(`/api/admin/events/${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as EventMutationResponse;
    if (!response.ok) {
      throw new Error(result.message ?? 'Unable to save this event.');
    }
    return result;
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    const form = new FormData(formEvent.currentTarget);
    const payload = buildPayload(
      form,
      {
        url: fieldValue(form, 'imageUrl'),
        publicId: imagePublicId,
      },
      submittedStatus(formEvent, event.status),
    );

    try {
      const result = await saveEvent(payload);
      setMessage(result.message ?? 'Event saved.');
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to reach the server.');
    } finally {
      setSubmitting(false);
    }
  }

  async function persistUpload(info: CloudinaryUploadInfo) {
    if (!formRef.current) {
      throw new Error('Event form is unavailable.');
    }
    const payload = buildPayload(
      new FormData(formRef.current),
      {
        url: info.secure_url,
        publicId: info.public_id,
      },
      event.status,
    );
    await saveEvent(payload);
    setImageUrl(info.secure_url);
    setImagePublicId(info.public_id);
    setMessage('Event image uploaded.');
    router.refresh();
  }

  async function openUploadWidget() {
    setUploading(true);
    setError('');
    setMessage('');
    try {
      const configResponse = await fetch(`/api/admin/events/${event.id}/upload-signature`);
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
            void fetch(`/api/admin/events/${event.id}/upload-signature`, {
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
          tags: ['event', event.id],
          context: { event_id: event.id },
          sources: ['local', 'camera'],
          resourceType: 'auto',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
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
        uploadError instanceof Error ? uploadError.message : 'Event image uploads are unavailable.',
      );
      setUploading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="afterInteractive"
        onReady={() => setWidgetReady(true)}
      />
      <section className="admin-card overflow-hidden">
        <div
          className="relative min-h-64 bg-cover bg-center"
          style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined}
        >
          <div className="absolute inset-0 bg-forest-900/35" aria-hidden="true" />
          {!imageUrl ? (
            <div className="absolute inset-0 grid place-items-center bg-cream-alt text-admin-muted">
              <ImageIcon aria-hidden="true" className="size-12" />
            </div>
          ) : null}
          <div className="relative flex min-h-64 items-end justify-between gap-4 p-5 sm:p-6">
            <div className="text-white">
              <p className="text-xs font-bold uppercase tracking-[0.16em]">Event image</p>
              <h2 className="mt-2 font-serif text-3xl">{event.title}</h2>
            </div>
            <button
              type="button"
              onClick={openUploadWidget}
              disabled={!widgetReady || uploading}
              className="inline-flex h-11 items-center rounded-lg bg-white px-4 text-sm font-bold text-forest-900"
            >
              {uploading ? (
                <LoaderCircle aria-hidden="true" className="mr-2 size-4 animate-spin" />
              ) : (
                <FileUp aria-hidden="true" className="mr-2 size-4" />
              )}
              {widgetReady ? 'Change Image' : 'Loading Uploader'}
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="admin-card p-5 sm:p-6">
          <h2 className="font-serif text-2xl text-forest-900">Details</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-forest-900">
              Title
              <input
                name="title"
                required
                maxLength={160}
                defaultValue={event.title}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold text-forest-900">
              Location
              <input
                name="location"
                required
                maxLength={200}
                defaultValue={event.location}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold text-forest-900">
              Date
              <input
                name="date"
                type="date"
                required
                value={selectedDate}
                onChange={(inputEvent) => setSelectedDate(inputEvent.target.value)}
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
                  defaultValue={timeInputValue(event.startsAt)}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold text-forest-900">
                End time
                <input
                  name="endTime"
                  type="time"
                  required
                  defaultValue={timeInputValue(event.endsAt)}
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
                defaultValue={event.capacity ?? ''}
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-3 self-end rounded-lg border border-admin-border bg-white px-4 py-3 text-sm font-bold text-forest-900">
              <input
                name="registrationRequired"
                type="checkbox"
                defaultChecked={event.registrationRequired}
                className="size-4 rounded border-admin-border text-admin-accent"
              />
              Registration required
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-admin-border bg-white px-4 py-3 text-sm font-bold text-forest-900">
              <input
                name="featureOnHomepage"
                type="checkbox"
                defaultChecked={event.featureOnHomepage}
                className="size-4 rounded border-admin-border text-admin-accent"
              />
              Feature on homepage
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-admin-border bg-white px-4 py-3 text-sm font-bold text-forest-900">
              <input
                name="sendReminder"
                type="checkbox"
                defaultChecked={event.sendReminder}
                className="size-4 rounded border-admin-border text-admin-accent"
              />
              Send reminder
            </label>
            <label className="text-sm font-semibold text-forest-900 md:col-span-2">
              Image URL
              <input
                ref={imageInputRef}
                name="imageUrl"
                type="url"
                maxLength={2000}
                value={imageUrl}
                onChange={(inputEvent) => setImageUrl(inputEvent.target.value)}
                className={inputClass}
                placeholder="https://..."
              />
            </label>
            <label className="text-sm font-semibold text-forest-900 md:col-span-2">
              Description
              <textarea
                name="description"
                required
                maxLength={10000}
                defaultValue={event.description}
                className="mt-1.5 min-h-44 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900 placeholder:text-admin-muted"
              />
            </label>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="admin-card p-5">
            <h2 className="font-serif text-2xl text-forest-900">Registrations</h2>
            <p className="mt-3 text-4xl font-bold text-forest-900">{event.registrationsCount}</p>
            <p className="mt-1 text-sm font-semibold text-admin-muted">
              {event.capacity === null ? 'Unlimited capacity' : `${event.capacity} spots remaining`}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-cream-alt">
              <div
                className="h-full bg-admin-accent"
                style={{ width: `${registrationPercent(event)}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-semibold text-admin-muted">
              {event.registrationRequired ? 'Registration required' : 'Registration optional'}
            </p>
          </div>

          <div className="admin-card p-5">
            <div className="flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="size-5 text-admin-accent" />
              <h2 className="font-serif text-2xl text-forest-900">Date Picker</h2>
            </div>
            <p className="mt-2 text-sm font-semibold text-admin-muted">
              {monthFormatter.format(
                new Date(Date.UTC(calendarMonth.year, calendarMonth.monthIndex, 1)),
              )}
            </p>
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: 7 }, (_, index) => (
                <span key={index} className="py-1 font-bold text-admin-muted">
                  {weekdayFormatter.format(new Date(Date.UTC(2026, 1, index + 1)))}
                </span>
              ))}
              {calendarDays.map((day) => {
                const key = day.toISOString().slice(0, 10);
                const inMonth = day.getUTCMonth() === calendarMonth.monthIndex;
                const selected = key === selectedDate;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(key)}
                    className={`grid aspect-square place-items-center rounded-md text-xs font-bold ${
                      selected
                        ? 'bg-admin-accent text-white'
                        : inMonth
                          ? 'bg-cream-alt text-forest-900 hover:bg-admin-accent/10'
                          : 'bg-transparent text-admin-muted/50'
                    }`}
                  >
                    {day.getUTCDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {message ? (
        <p role="status" className="text-sm font-semibold text-admin-success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-admin-danger/30 bg-red-50 px-4 py-3 text-sm font-semibold text-admin-danger"
        >
          {error}
        </p>
      ) : null}
      <div className="flex justify-end">
        <button
          type="submit"
          name="status"
          value="draft"
          disabled={submitting}
          className="mr-2 inline-flex h-11 items-center gap-2 rounded-lg border border-admin-border px-5 text-sm font-bold text-forest-900 hover:border-admin-accent hover:text-admin-accent disabled:opacity-60"
        >
          Save Draft
        </button>
        <button
          type="submit"
          name="status"
          value="published"
          disabled={submitting}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-5 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-60"
        >
          {submitting ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          Publish Changes
        </button>
      </div>
    </form>
  );
}
