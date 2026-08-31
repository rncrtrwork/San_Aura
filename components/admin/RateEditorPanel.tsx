'use client';

import { BadgeDollarSign, LoaderCircle, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import {
  stayTypeLabels,
  type AdminStayType,
  type StayTypeMutationRequest,
  type StayTypeMutationResponse,
} from '@/lib/stayTypes';

type RateEditorPanelProps = {
  stayTypes: AdminStayType[];
};

type RateFieldName = 'baseRate' | 'weekendRate' | 'extraGuestFee' | 'minimumStay' | 'cleaningFee';

type RateField = {
  name: RateFieldName;
  label: string;
  step: string;
  min: number;
};

const rateFields: RateField[] = [
  { name: 'baseRate', label: 'Base rate', step: '0.01', min: 0 },
  { name: 'weekendRate', label: 'Weekend rate', step: '0.01', min: 0 },
  { name: 'extraGuestFee', label: 'Extra guest fee', step: '0.01', min: 0 },
  { name: 'minimumStay', label: 'Minimum stay', step: '1', min: 1 },
  { name: 'cleaningFee', label: 'Cleaning fee', step: '0.01', min: 0 },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900 placeholder:text-admin-muted';

function fieldNumber(form: FormData, name: string): number {
  const value = form.get(name);
  const parsed = typeof value === 'string' ? Number(value.trim()) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function mutationFromStayType(stayType: AdminStayType, form: FormData): StayTypeMutationRequest {
  return {
    name: stayType.name,
    slug: stayType.slug,
    siteType: stayType.siteType,
    description: stayType.description,
    amenities: stayType.amenities,
    baseRate: fieldNumber(form, 'baseRate'),
    weekendRate: fieldNumber(form, 'weekendRate'),
    extraGuestFee: fieldNumber(form, 'extraGuestFee'),
    minimumStay: fieldNumber(form, 'minimumStay'),
    cleaningFee: fieldNumber(form, 'cleaningFee'),
    active: stayType.active,
  };
}

export function RateEditorPanel({ stayTypes }: RateEditorPanelProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(stayTypes[0]?.id ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const selectedStayType = useMemo(
    () => stayTypes.find((stayType) => stayType.id === selectedId) ?? stayTypes[0],
    [selectedId, stayTypes],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStayType) return;
    setSubmitting(true);
    setError('');
    setMessage('');

    const payload = mutationFromStayType(selectedStayType, new FormData(event.currentTarget));
    try {
      const response = await fetch(`/api/admin/stay-types/${selectedStayType.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as StayTypeMutationResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to save rates.');
        return;
      }
      setMessage(result.message ?? 'Rates saved.');
      router.refresh();
    } catch {
      setError('Unable to reach the server.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!selectedStayType) {
    return (
      <div className="rounded-lg border border-dashed border-admin-border p-8 text-center">
        <p className="font-serif text-2xl text-forest-900">No stay types available</p>
        <p className="mt-2 text-sm text-admin-muted">Create a stay type before editing rates.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-admin-border bg-admin-bg p-3">
        <label className="block text-xs font-bold uppercase tracking-[0.12em] text-admin-muted">
          Stay type
          <select
            value={selectedStayType.id}
            onChange={(event) => {
              setSelectedId(event.target.value);
              setError('');
              setMessage('');
            }}
            className={inputClass}
          >
            {stayTypes.map((stayType) => (
              <option key={stayType.id} value={stayType.id}>
                {stayType.name}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-4 rounded-lg bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-admin-muted">
            Current plan
          </p>
          <p className="mt-2 font-serif text-2xl text-forest-900">{selectedStayType.name}</p>
          <p className="mt-1 text-sm text-admin-muted">
            {stayTypeLabels[selectedStayType.siteType]} · {selectedStayType.unitCount} unit
            {selectedStayType.unitCount === 1 ? '' : 's'}
          </p>
          <p className="mt-4 text-sm font-semibold text-forest-900">
            {currencyFormatter.format(selectedStayType.baseRate)} base ·{' '}
            {currencyFormatter.format(selectedStayType.weekendRate)} weekend
          </p>
        </div>
      </aside>
      <form
        key={selectedStayType.id}
        onSubmit={handleSubmit}
        className="rounded-lg border border-admin-border bg-white p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-admin-accent">
              Rate editor
            </p>
            <h3 className="mt-1 font-serif text-2xl text-forest-900">{selectedStayType.name}</h3>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-admin-bg px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-admin-muted">
            <BadgeDollarSign aria-hidden="true" className="size-3.5" />
            USD nightly
          </span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {rateFields.map((field) => (
            <label key={field.name} className="text-sm font-semibold text-forest-900">
              {field.label}
              <input
                name={field.name}
                type="number"
                min={field.min}
                step={field.step}
                required
                defaultValue={selectedStayType[field.name]}
                className={inputClass}
              />
            </label>
          ))}
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
        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-5 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-60"
          >
            {submitting ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Save aria-hidden="true" className="size-4" />
            )}
            Save Rates
          </button>
        </div>
      </form>
    </div>
  );
}
