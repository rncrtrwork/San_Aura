'use client';

import {
  BadgeDollarSign,
  BedDouble,
  LoaderCircle,
  Pencil,
  Plus,
  Power,
  Save,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  stayTypeLabels,
  stayTypeOptions,
  type AdminStayType,
  type StayTypeMutationRequest,
  type StayTypeMutationResponse,
  type StayTypeStatusUpdateResponse,
} from '@/lib/stayTypes';

type StayTypeCardsProps = {
  stayTypes: AdminStayType[];
};

type RateFieldName = 'baseRate' | 'weekendRate' | 'extraGuestFee' | 'cleaningFee';

type RateField = {
  name: RateFieldName;
  label: string;
  value: number;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900 placeholder:text-admin-muted';

function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function fieldNumber(form: FormData, name: string): number {
  const value = Number(fieldValue(form, name));
  return Number.isFinite(value) ? value : 0;
}

function amenityList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((amenity) => amenity.trim())
    .filter(Boolean);
}

function defaultFormValues(): StayTypeMutationRequest {
  return {
    name: '',
    slug: '',
    siteType: 'cabin',
    description: '',
    amenities: [],
    baseRate: 0,
    weekendRate: 0,
    extraGuestFee: 0,
    minimumStay: 1,
    cleaningFee: 0,
    active: true,
  };
}

function valuesFromStayType(stayType: AdminStayType): StayTypeMutationRequest {
  return {
    name: stayType.name,
    slug: stayType.slug,
    siteType: stayType.siteType,
    description: stayType.description,
    amenities: stayType.amenities,
    baseRate: stayType.baseRate,
    weekendRate: stayType.weekendRate,
    extraGuestFee: stayType.extraGuestFee,
    minimumStay: stayType.minimumStay,
    cleaningFee: stayType.cleaningFee,
    active: stayType.active,
  };
}

export function StayTypeCards({ stayTypes }: StayTypeCardsProps) {
  const [showCreateForm, setShowCreateForm] = useState(stayTypes.length === 0);

  if (stayTypes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-admin-border p-8 text-center">
          <p className="font-serif text-2xl text-forest-900">No stay types yet</p>
          <p className="mt-2 text-sm text-admin-muted">
            Add cabins, RV sites, or tent sites before publishing stay inventory.
          </p>
        </div>
        <StayTypeForm mode="create" initialValues={defaultFormValues()} onCancel={null} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowCreateForm((current) => !current)}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active"
        >
          {showCreateForm ? (
            <X aria-hidden="true" className="size-4" />
          ) : (
            <Plus aria-hidden="true" className="size-4" />
          )}
          {showCreateForm ? 'Close Form' : 'Add Stay Type'}
        </button>
      </div>
      {showCreateForm ? (
        <StayTypeForm
          mode="create"
          initialValues={defaultFormValues()}
          onCancel={() => setShowCreateForm(false)}
        />
      ) : null}
      {stayTypes.map((stayType) => (
        <StayTypeCard key={stayType.id} stayType={stayType} />
      ))}
    </div>
  );
}

function StayTypeCard({ stayType }: { stayType: AdminStayType }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState(stayType.active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function toggleActive() {
    const nextActive = !active;
    setSaving(true);
    setError('');
    setActive(nextActive);
    try {
      const response = await fetch(`/api/admin/stay-types/${stayType.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextActive }),
      });
      const result = (await response.json()) as StayTypeStatusUpdateResponse;
      if (!response.ok) {
        setActive(!nextActive);
        setError(result.message ?? 'Unable to update this stay type.');
        return;
      }
      router.refresh();
    } catch {
      setActive(!nextActive);
      setError('Unable to reach the server.');
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <StayTypeForm
        mode="edit"
        stayTypeId={stayType.id}
        initialValues={valuesFromStayType(stayType)}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <article className="rounded-lg border border-admin-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-2xl text-forest-900">{stayType.name}</h3>
            <span className="rounded-full bg-admin-muted/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-admin-muted">
              {stayTypeLabels[stayType.siteType]}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                active
                  ? 'bg-admin-success/10 text-admin-success'
                  : 'bg-admin-muted/10 text-admin-muted'
              }`}
            >
              {active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-admin-muted">
            {stayType.description || 'No guest-facing description has been added yet.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {stayType.amenities.length > 0 ? (
              stayType.amenities.slice(0, 8).map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1.5 rounded-full border border-admin-border px-3 py-1 text-xs font-semibold text-forest-900"
                >
                  <Sparkles aria-hidden="true" className="size-3 text-admin-accent" />
                  {amenity}
                </span>
              ))
            ) : (
              <span className="text-xs font-semibold text-admin-muted">No amenities listed</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-admin-border px-4 text-sm font-bold text-forest-900 hover:border-admin-accent hover:text-admin-accent"
          >
            <Pencil aria-hidden="true" className="size-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={toggleActive}
            disabled={saving}
            aria-pressed={active}
            className={`inline-flex h-11 min-w-36 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-colors disabled:opacity-60 ${
              active
                ? 'border border-admin-border bg-white text-forest-900 hover:border-admin-danger hover:text-admin-danger'
                : 'bg-admin-sidebar text-white hover:bg-admin-sidebar-active'
            }`}
          >
            {saving ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Power aria-hidden="true" className="size-4" />
            )}
            {active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
      <dl className="mt-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-lg bg-admin-bg px-4 py-3">
          <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-admin-muted">
            <Users aria-hidden="true" className="size-3.5" />
            Units
          </dt>
          <dd className="mt-1 text-lg font-bold text-forest-900">{stayType.unitCount}</dd>
        </div>
        <div className="rounded-lg bg-admin-bg px-4 py-3">
          <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-admin-muted">
            <BedDouble aria-hidden="true" className="size-3.5" />
            Minimum
          </dt>
          <dd className="mt-1 text-lg font-bold text-forest-900">
            {stayType.minimumStay} night{stayType.minimumStay === 1 ? '' : 's'}
          </dd>
        </div>
        <div className="rounded-lg bg-admin-bg px-4 py-3">
          <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-admin-muted">
            <BadgeDollarSign aria-hidden="true" className="size-3.5" />
            Base
          </dt>
          <dd className="mt-1 text-lg font-bold text-forest-900">
            {formatCurrency(stayType.baseRate)}
          </dd>
        </div>
        <div className="rounded-lg bg-admin-bg px-4 py-3">
          <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-admin-muted">
            <BadgeDollarSign aria-hidden="true" className="size-3.5" />
            Weekend
          </dt>
          <dd className="mt-1 text-lg font-bold text-forest-900">
            {formatCurrency(stayType.weekendRate)}
          </dd>
        </div>
      </dl>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
    </article>
  );
}

function StayTypeForm({
  mode,
  stayTypeId,
  initialValues,
  onCancel,
}: {
  mode: 'create' | 'edit';
  stayTypeId?: string;
  initialValues: StayTypeMutationRequest;
  onCancel: (() => void) | null;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const payload: StayTypeMutationRequest = {
      name: fieldValue(form, 'name'),
      slug: fieldValue(form, 'slug'),
      siteType: fieldValue(form, 'siteType') as StayTypeMutationRequest['siteType'],
      description: fieldValue(form, 'description'),
      amenities: amenityList(fieldValue(form, 'amenities')),
      baseRate: fieldNumber(form, 'baseRate'),
      weekendRate: fieldNumber(form, 'weekendRate'),
      extraGuestFee: fieldNumber(form, 'extraGuestFee'),
      minimumStay: fieldNumber(form, 'minimumStay'),
      cleaningFee: fieldNumber(form, 'cleaningFee'),
      active: form.get('active') === 'on',
    };

    try {
      const endpoint =
        mode === 'create' ? '/api/admin/stay-types' : `/api/admin/stay-types/${stayTypeId ?? ''}`;
      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as StayTypeMutationResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to save this stay type.');
        return;
      }
      router.refresh();
      onCancel?.();
    } catch {
      setError('Unable to reach the server.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-admin-border bg-admin-bg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-serif text-2xl text-forest-900">
          {mode === 'create' ? 'Add Stay Type' : 'Edit Stay Type'}
        </h3>
        <label className="inline-flex items-center gap-2 text-sm font-bold text-forest-900">
          <input
            name="active"
            type="checkbox"
            defaultChecked={initialValues.active}
            className="size-4 rounded border-admin-border text-admin-accent"
          />
          Active
        </label>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-forest-900">
          Name
          <input
            name="name"
            required
            maxLength={100}
            defaultValue={initialValues.name}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Slug
          <input
            name="slug"
            maxLength={100}
            defaultValue={initialValues.slug}
            placeholder="Generated from name when blank"
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Site type
          <select
            name="siteType"
            required
            defaultValue={initialValues.siteType}
            className={inputClass}
          >
            {stayTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Minimum stay
          <input
            name="minimumStay"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={initialValues.minimumStay}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900 md:col-span-2">
          Description
          <textarea
            name="description"
            maxLength={2000}
            defaultValue={initialValues.description}
            className="mt-1.5 min-h-24 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900 placeholder:text-admin-muted"
          />
        </label>
        <label className="text-sm font-semibold text-forest-900 md:col-span-2">
          Amenities
          <textarea
            name="amenities"
            defaultValue={initialValues.amenities.join('\n')}
            placeholder="One amenity per line or comma separated"
            className="mt-1.5 min-h-24 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900 placeholder:text-admin-muted"
          />
        </label>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            { name: 'baseRate', label: 'Base rate', value: initialValues.baseRate },
            { name: 'weekendRate', label: 'Weekend rate', value: initialValues.weekendRate },
            {
              name: 'extraGuestFee',
              label: 'Extra guest fee',
              value: initialValues.extraGuestFee,
            },
            { name: 'cleaningFee', label: 'Cleaning fee', value: initialValues.cleaningFee },
          ] satisfies RateField[]
        ).map((field) => (
          <label key={field.name} className="text-sm font-semibold text-forest-900">
            {field.label}
            <input
              name={field.name}
              type="number"
              min={0}
              step="0.01"
              required
              defaultValue={field.value}
              className={inputClass}
            />
          </label>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-4 text-sm font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center rounded-lg border border-admin-border px-4 text-sm font-bold text-admin-muted hover:text-forest-900"
          >
            Cancel
          </button>
        ) : null}
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
          {mode === 'create' ? 'Create Stay Type' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
