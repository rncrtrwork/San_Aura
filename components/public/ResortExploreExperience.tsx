'use client';

import { CalendarDays, LoaderCircle, MapPin, Send, X } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import type {
  PublicBookingAvailabilityResponse,
  PublicBookingRequest,
  PublicBookingResponse,
  PublicBookingSite,
  PublicBookingStayType,
} from '@/lib/publicBooking';
import { PUBLIC_SITE_STATUS_LABELS, type PublicMapSite } from '@/lib/publicMap';
import { publicStartingRateLabel } from '@/lib/publicStays';
import { stayTypeLabels } from '@/lib/stayTypes';
import type { SiteStatus, SiteType } from '@/models/Site';

type ResortExploreExperienceProps = {
  sites: PublicMapSite[];
  stayTypes: PublicBookingStayType[];
};

type SiteAvailabilityState = 'available' | 'unavailable' | 'not-searched';

const mapImageSrc = '/images/resort-map.jpg';

const statusStyles: Record<SiteStatus, string> = {
  available: 'bg-emerald-700',
  occupied: 'bg-amber-600',
  maintenance: 'bg-red-700',
  blocked: 'bg-stone-500',
};

const selectedRing =
  'scale-125 ring-4 ring-gold-600 ring-offset-2 ring-offset-white shadow-[0_0_0_8px_rgba(197,126,27,.2)]';

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function todayValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultCheckOut(checkIn: string): string {
  const date = new Date(`${checkIn}T12:00:00`);
  date.setDate(date.getDate() + 2);
  return date.toISOString().slice(0, 10);
}

function shortSiteCode(code: string): string {
  return code.replace(/^(Cabin|RV|Tent)\s*/i, '');
}

function siteAvailability(
  site: PublicMapSite,
  searched: boolean,
  availableSiteIds: string[],
): SiteAvailabilityState {
  if (site.status === 'maintenance' || site.status === 'blocked') return 'unavailable';
  if (!searched) return site.status === 'available' ? 'not-searched' : 'unavailable';
  return availableSiteIds.includes(site.id) ? 'available' : 'unavailable';
}

function availabilityLabel(availability: SiteAvailabilityState): string {
  if (availability === 'available') return 'Available for selected dates';
  if (availability === 'unavailable') return 'Unavailable for selected dates';
  return 'Select dates to verify availability';
}

export function ResortExploreExperience({ sites, stayTypes }: ResortExploreExperienceProps) {
  const [checkIn, setCheckIn] = useState(todayValue());
  const [checkOut, setCheckOut] = useState(defaultCheckOut(todayValue()));
  const [area, setArea] = useState('all');
  const [accommodation, setAccommodation] = useState<SiteType | 'all'>('all');
  const [hoveredSiteId, setHoveredSiteId] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [drawerSiteId, setDrawerSiteId] = useState('');
  const [availableSiteIds, setAvailableSiteIds] = useState<string[]>([]);
  const [availabilitySearched, setAvailabilitySearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const areas = useMemo(
    () => Array.from(new Set(sites.map((site) => site.area))).sort((left, right) => left.localeCompare(right)),
    [sites],
  );
  const stayTypesBySiteType = useMemo(
    () => new Map(stayTypes.map((stayType) => [stayType.siteType, stayType])),
    [stayTypes],
  );
  const filteredSites = useMemo(
    () =>
      sites.filter(
        (site) =>
          (area === 'all' || site.area === area) &&
          (accommodation === 'all' || site.type === accommodation),
      ),
    [accommodation, area, sites],
  );
  const selectedSite = sites.find((site) => site.id === drawerSiteId) ?? null;
  const selectedStayType = selectedSite ? stayTypesBySiteType.get(selectedSite.type) ?? null : null;
  const selectedAvailability = selectedSite
    ? siteAvailability(selectedSite, availabilitySearched, availableSiteIds)
    : 'unavailable';
  const activeSiteId = hoveredSiteId || selectedSiteId;

  function focusSiteCard(siteId: string) {
    setSelectedSiteId(siteId);
    cardRefs.current[siteId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function openReservation(siteId: string) {
    setSelectedSiteId(siteId);
    setDrawerSiteId(siteId);
    setMessage('');
    setError('');
  }

  async function searchAvailability() {
    setSearching(true);
    setError('');
    setMessage('');
    setAvailabilitySearched(false);
    const typesToSearch =
      accommodation === 'all'
        ? Array.from(new Set(stayTypes.map((stayType) => stayType.siteType)))
        : [accommodation];

    if (typesToSearch.length === 0) {
      setError('Active stay types need to be added before guests can search availability.');
      setSearching(false);
      return;
    }

    try {
      const results: PublicBookingSite[][] = [];
      for (const siteType of typesToSearch) {
        const params = new URLSearchParams({ checkIn, checkOut, siteType });
        const response = await fetch(`/api/book/availability?${params.toString()}`);
        const result = (await response.json()) as PublicBookingAvailabilityResponse;
        if (!response.ok) {
          setError(result.message ?? 'Unable to search availability.');
          return;
        }
        results.push(result.sites ?? []);
      }
      const availableIds = results.flat().map((site) => site.id);
      setAvailableSiteIds(availableIds);
      setAvailabilitySearched(true);
      setMessage(
        availableIds.length > 0
          ? `${availableIds.length} site${availableIds.length === 1 ? '' : 's'} available for those dates.`
          : 'No available sites matched those dates.',
      );
    } catch {
      setError('Unable to search availability.');
    } finally {
      setSearching(false);
    }
  }

  async function submitReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSite || !selectedStayType) {
      setError('Choose a valid site before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    setMessage('');
    const form = new FormData(event.currentTarget);
    const payload: PublicBookingRequest = {
      guestName: fieldValue(form, 'guestName'),
      guestEmail: fieldValue(form, 'guestEmail'),
      guestPhone: fieldValue(form, 'guestPhone'),
      stayTypeId: selectedStayType.id,
      siteId: selectedSite.id,
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
      event.currentTarget.reset();
      setDrawerSiteId('');
      setMessage(result.message ?? 'Booking request received.');
    } catch {
      setError('Unable to reach booking request service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="bg-[#f7f2e8]">
        <div className="border-b border-line bg-white px-5 py-4 md:px-8">
          <div className="mx-auto grid max-w-[1680px] gap-4 lg:grid-cols-[1fr_220px_220px_220px] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">
                Resort Explore
              </p>
              <h1 className="mt-1 font-serif text-3xl text-forest-900 md:text-4xl">
                Pick your spot, then request the stay.
              </h1>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-bold text-forest-900">
                Check-in
                <input
                  type="date"
                  value={checkIn}
                  onChange={(event) => {
                    setCheckIn(event.target.value);
                    setAvailabilitySearched(false);
                  }}
                  className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm"
                />
              </label>
              <label className="text-xs font-bold text-forest-900">
                Check-out
                <input
                  type="date"
                  value={checkOut}
                  onChange={(event) => {
                    setCheckOut(event.target.value);
                    setAvailabilitySearched(false);
                  }}
                  className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm"
                />
              </label>
            </div>
            <label className="text-xs font-bold text-forest-900">
              Area
              <select
                value={area}
                onChange={(event) => setArea(event.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm"
              >
                <option value="all">All</option>
                {areas.map((siteArea) => (
                  <option key={siteArea} value={siteArea}>
                    {siteArea}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold text-forest-900">
              Accommodations
              <select
                value={accommodation}
                onChange={(event) => {
                  setAccommodation(event.target.value as SiteType | 'all');
                  setAvailabilitySearched(false);
                }}
                className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm"
              >
                <option value="all">All</option>
                <option value="cabin">Cabins</option>
                <option value="rv">RV sites</option>
                <option value="tent">Tent sites</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1680px] lg:min-h-[calc(100vh-155px)] lg:grid-cols-[minmax(520px,1fr)_minmax(520px,1fr)]">
          <div className="border-b border-line bg-forest-900 lg:sticky lg:top-[75px] lg:h-[calc(100vh-75px)] lg:border-b-0 lg:border-r">
            <div className="h-full overflow-auto p-4">
              <div className="relative aspect-[983/749] min-w-[760px] overflow-hidden rounded-2xl bg-white shadow-2xl">
                <Image
                  src={mapImageSrc}
                  alt="Illustrated map of Sun Aura Resort"
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 760px"
                  className="object-contain"
                />
                <div className="absolute inset-0 bg-forest-950/5" aria-hidden="true" />
                {filteredSites.map((site) => {
                  const availability = siteAvailability(site, availabilitySearched, availableSiteIds);
                  const active = activeSiteId === site.id || drawerSiteId === site.id;
                  return (
                    <button
                      key={site.id}
                      type="button"
                      onMouseEnter={() => setHoveredSiteId(site.id)}
                      onMouseLeave={() => setHoveredSiteId('')}
                      onClick={() => focusSiteCard(site.id)}
                      aria-label={`${site.code}, ${PUBLIC_SITE_STATUS_LABELS[site.status]}`}
                      className={`absolute z-10 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-[10px] font-black text-white shadow-lg transition ${statusStyles[site.status]} ${
                        availability === 'available' ? 'animate-pulse' : ''
                      } ${active ? selectedRing : ''}`}
                      style={{ left: `${site.x}%`, top: `${site.y}%` }}
                    >
                      {shortSiteCode(site.code)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-[radial-gradient(circle_at_top_left,rgba(197,126,27,.12),transparent_32%),#fbfaf6] p-5 md:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink-700">
                  {filteredSites.length} site{filteredSites.length === 1 ? '' : 's'} shown
                </p>
                <p className="text-xs text-ink-700/70">
                  Hover cards or map markers to keep both sides in sync.
                </p>
              </div>
              <button
                type="button"
                onClick={searchAvailability}
                disabled={searching}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-forest-900 px-5 text-sm font-bold text-white hover:bg-forest-800 disabled:opacity-60"
              >
                {searching ? (
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <CalendarDays aria-hidden="true" className="size-4" />
                )}
                Check availability
              </button>
            </div>

            {message ? (
              <p role="status" className="mb-5 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                {message}
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">
                {error}
              </p>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              {filteredSites.map((site) => {
                const stayType = stayTypesBySiteType.get(site.type);
                const availability = siteAvailability(site, availabilitySearched, availableSiteIds);
                const active = activeSiteId === site.id || drawerSiteId === site.id;
                return (
                  <button
                    key={site.id}
                    ref={(element) => {
                      cardRefs.current[site.id] = element;
                    }}
                    type="button"
                    onMouseEnter={() => setHoveredSiteId(site.id)}
                    onMouseLeave={() => setHoveredSiteId('')}
                    onClick={() => openReservation(site.id)}
                    className={`group overflow-hidden rounded-2xl border bg-white text-left shadow-card transition hover:-translate-y-1 hover:shadow-xl ${
                      active ? 'border-gold-600 ring-4 ring-gold-600/20' : 'border-line'
                    }`}
                  >
                    <div className="h-28 bg-gradient-to-br from-forest-900 via-forest-800 to-gold-700 p-4 text-white">
                      <div className="flex items-start justify-between gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
                          <MapPin aria-hidden="true" className="size-3.5" />
                          {site.area}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${statusStyles[site.status]}`}>
                          {PUBLIC_SITE_STATUS_LABELS[site.status]}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">
                        {stayTypeLabels[site.type]}
                      </p>
                      <h2 className="mt-1 font-serif text-3xl text-forest-900">{site.code}</h2>
                      <p className="mt-2 text-sm text-ink-700">
                        {stayType ? publicStartingRateLabel(stayType.baseRate) : 'Rate available on request'}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-forest-900">
                        {availabilityLabel(availability)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {selectedSite ? (
        <div className="fixed inset-0 z-[100] bg-forest-950/45" role="presentation">
          <aside
            className="ml-auto h-full w-full max-w-lg overflow-y-auto bg-cream p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-drawer-heading"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">
                  Reservation request
                </p>
                <h2 id="reservation-drawer-heading" className="mt-1 font-serif text-4xl text-forest-900">
                  {selectedSite.code}
                </h2>
                <p className="mt-2 text-sm text-ink-700">
                  {selectedSite.area} · {stayTypeLabels[selectedSite.type]}
                </p>
                <p className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-forest-900">
                  {availabilityLabel(selectedAvailability)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerSiteId('')}
                className="grid size-10 place-items-center rounded-full border border-line bg-white text-forest-900"
                aria-label="Close reservation form"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <form onSubmit={submitReservation} className="mt-7 grid gap-4">
              <div className="grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-forest-900">
                  Check-in
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(event) => setCheckIn(event.target.value)}
                    className="mt-1 h-11 w-full rounded-lg border border-line px-3 text-sm"
                  />
                </label>
                <label className="text-xs font-bold text-forest-900">
                  Check-out
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(event) => setCheckOut(event.target.value)}
                    className="mt-1 h-11 w-full rounded-lg border border-line px-3 text-sm"
                  />
                </label>
              </div>
              <label className="text-sm font-semibold text-forest-900">
                Name
                <input name="guestName" required maxLength={120} className="mt-1.5 h-12 w-full rounded-lg border border-line bg-white px-3" />
              </label>
              <label className="text-sm font-semibold text-forest-900">
                Email
                <input name="guestEmail" type="email" required maxLength={254} className="mt-1.5 h-12 w-full rounded-lg border border-line bg-white px-3" />
              </label>
              <label className="text-sm font-semibold text-forest-900">
                Phone
                <input name="guestPhone" required maxLength={30} className="mt-1.5 h-12 w-full rounded-lg border border-line bg-white px-3" />
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
                  className="mt-1.5 h-12 w-full rounded-lg border border-line bg-white px-3"
                />
              </label>
              <button
                type="submit"
                disabled={submitting || !selectedStayType || selectedAvailability === 'unavailable'}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold-600 px-5 text-sm font-bold text-white hover:bg-gold-700 disabled:opacity-60"
              >
                {submitting ? (
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <Send aria-hidden="true" className="size-4" />
                )}
                Submit request
              </button>
            </form>
          </aside>
        </div>
      ) : null}
    </>
  );
}
