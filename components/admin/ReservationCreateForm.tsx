'use client';

import { LoaderCircle, Search, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type {
  ReservationCreateRequest,
  ReservationCreateResponse,
  ReservationFormSite,
  ReservationFormStayType,
  ReservationOwnerSearchItem,
  ReservationOwnerSearchResponse,
} from '@/lib/reservationForms';

type ReservationCreateFormProps = {
  stayTypes: ReservationFormStayType[];
  sites: ReservationFormSite[];
};

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900';

function dateValue(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function ReservationCreateForm({ stayTypes, sites }: ReservationCreateFormProps) {
  const router = useRouter();
  const [ownerMode, setOwnerMode] = useState<'existing' | 'newGuest'>('existing');
  const [ownerQuery, setOwnerQuery] = useState('');
  const [ownerResults, setOwnerResults] = useState<ReservationOwnerSearchItem[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<ReservationOwnerSearchItem | null>(null);
  const [searching, setSearching] = useState(false);
  const [stayTypeId, setStayTypeId] = useState(stayTypes[0]?.id ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const selectedStayType = stayTypes.find((stayType) => stayType.id === stayTypeId);
  const eligibleSites = useMemo(
    () => sites.filter((site) => site.type === selectedStayType?.siteType),
    [selectedStayType?.siteType, sites],
  );

  useEffect(() => {
    if (ownerMode !== 'existing' || ownerQuery.trim().length < 2 || selectedOwner) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `/api/admin/reservations/owners?q=${encodeURIComponent(ownerQuery)}`,
          { signal: controller.signal },
        );
        const result = (await response.json()) as ReservationOwnerSearchResponse;
        setOwnerResults(response.ok ? result.results : []);
      } catch {
        if (!controller.signal.aborted) setOwnerResults([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [ownerMode, ownerQuery, selectedOwner]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (ownerMode === 'existing' && !selectedOwner) {
      setError('Select an existing member or guest.');
      return;
    }
    const form = new FormData(event.currentTarget);
    const payload: ReservationCreateRequest = {
      ownerMode,
      ownerType: selectedOwner?.entityType ?? 'Guest',
      ownerId: selectedOwner?.entityId ?? '',
      guestName: fieldValue(form, 'guestName'),
      guestEmail: fieldValue(form, 'guestEmail'),
      guestPhone: fieldValue(form, 'guestPhone'),
      stayTypeId,
      siteId: fieldValue(form, 'siteId'),
      checkIn: fieldValue(form, 'checkIn'),
      checkOut: fieldValue(form, 'checkOut'),
      guestsCount: Number(fieldValue(form, 'guestsCount')),
    };
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ReservationCreateResponse;
      if (!response.ok || !result.id) {
        setError(result.message ?? 'Unable to create the reservation.');
        return;
      }
      router.push(`/admin/reservations?reservation=${result.id}`);
      router.refresh();
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="admin-card p-5 sm:p-6">
        <h2 className="font-serif text-2xl text-forest-900">Guest or Member</h2>
        <div className="mt-4 flex gap-2">
          {(['existing', 'newGuest'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setOwnerMode(mode);
                setError('');
              }}
              className={`rounded-lg px-4 py-2 text-sm font-bold ${
                ownerMode === mode
                  ? 'bg-admin-sidebar text-white'
                  : 'border border-admin-border text-forest-900'
              }`}
            >
              {mode === 'existing' ? 'Find existing' : 'Create guest'}
            </button>
          ))}
        </div>
        {ownerMode === 'existing' ? (
          <div className="relative mt-4 max-w-xl">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-3.5 size-4 text-admin-muted"
            />
            <input
              type="search"
              value={selectedOwner ? selectedOwner.name : ownerQuery}
              onChange={(event) => {
                setSelectedOwner(null);
                setOwnerQuery(event.target.value);
                if (event.target.value.trim().length < 2) setOwnerResults([]);
              }}
              placeholder="Search name, email, or phone"
              className="h-11 w-full rounded-lg border border-admin-border bg-white pl-10 pr-10 text-sm text-forest-900"
            />
            {searching ? (
              <LoaderCircle
                aria-hidden="true"
                className="absolute right-3 top-3.5 size-4 animate-spin text-admin-muted"
              />
            ) : null}
            {!selectedOwner && ownerQuery.trim().length >= 2 && !searching ? (
              <ul className="absolute z-20 mt-2 w-full divide-y divide-admin-border overflow-hidden rounded-lg border border-admin-border bg-white shadow-card">
                {ownerResults.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-admin-muted">No matching records.</li>
                ) : (
                  ownerResults.map((owner) => (
                    <li key={`${owner.entityType}:${owner.entityId}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOwner(owner);
                          setOwnerResults([]);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-admin-canvas"
                      >
                        <span className="block text-sm font-semibold text-forest-900">
                          {owner.name}
                        </span>
                        <span className="text-xs text-admin-muted">
                          {owner.entityType} · {owner.subtitle}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="text-sm font-semibold text-forest-900">
              Name
              <input name="guestName" required maxLength={120} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-forest-900">
              Email
              <input name="guestEmail" type="email" maxLength={254} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-forest-900">
              Phone
              <input name="guestPhone" required maxLength={30} className={inputClass} />
            </label>
          </div>
        )}
      </section>

      <section className="admin-card p-5 sm:p-6">
        <h2 className="font-serif text-2xl text-forest-900">Stay Details</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="text-sm font-semibold text-forest-900">
            Stay type
            <select
              value={stayTypeId}
              onChange={(event) => setStayTypeId(event.target.value)}
              required
              className={inputClass}
            >
              {stayTypes.map((stayType) => (
                <option key={stayType.id} value={stayType.id}>
                  {stayType.name} · {stayType.minimumStay} night min
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Site
            <select name="siteId" required className={inputClass}>
              {eligibleSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.code} · {site.area}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Check-in
            <input
              name="checkIn"
              type="date"
              required
              defaultValue={dateValue(0)}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Check-out
            <input
              name="checkOut"
              type="date"
              required
              defaultValue={dateValue(1)}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Guests
            <input
              name="guestsCount"
              type="number"
              min={1}
              max={100}
              defaultValue={1}
              required
              className={inputClass}
            />
          </label>
        </div>
        {eligibleSites.length === 0 ? (
          <p className="mt-3 text-sm font-semibold text-admin-danger">
            No active sites match this stay type.
          </p>
        ) : null}
      </section>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-admin-danger/30 bg-red-50 px-4 py-3 text-sm font-semibold text-admin-danger"
        >
          {error}
        </p>
      ) : null}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !stayTypeId || eligibleSites.length === 0}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-5 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-60"
        >
          {submitting ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <UserPlus aria-hidden="true" className="size-4" />
          )}
          {submitting ? 'Creating…' : 'Create Reservation'}
        </button>
      </div>
    </form>
  );
}
