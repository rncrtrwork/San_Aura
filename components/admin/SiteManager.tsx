'use client';

import { LoaderCircle, MapPin, Pencil, Plus, Power, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  siteStatusLabels,
  siteStatusOptions,
  siteTypeLabels,
  siteTypeOptions,
  type AdminSite,
  type SiteMutationRequest,
  type SiteMutationResponse,
} from '@/lib/adminSites';
import type { SiteStatus, SiteType } from '@/models/Site';

type SiteManagerProps = {
  sites: AdminSite[];
};

type SiteFormProps = {
  mode: 'create' | 'edit';
  initialValues: SiteMutationRequest;
  siteId?: string;
  onCancel: (() => void) | null;
};

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900 placeholder:text-admin-muted';

const textareaClass =
  'mt-1.5 min-h-24 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900 placeholder:text-admin-muted';

const statusBadgeStyles: Record<SiteStatus, string> = {
  available: 'bg-admin-success/10 text-admin-success',
  occupied: 'bg-admin-accent/10 text-admin-accent',
  maintenance: 'bg-admin-danger/10 text-admin-danger',
  blocked: 'bg-admin-muted/10 text-admin-muted',
};

function stringList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function optionalNumber(value: string): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function defaultFormValues(): SiteMutationRequest {
  return {
    code: '',
    type: 'rv',
    area: '',
    amenities: [],
    status: 'available',
    maintenanceNote: '',
    length: null,
    hookups: [],
    mapPosition: null,
    active: true,
  };
}

function valuesFromSite(site: AdminSite): SiteMutationRequest {
  return {
    code: site.code,
    type: site.type,
    area: site.area,
    amenities: site.amenities,
    status: site.status,
    maintenanceNote: site.maintenanceNote,
    length: site.length,
    hookups: site.hookups,
    mapPosition: site.mapPosition,
    active: site.active,
  };
}

export function SiteManager({ sites }: SiteManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(sites.length === 0);
  const activeSiteCount = sites.filter((site) => site.active).length;

  return (
    <section className="admin-card p-5 sm:p-6" aria-labelledby="site-manager-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-accent">
            Site inventory
          </p>
          <h2 id="site-manager-heading" className="mt-1 font-serif text-3xl text-forest-900">
            Map Sites
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">
            Add each cabin, RV lot, tent area, or rental code here. Active sites appear in the map
            editor&apos;s marker dropdown.
          </p>
        </div>
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
          {showCreateForm ? 'Close Form' : 'Add Site'}
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Total sites" value={sites.length} />
        <SummaryCard label="Active markers" value={activeSiteCount} />
        <SummaryCard label="Inactive sites" value={sites.length - activeSiteCount} />
      </div>

      {showCreateForm ? (
        <div className="mt-5">
          <SiteForm
            mode="create"
            initialValues={defaultFormValues()}
            onCancel={sites.length === 0 ? null : () => setShowCreateForm(false)}
          />
        </div>
      ) : null}

      {sites.length > 0 ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-admin-border p-8 text-center">
          <MapPin aria-hidden="true" className="mx-auto size-8 text-admin-accent" />
          <p className="mt-3 font-serif text-2xl text-forest-900">No sites yet</p>
          <p className="mt-2 text-sm text-admin-muted">
            Create the first site above, then use Edit Map to place its marker.
          </p>
        </div>
      )}
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-admin-border bg-admin-bg px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-admin-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl text-forest-900">{value}</p>
    </article>
  );
}

function SiteCard({ site }: { site: AdminSite }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState(site.active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function toggleActive() {
    const nextActive = !active;
    setSaving(true);
    setError('');
    setActive(nextActive);
    try {
      const response = await fetch(`/api/admin/sites/${site.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextActive }),
      });
      const result = (await response.json()) as SiteMutationResponse;
      if (!response.ok) {
        setActive(!nextActive);
        setError(result.message ?? 'Unable to update this site.');
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
      <SiteForm
        mode="edit"
        siteId={site.id}
        initialValues={valuesFromSite(site)}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <article className="rounded-xl border border-admin-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            {site.area}
          </p>
          <h3 className="mt-1 font-serif text-3xl text-forest-900">{site.code}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-admin-sidebar/10 px-3 py-1 text-xs font-bold text-admin-sidebar">
              {siteTypeLabels[site.type]}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeStyles[site.status]}`}
            >
              {siteStatusLabels[site.status]}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                active
                  ? 'bg-admin-success/10 text-admin-success'
                  : 'bg-admin-muted/10 text-admin-muted'
              }`}
            >
              {active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-admin-border px-3 text-sm font-bold text-forest-900 hover:border-admin-accent hover:text-admin-accent"
          >
            <Pencil aria-hidden="true" className="size-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={toggleActive}
            disabled={saving}
            className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold disabled:opacity-60 ${
              active
                ? 'border border-admin-border text-forest-900 hover:border-admin-danger hover:text-admin-danger'
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
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <Detail label="Length" value={site.length === null ? 'Not set' : `${site.length} ft`} />
        <Detail
          label="Position"
          value={site.mapPosition ? `${site.mapPosition.x}, ${site.mapPosition.y}` : 'Not placed'}
        />
        <Detail
          label="Hookups"
          value={site.hookups.length > 0 ? site.hookups.join(', ') : 'None'}
        />
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        {site.amenities.length > 0 ? (
          site.amenities.map((amenity) => (
            <span
              key={amenity}
              className="rounded-full border border-admin-border px-3 py-1 text-xs font-semibold text-admin-muted"
            >
              {amenity}
            </span>
          ))
        ) : (
          <span className="text-sm text-admin-muted">No amenities recorded.</span>
        )}
      </div>
      {site.maintenanceNote ? (
        <p className="mt-4 rounded-lg bg-admin-bg p-3 text-sm text-admin-muted">
          {site.maintenanceNote}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-admin-bg px-3 py-2">
      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-admin-muted">{label}</dt>
      <dd className="mt-1 font-semibold text-forest-900">{value}</dd>
    </div>
  );
}

function SiteForm({ mode, initialValues, siteId, onCancel }: SiteFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const x = optionalNumber(fieldValue(form, 'mapX'));
    const y = optionalNumber(fieldValue(form, 'mapY'));
    const payload: SiteMutationRequest = {
      code: fieldValue(form, 'code'),
      type: fieldValue(form, 'type') as SiteType,
      area: fieldValue(form, 'area'),
      amenities: stringList(fieldValue(form, 'amenities')),
      status: fieldValue(form, 'status') as SiteStatus,
      maintenanceNote: fieldValue(form, 'maintenanceNote'),
      length: optionalNumber(fieldValue(form, 'length')),
      hookups: stringList(fieldValue(form, 'hookups')),
      mapPosition: x === null || y === null ? null : { x, y },
      active: form.get('active') === 'on',
    };

    try {
      const endpoint = mode === 'create' ? '/api/admin/sites' : `/api/admin/sites/${siteId ?? ''}`;
      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as SiteMutationResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to save this site.');
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
    <form onSubmit={handleSubmit} className="rounded-xl border border-admin-border bg-admin-bg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-serif text-2xl text-forest-900">
          {mode === 'create' ? 'Add Site' : 'Edit Site'}
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
          Site code
          <input
            name="code"
            required
            maxLength={40}
            defaultValue={initialValues.code}
            placeholder="Example: 42, MA, Queen Mary"
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Area
          <input
            name="area"
            required
            maxLength={100}
            defaultValue={initialValues.area}
            placeholder="Example: Leg View, Tent City, Central Park"
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Type
          <select name="type" required defaultValue={initialValues.type} className={inputClass}>
            {siteTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Status
          <select name="status" required defaultValue={initialValues.status} className={inputClass}>
            {siteStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Length in feet
          <input
            name="length"
            type="number"
            min={0}
            step="0.01"
            defaultValue={initialValues.length ?? ''}
            placeholder="Optional"
            className={inputClass}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-forest-900">
            Map X %
            <input
              name="mapX"
              type="number"
              min={0}
              max={100}
              step="0.01"
              defaultValue={initialValues.mapPosition?.x ?? ''}
              placeholder="Optional"
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Map Y %
            <input
              name="mapY"
              type="number"
              min={0}
              max={100}
              step="0.01"
              defaultValue={initialValues.mapPosition?.y ?? ''}
              placeholder="Optional"
              className={inputClass}
            />
          </label>
        </div>
        <label className="text-sm font-semibold text-forest-900 md:col-span-2">
          Hookups
          <textarea
            name="hookups"
            defaultValue={initialValues.hookups.join('\n')}
            placeholder="One per line or comma separated"
            className={textareaClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900 md:col-span-2">
          Amenities
          <textarea
            name="amenities"
            defaultValue={initialValues.amenities.join('\n')}
            placeholder="One per line or comma separated"
            className={textareaClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900 md:col-span-2">
          Maintenance note
          <textarea
            name="maintenanceNote"
            maxLength={2000}
            defaultValue={initialValues.maintenanceNote}
            className={textareaClass}
          />
        </label>
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
          {mode === 'create' ? 'Create Site' : 'Save Site'}
        </button>
      </div>
    </form>
  );
}
