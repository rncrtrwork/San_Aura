'use client';

import { CalendarRange, LoaderCircle, Pencil, Plus, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { AdminSeason, SeasonMutationRequest, SeasonMutationResponse } from '@/lib/seasons';
import { stayTypeLabels, type AdminStayType } from '@/lib/stayTypes';

type ManageSeasonsFlowProps = {
  seasons: AdminSeason[];
  stayTypes: AdminStayType[];
};

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900 placeholder:text-admin-muted';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function todayInputValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function nextMonthInputValue(): string {
  const now = new Date();
  now.setMonth(now.getMonth() + 1);
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function fieldNumber(form: FormData, name: string): number {
  const value = Number(fieldValue(form, name));
  return Number.isFinite(value) ? value : 0;
}

function overrideForSeason(season: AdminSeason, stayTypeId: string) {
  return season.rateOverrides.find((override) => override.stayTypeId === stayTypeId);
}

function defaultSeason(stayTypes: AdminStayType[]): SeasonMutationRequest {
  return {
    name: '',
    startsOn: todayInputValue(),
    endsOn: nextMonthInputValue(),
    active: true,
    rateOverrides: stayTypes.map((stayType) => ({
      stayTypeId: stayType.id,
      baseRate: stayType.baseRate,
      weekendRate: stayType.weekendRate,
    })),
  };
}

function valuesFromSeason(season: AdminSeason, stayTypes: AdminStayType[]): SeasonMutationRequest {
  return {
    name: season.name,
    startsOn: season.startsOn,
    endsOn: season.endsOn,
    active: season.active,
    rateOverrides: stayTypes.map((stayType) => {
      const override = overrideForSeason(season, stayType.id);
      return {
        stayTypeId: stayType.id,
        baseRate: override?.baseRate ?? stayType.baseRate,
        weekendRate: override?.weekendRate ?? stayType.weekendRate,
      };
    }),
  };
}

function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00.000Z`));
}

function seasonOverrideSummary(season: AdminSeason, stayTypes: AdminStayType[]): string {
  const activeOverrides = season.rateOverrides.filter((override) =>
    stayTypes.some((stayType) => stayType.id === override.stayTypeId),
  );
  if (activeOverrides.length === 0) return 'No rate overrides';
  const lowestRate = Math.min(...activeOverrides.map((override) => override.baseRate));
  return `${activeOverrides.length} override${activeOverrides.length === 1 ? '' : 's'} from ${currencyFormatter.format(lowestRate)}`;
}

export function ManageSeasonsFlow({ seasons, stayTypes }: ManageSeasonsFlowProps) {
  const [showCreateForm, setShowCreateForm] = useState(seasons.length === 0);

  if (stayTypes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-admin-border p-8 text-center">
        <p className="font-serif text-2xl text-forest-900">Create stay types first</p>
        <p className="mt-2 text-sm text-admin-muted">
          Seasons need at least one stay type for rate overrides.
        </p>
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
          {showCreateForm ? 'Close Form' : 'Add Season'}
        </button>
      </div>
      {showCreateForm ? (
        <SeasonForm
          mode="create"
          initialValues={defaultSeason(stayTypes)}
          stayTypes={stayTypes}
          onCancel={() => setShowCreateForm(false)}
        />
      ) : null}
      {seasons.length === 0 ? (
        <div className="rounded-lg border border-dashed border-admin-border p-8 text-center">
          <p className="font-serif text-2xl text-forest-900">No seasons yet</p>
          <p className="mt-2 text-sm text-admin-muted">
            Add a date range to override standard weekday and weekend pricing.
          </p>
        </div>
      ) : (
        seasons.map((season) => (
          <SeasonCard key={season.id} season={season} stayTypes={stayTypes} />
        ))
      )}
    </div>
  );
}

function SeasonCard({ season, stayTypes }: { season: AdminSeason; stayTypes: AdminStayType[] }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <SeasonForm
        mode="edit"
        seasonId={season.id}
        initialValues={valuesFromSeason(season, stayTypes)}
        stayTypes={stayTypes}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <article className="rounded-lg border border-admin-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-2xl text-forest-900">{season.name}</h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                season.active
                  ? 'bg-admin-success/10 text-admin-success'
                  : 'bg-admin-muted/10 text-admin-muted'
              }`}
            >
              {season.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-admin-muted">
            <CalendarRange aria-hidden="true" className="size-4" />
            {formatDate(season.startsOn)} to {formatDate(season.endsOn)}
          </p>
          <p className="mt-2 text-sm text-admin-muted">
            {seasonOverrideSummary(season, stayTypes)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-admin-border px-4 text-sm font-bold text-forest-900 hover:border-admin-accent hover:text-admin-accent"
        >
          <Pencil aria-hidden="true" className="size-4" />
          Edit
        </button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {stayTypes.map((stayType) => {
          const override = overrideForSeason(season, stayType.id);
          return (
            <div key={stayType.id} className="rounded-lg bg-admin-bg px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-admin-muted">
                {stayTypeLabels[stayType.siteType]}
              </p>
              <p className="mt-1 text-sm font-bold text-forest-900">
                {currencyFormatter.format(override?.baseRate ?? stayType.baseRate)} base
              </p>
              <p className="text-xs font-semibold text-admin-muted">
                {currencyFormatter.format(override?.weekendRate ?? stayType.weekendRate)} weekend
              </p>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function SeasonForm({
  mode,
  seasonId,
  initialValues,
  stayTypes,
  onCancel,
}: {
  mode: 'create' | 'edit';
  seasonId?: string;
  initialValues: SeasonMutationRequest;
  stayTypes: AdminStayType[];
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
    const payload: SeasonMutationRequest = {
      name: fieldValue(form, 'name'),
      startsOn: fieldValue(form, 'startsOn'),
      endsOn: fieldValue(form, 'endsOn'),
      active: form.get('active') === 'on',
      rateOverrides: stayTypes.map((stayType) => ({
        stayTypeId: stayType.id,
        baseRate: fieldNumber(form, `baseRate:${stayType.id}`),
        weekendRate: fieldNumber(form, `weekendRate:${stayType.id}`),
      })),
    };

    try {
      const endpoint =
        mode === 'create' ? '/api/admin/seasons' : `/api/admin/seasons/${seasonId ?? ''}`;
      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as SeasonMutationResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to save this season.');
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
          {mode === 'create' ? 'Add Season' : 'Edit Season'}
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
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="text-sm font-semibold text-forest-900">
          Season name
          <input
            name="name"
            required
            maxLength={100}
            defaultValue={initialValues.name}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Start date
          <input
            name="startsOn"
            type="date"
            required
            defaultValue={initialValues.startsOn}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          End date
          <input
            name="endsOn"
            type="date"
            required
            defaultValue={initialValues.endsOn}
            className={inputClass}
          />
        </label>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full divide-y divide-admin-border text-sm">
          <thead>
            <tr className="text-left text-xs font-bold uppercase tracking-[0.12em] text-admin-muted">
              <th className="py-3 pr-4">Stay type</th>
              <th className="px-4 py-3">Base override</th>
              <th className="px-4 py-3">Weekend override</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {stayTypes.map((stayType) => {
              const override = initialValues.rateOverrides.find(
                (item) => item.stayTypeId === stayType.id,
              );
              return (
                <tr key={stayType.id}>
                  <td className="py-3 pr-4 font-semibold text-forest-900">{stayType.name}</td>
                  <td className="px-4 py-3">
                    <input
                      name={`baseRate:${stayType.id}`}
                      type="number"
                      min={0}
                      step="0.01"
                      required
                      defaultValue={override?.baseRate ?? stayType.baseRate}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      name={`weekendRate:${stayType.id}`}
                      type="number"
                      min={0}
                      step="0.01"
                      required
                      defaultValue={override?.weekendRate ?? stayType.weekendRate}
                      className={inputClass}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
          Save Season
        </button>
      </div>
    </form>
  );
}
