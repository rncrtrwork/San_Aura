'use client';

import { CalendarPlus, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const date = fieldValue(form, 'date');
    const startTime = fieldValue(form, 'startTime');
    const endTime = fieldValue(form, 'endTime');
    const payload: EventMutationRequest = {
      title: fieldValue(form, 'title'),
      startsAt: `${date}T${startTime}:00`,
      endsAt: `${date}T${endTime}:00`,
      location: fieldValue(form, 'location'),
      capacity: capacityValue(fieldValue(form, 'capacity')),
      registrationRequired: form.get('registrationRequired') === 'on',
      description: fieldValue(form, 'description'),
      imageUrl: fieldValue(form, 'imageUrl'),
      imagePublicId: '',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          <label className="text-sm font-semibold text-forest-900 md:col-span-2">
            Image URL
            <input
              name="imageUrl"
              type="url"
              maxLength={2000}
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
