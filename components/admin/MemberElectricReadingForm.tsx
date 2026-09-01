'use client';

import { Bolt, LoaderCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type {
  ElectricReadingCreateRequest,
  ElectricReadingCreateResponse,
} from '@/lib/electricReadingForms';
import type { ElectricReadingSiteOption } from '@/server/electricBilling/getElectricReadingOptions';

type MemberElectricReadingFormProps = {
  memberId: string;
  siteOptions: ElectricReadingSiteOption[];
  defaultSiteId: string;
};

const inputClass =
  'mt-1.5 h-10 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900';

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function todayValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function MemberElectricReadingForm({
  memberId,
  siteOptions,
  defaultSiteId,
}: MemberElectricReadingFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload: ElectricReadingCreateRequest = {
      siteId: fieldValue(form, 'siteId'),
      meterValue: Number(fieldValue(form, 'meterValue')),
      readingDate: fieldValue(form, 'readingDate'),
    };

    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/admin/members/${memberId}/electric-readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ElectricReadingCreateResponse;
      if (!response.ok || !result.id) {
        setError(result.message ?? 'Unable to save the meter reading.');
        return;
      }
      formElement.reset();
      setMessage(
        `Meter reading saved. Delta: ${(result.kwhUsed ?? 0).toLocaleString()} kWh; charge: $${(
          result.resultingCharge ?? 0
        ).toFixed(2)}; prepaid applied: $${(result.prepaidApplied ?? 0).toFixed(2)}; new due: $${(
          result.newDueAmount ?? 0
        ).toFixed(2)}.`,
      );
      router.refresh();
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active"
      >
        <Plus aria-hidden="true" className="size-4" />
        Add Meter Reading
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-lg border border-admin-border bg-admin-canvas p-4"
    >
      <div className="flex items-center justify-between gap-4">
        <h4 className="font-bold text-forest-900">Add Meter Reading</h4>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm font-semibold text-admin-muted hover:text-forest-900"
        >
          Cancel
        </button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="text-sm font-semibold text-forest-900">
          Site
          <select name="siteId" defaultValue={defaultSiteId} className={inputClass}>
            <option value="">Member account only</option>
            {siteOptions.map((site) => (
              <option key={site.id} value={site.id}>
                {site.code} · {site.area} · {site.type}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Meter value
          <input
            name="meterValue"
            type="number"
            min="0"
            max="10000000"
            step="0.001"
            required
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Reading date
          <input
            name="readingDate"
            type="date"
            required
            defaultValue={todayValue()}
            className={inputClass}
          />
        </label>
      </div>
      <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-admin-muted">
        <Bolt aria-hidden="true" className="size-4 text-admin-accent" />
        kWh used is computed from the previous reading for the selected member and site.
      </p>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="mt-3 text-sm font-semibold text-admin-success">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-60"
      >
        {submitting ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Plus aria-hidden="true" className="size-4" />
        )}
        {submitting ? 'Saving…' : 'Save Reading'}
      </button>
    </form>
  );
}
