'use client';

import { LoaderCircle, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type {
  BookingSettingsMutationRequest,
  BookingSettingsMutationResponse,
  SettingsOverview,
} from '@/lib/settingsManager';

type BookingDefaultsFormProps = {
  booking: SettingsOverview['booking'];
};

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900 placeholder:text-admin-muted';

function numberValue(form: FormData, name: string): number {
  const value = form.get(name);
  const parsed = typeof value === 'string' ? Number(value) : Number.NaN;
  return Number.isInteger(parsed) ? parsed : -1;
}

export function BookingDefaultsForm({ booking }: BookingDefaultsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const form = new FormData(formEvent.currentTarget);
    const payload: BookingSettingsMutationRequest = {
      cancellationWindowDays: numberValue(form, 'cancellationWindowDays'),
      depositRequirementPercent: numberValue(form, 'depositRequirementPercent'),
      minimumAge: numberValue(form, 'minimumAge'),
      defaultMinimumStay: numberValue(form, 'defaultMinimumStay'),
    };

    try {
      const response = await fetch('/api/admin/settings/booking', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as BookingSettingsMutationResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to save booking defaults.');
        return;
      }

      setMessage(result.message ?? 'Booking defaults saved.');
      router.refresh();
    } catch {
      setError('Unable to reach the server.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-admin-border bg-white p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Booking defaults
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">Reservation rule defaults</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">
            These values guide admin booking workflows and public reservation-request copy.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          Save Booking
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-forest-900">
          Cancellation window days
          <input
            name="cancellationWindowDays"
            type="number"
            min={0}
            max={365}
            required
            defaultValue={booking.cancellationWindowDays}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Deposit requirement percent
          <input
            name="depositRequirementPercent"
            type="number"
            min={0}
            max={100}
            required
            defaultValue={booking.depositRequirementPercent}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Minimum age
          <input
            name="minimumAge"
            type="number"
            min={18}
            max={120}
            required
            defaultValue={booking.minimumAge}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Default minimum stay
          <input
            name="defaultMinimumStay"
            type="number"
            min={1}
            max={365}
            required
            defaultValue={booking.defaultMinimumStay}
            className={inputClass}
          />
        </label>
      </div>

      {message ? (
        <p role="status" className="mt-4 text-sm font-semibold text-admin-success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 text-sm font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
    </form>
  );
}
