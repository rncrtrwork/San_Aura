'use client';

import { LoaderCircle, Search, Send } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import type {
  PublicBookingAvailabilityResponse,
  PublicBookingRequest,
  PublicBookingResponse,
  PublicBookingSite,
  PublicBookingStayType,
} from '@/lib/publicBooking';
import { publicStartingRateLabel } from '@/lib/publicStays';
import { stayTypeLabels } from '@/lib/stayTypes';

type PublicBookingFormProps = {
  stayTypes: PublicBookingStayType[];
};

const inputClass =
  'mt-1.5 h-12 w-full rounded border border-line bg-white px-3 text-sm text-forest-900 placeholder:text-ink-700/50';

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function PublicBookingForm({ stayTypes }: PublicBookingFormProps) {
  const [stayTypeId, setStayTypeId] = useState(stayTypes[0]?.id ?? '');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [availableSites, setAvailableSites] = useState<PublicBookingSite[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const selectedStayType = useMemo(
    () => stayTypes.find((stayType) => stayType.id === stayTypeId) ?? null,
    [stayTypeId, stayTypes],
  );

  async function searchAvailability(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!selectedStayType) return;
    setSearching(true);
    setError('');
    setMessage('');
    setAvailableSites([]);
    setSelectedSiteId('');
    const form = new FormData(formEvent.currentTarget);
    const nextCheckIn = fieldValue(form, 'checkIn');
    const nextCheckOut = fieldValue(form, 'checkOut');
    const params = new URLSearchParams({
      checkIn: nextCheckIn,
      checkOut: nextCheckOut,
      siteType: selectedStayType.siteType,
    });

    try {
      const response = await fetch(`/api/book/availability?${params.toString()}`);
      const result = (await response.json()) as PublicBookingAvailabilityResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to search availability.');
        return;
      }
      setCheckIn(nextCheckIn);
      setCheckOut(nextCheckOut);
      setAvailableSites(result.sites ?? []);
      setMessage(
        result.sites?.length
          ? 'Choose an available site below to finish your request.'
          : 'No available sites matched those dates.',
      );
    } catch {
      setError('Unable to reach availability search. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  async function submitRequest(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    const form = new FormData(formEvent.currentTarget);
    const payload: PublicBookingRequest = {
      guestName: fieldValue(form, 'guestName'),
      guestEmail: fieldValue(form, 'guestEmail'),
      guestPhone: fieldValue(form, 'guestPhone'),
      stayTypeId,
      siteId: selectedSiteId,
      checkIn,
      checkOut,
      guestsCount: Number(fieldValue(form, 'guestsCount')),
    };

    try {
      const response = await fetch('/api/book/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as PublicBookingResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to submit booking request.');
        return;
      }
      formEvent.currentTarget.reset();
      setAvailableSites([]);
      setSelectedSiteId('');
      setMessage(result.message ?? 'Booking request received.');
    } catch {
      setError('Unable to reach booking request service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (stayTypes.length === 0) {
    return (
      <div className="rounded-[2rem] border border-line bg-[#fbfaf6] p-8 text-center shadow-card">
        <h2 className="font-serif text-3xl text-forest-900">Booking requests are coming soon</h2>
        <p className="mt-3 text-sm leading-6 text-ink-700">
          Active stay types need to be added before guests can search public availability.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <form
        onSubmit={searchAvailability}
        className="rounded-[2rem] border border-line bg-[#fbfaf6] p-7 shadow-card"
      >
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-700">
          Search availability
        </p>
        <div className="mt-5 grid gap-4">
          <label className="text-sm font-semibold text-forest-900">
            Stay type
            <select
              name="stayTypeId"
              value={stayTypeId}
              onChange={(event) => {
                setStayTypeId(event.target.value);
                setAvailableSites([]);
                setSelectedSiteId('');
              }}
              className={inputClass}
            >
              {stayTypes.map((stayType) => (
                <option key={stayType.id} value={stayType.id}>
                  {stayType.name} · {stayTypeLabels[stayType.siteType]}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-forest-900">
              Check-in
              <input
                name="checkIn"
                type="date"
                required
                value={checkIn}
                onChange={(event) => {
                  setCheckIn(event.target.value);
                  setAvailableSites([]);
                  setSelectedSiteId('');
                }}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold text-forest-900">
              Check-out
              <input
                name="checkOut"
                type="date"
                required
                value={checkOut}
                onChange={(event) => {
                  setCheckOut(event.target.value);
                  setAvailableSites([]);
                  setSelectedSiteId('');
                }}
                className={inputClass}
              />
            </label>
          </div>
          {selectedStayType ? (
            <p className="rounded-[1rem] bg-cream-alt p-4 text-sm font-semibold text-forest-900">
              {publicStartingRateLabel(selectedStayType.baseRate)} ·{' '}
              {selectedStayType.minimumStay} night minimum
            </p>
          ) : null}
          <button
            type="submit"
            disabled={searching}
            className="inline-flex h-12 w-fit items-center gap-2 rounded bg-forest-900 px-5 text-sm font-bold text-white hover:bg-forest-800 disabled:opacity-60"
          >
            {searching ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Search aria-hidden="true" className="size-4" />
            )}
            Search sites
          </button>
        </div>
      </form>

      <form
        onSubmit={submitRequest}
        className="rounded-[2rem] border border-line bg-[#fbfaf6] p-7 shadow-card"
      >
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-700">
          Reservation request
        </p>
        <div className="mt-5 grid gap-4">
          {availableSites.length > 0 ? (
            <fieldset>
              <legend className="text-sm font-semibold text-forest-900">Available sites</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {availableSites.map((site) => (
                  <label
                    key={site.id}
                    className="flex cursor-pointer items-center gap-3 rounded border border-line bg-white p-3 text-sm text-forest-900"
                  >
                    <input
                      type="radio"
                      name="siteId"
                      value={site.id}
                      checked={selectedSiteId === site.id}
                      onChange={() => setSelectedSiteId(site.id)}
                    />
                    <span>
                      <span className="block font-bold">{site.code}</span>
                      <span className="text-xs text-ink-700">{site.area}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="rounded-[1rem] bg-cream-alt p-4 text-sm text-ink-700">
              Search availability first, then select an open site.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-forest-900">
              Name
              <input name="guestName" required maxLength={120} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-forest-900">
              Email
              <input name="guestEmail" type="email" required maxLength={254} className={inputClass} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-forest-900">
              Phone
              <input name="guestPhone" required maxLength={30} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-forest-900">
              Guests
              <input
                name="guestsCount"
                type="number"
                min={1}
                max={100}
                defaultValue={2}
                required
                className={inputClass}
              />
            </label>
          </div>
          {message ? (
            <p role="status" className="text-sm font-semibold text-admin-success">
              {message}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="text-sm font-semibold text-admin-danger">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting || !selectedSiteId}
            className="inline-flex h-12 w-fit items-center gap-2 rounded bg-gold-600 px-5 text-sm font-bold text-white hover:bg-gold-700 disabled:opacity-60"
          >
            {submitting ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Send aria-hidden="true" className="size-4" />
            )}
            Submit request
          </button>
        </div>
      </form>
    </div>
  );
}
