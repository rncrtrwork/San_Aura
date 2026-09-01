'use client';

import { LoaderCircle, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type {
  OperatingSettingsMutationRequest,
  OperatingSettingsMutationResponse,
  SettingsOverview,
} from '@/lib/settingsManager';

type OperatingSeasonFormProps = {
  operating: SettingsOverview['operating'];
};

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900 placeholder:text-admin-muted';

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function taxRateValue(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : -1;
}

export function OperatingSeasonForm({ operating }: OperatingSeasonFormProps) {
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
    const payload: OperatingSettingsMutationRequest = {
      openYearRound: form.get('openYearRound') === 'on',
      taxRatePercent: taxRateValue(fieldValue(form, 'taxRatePercent')),
      currency: fieldValue(form, 'currency'),
      dateFormat: fieldValue(form, 'dateFormat'),
    };

    try {
      const response = await fetch('/api/admin/settings/operating', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as OperatingSettingsMutationResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to save operating settings.');
        return;
      }

      setMessage(result.message ?? 'Operating settings saved.');
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
            Operating season
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">Season and display defaults</h3>
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
          Save Operating
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-lg border border-admin-border bg-cream-alt/60 px-4 py-3 text-sm font-bold text-forest-900">
          <input
            name="openYearRound"
            type="checkbox"
            defaultChecked={operating.openYearRound}
            className="size-4 rounded border-admin-border text-admin-accent"
          />
          Open year-round
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Tax rate percent
          <input
            name="taxRatePercent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            required
            defaultValue={operating.taxRatePercent}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Currency
          <input
            name="currency"
            required
            maxLength={3}
            defaultValue={operating.currency}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Date format
          <input
            name="dateFormat"
            required
            maxLength={30}
            defaultValue={operating.dateFormat}
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
