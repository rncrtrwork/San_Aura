'use client';

import { ExternalLink, LoaderCircle, Pencil, Plus, Power, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  addonTypeLabels,
  addonTypeOptions,
  type AddonMutationRequest,
  type AddonMutationResponse,
  type AdminAddon,
} from '@/lib/addons';

type AddonsTableProps = {
  addons: AdminAddon[];
};

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900 placeholder:text-admin-muted';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function fieldNumber(form: FormData, name: string): number {
  const parsed = Number(fieldValue(form, name));
  return Number.isFinite(parsed) ? parsed : 0;
}

function defaultAddon(): AddonMutationRequest {
  return {
    name: '',
    description: '',
    type: 'optional',
    price: 0,
    partnerUrl: '',
    active: true,
  };
}

function valuesFromAddon(addon: AdminAddon): AddonMutationRequest {
  return {
    name: addon.name,
    description: addon.description,
    type: addon.type,
    price: addon.price,
    partnerUrl: addon.partnerUrl,
    active: addon.active,
  };
}

export function AddonsTable({ addons }: AddonsTableProps) {
  const [showCreateForm, setShowCreateForm] = useState(addons.length === 0);

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
          {showCreateForm ? 'Close Form' : 'Add Add-on'}
        </button>
      </div>
      {showCreateForm ? (
        <AddonForm
          mode="create"
          initialValues={defaultAddon()}
          onCancel={() => setShowCreateForm(false)}
        />
      ) : null}
      {addons.length === 0 ? (
        <div className="rounded-lg border border-dashed border-admin-border p-8 text-center">
          <p className="font-serif text-2xl text-forest-900">No add-ons yet</p>
          <p className="mt-2 text-sm text-admin-muted">
            Add rentals, services, or partner experiences guests can choose during booking.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-admin-border bg-white">
          <table className="min-w-full divide-y divide-admin-border text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-[0.12em] text-admin-muted">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {addons.map((addon) => (
                <AddonRow key={addon.id} addon={addon} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AddonRow({ addon }: { addon: AdminAddon }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState(addon.active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function toggleActive() {
    const nextActive = !active;
    setSaving(true);
    setError('');
    setActive(nextActive);
    try {
      const response = await fetch(`/api/admin/addons/${addon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextActive }),
      });
      const result = (await response.json()) as AddonMutationResponse;
      if (!response.ok) {
        setActive(!nextActive);
        setError(result.message ?? 'Unable to update this add-on.');
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
      <tr>
        <td colSpan={6} className="bg-admin-bg p-4">
          <AddonForm
            mode="edit"
            addonId={addon.id}
            initialValues={valuesFromAddon(addon)}
            onCancel={() => setEditing(false)}
          />
        </td>
      </tr>
    );
  }

  return (
    <tr className="align-top">
      <td className="px-4 py-4 font-bold text-forest-900">{addon.name}</td>
      <td className="max-w-md px-4 py-4 text-admin-muted">
        <p className="line-clamp-2">{addon.description || 'No description added.'}</p>
        {addon.partnerUrl ? (
          <a
            href={addon.partnerUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-admin-accent"
          >
            Partner link
            <ExternalLink aria-hidden="true" className="size-3" />
          </a>
        ) : null}
      </td>
      <td className="px-4 py-4 font-semibold text-forest-900">{addonTypeLabels[addon.type]}</td>
      <td className="px-4 py-4 font-bold text-forest-900">
        {currencyFormatter.format(addon.price)}
      </td>
      <td className="px-4 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
            active ? 'bg-admin-success/10 text-admin-success' : 'bg-admin-muted/10 text-admin-muted'
          }`}
        >
          {active ? 'Active' : 'Inactive'}
        </span>
        {error ? (
          <p role="alert" className="mt-2 text-xs font-semibold text-admin-danger">
            {error}
          </p>
        ) : null}
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-admin-border px-3 text-xs font-bold text-forest-900 hover:border-admin-accent hover:text-admin-accent"
          >
            <Pencil aria-hidden="true" className="size-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={toggleActive}
            disabled={saving}
            aria-pressed={active}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-admin-border px-3 text-xs font-bold text-admin-muted hover:text-forest-900 disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
            ) : (
              <Power aria-hidden="true" className="size-3.5" />
            )}
            {active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </td>
    </tr>
  );
}

function AddonForm({
  mode,
  addonId,
  initialValues,
  onCancel,
}: {
  mode: 'create' | 'edit';
  addonId?: string;
  initialValues: AddonMutationRequest;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const payload: AddonMutationRequest = {
      name: fieldValue(form, 'name'),
      description: fieldValue(form, 'description'),
      type: fieldValue(form, 'type') as AddonMutationRequest['type'],
      price: fieldNumber(form, 'price'),
      partnerUrl: fieldValue(form, 'partnerUrl'),
      active: form.get('active') === 'on',
    };

    try {
      const endpoint =
        mode === 'create' ? '/api/admin/addons' : `/api/admin/addons/${addonId ?? ''}`;
      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as AddonMutationResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to save this add-on.');
        return;
      }
      router.refresh();
      onCancel();
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
          {mode === 'create' ? 'Add Add-on' : 'Edit Add-on'}
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
            maxLength={120}
            defaultValue={initialValues.name}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Type
          <select name="type" required defaultValue={initialValues.type} className={inputClass}>
            {addonTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Price
          <input
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={initialValues.price}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Partner URL
          <input
            name="partnerUrl"
            type="url"
            maxLength={2000}
            defaultValue={initialValues.partnerUrl}
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
      </div>
      {error ? (
        <p role="alert" className="mt-4 text-sm font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center rounded-lg border border-admin-border px-4 text-sm font-bold text-admin-muted hover:text-forest-900"
        >
          Cancel
        </button>
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
          Save Add-on
        </button>
      </div>
    </form>
  );
}
