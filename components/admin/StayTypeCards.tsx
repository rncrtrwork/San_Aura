'use client';

import { BadgeDollarSign, BedDouble, LoaderCircle, Power, Sparkles, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { stayTypeLabels, type AdminStayType } from '@/lib/stayTypes';
import type { StayTypeStatusUpdateResponse } from '@/lib/stayTypes';

type StayTypeCardsProps = {
  stayTypes: AdminStayType[];
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function StayTypeCards({ stayTypes }: StayTypeCardsProps) {
  if (stayTypes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-admin-border p-8 text-center">
        <p className="font-serif text-2xl text-forest-900">No stay types yet</p>
        <p className="mt-2 text-sm text-admin-muted">
          Add cabins, RV sites, or tent sites before publishing stay inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stayTypes.map((stayType) => (
        <StayTypeCard key={stayType.id} stayType={stayType} />
      ))}
    </div>
  );
}

function StayTypeCard({ stayType }: { stayType: AdminStayType }) {
  const router = useRouter();
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
