'use client';

import { LoaderCircle, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type {
  PublicEventItem,
  PublicEventRegistrationRequest,
  PublicEventRegistrationResponse,
} from '@/lib/eventRegistration';

type EventRegistrationFormProps = {
  event: PublicEventItem;
};

const inputClass =
  'mt-1.5 h-11 w-full rounded border border-line bg-white px-3 text-sm text-forest-900 placeholder:text-ink-700/50';

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function EventRegistrationForm({ event }: EventRegistrationFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    const form = new FormData(formEvent.currentTarget);
    const payload: PublicEventRegistrationRequest = {
      name: fieldValue(form, 'name'),
      email: fieldValue(form, 'email'),
      phone: fieldValue(form, 'phone'),
      partySize: Number(fieldValue(form, 'partySize')),
    };

    try {
      const response = await fetch(`/api/events/${event.id}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as PublicEventRegistrationResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to complete registration.');
        return;
      }
      formEvent.currentTarget.reset();
      setMessage(
        result.remainingCapacity === null || result.remainingCapacity === undefined
          ? 'Registration received.'
          : `Registration received. ${result.remainingCapacity} spots remain.`,
      );
    } catch {
      setError('Unable to reach the registration service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!event.registrationRequired) {
    return <p className="text-sm font-semibold text-ink-700">No registration required.</p>;
  }
  if (event.capacity !== null && event.capacity <= 0) {
    return <p className="text-sm font-semibold text-forest-900">This event is full.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
      <label className="text-sm font-semibold text-forest-900">
        Name
        <input name="name" required maxLength={120} autoComplete="name" className={inputClass} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold text-forest-900">
          Email
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Phone
          <input name="phone" required maxLength={30} autoComplete="tel" className={inputClass} />
        </label>
      </div>
      <label className="max-w-36 text-sm font-semibold text-forest-900">
        Party size
        <input
          name="partySize"
          type="number"
          min={1}
          max={100}
          defaultValue={1}
          required
          className={inputClass}
        />
      </label>
      {message ? (
        <p role="status" className="text-sm font-semibold text-admin-success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-11 w-fit items-center gap-2 rounded bg-forest-900 px-5 text-sm font-bold text-white hover:bg-forest-800 disabled:opacity-60"
      >
        {submitting ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Send aria-hidden="true" className="size-4" />
        )}
        Register
      </button>
    </form>
  );
}
