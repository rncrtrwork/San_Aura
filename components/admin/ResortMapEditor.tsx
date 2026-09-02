'use client';

import { LoaderCircle, Save } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type MouseEvent } from 'react';
import type {
  SiteMapPositionRequest,
  SiteMapPositionResponse,
  SiteMapPositionUpdate,
} from '@/lib/mapEditor';
import type { ResortMapSite } from '@/server/sites/getResortMapSites';

type ResortMapEditorProps = {
  sites: ResortMapSite[];
};

export function ResortMapEditor({ sites }: ResortMapEditorProps) {
  const router = useRouter();
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id ?? '');
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() =>
    Object.fromEntries(sites.map((site) => [site.id, { x: site.x, y: site.y }])),
  );
  const [changedSiteIds, setChangedSiteIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function placeMarker(event: MouseEvent<HTMLDivElement>) {
    if (!selectedSiteId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100));
    setPositions((current) => ({ ...current, [selectedSiteId]: { x, y } }));
    setChangedSiteIds((current) =>
      current.includes(selectedSiteId) ? current : [...current, selectedSiteId],
    );
    setMessage('');
  }

  async function savePositions() {
    setSaving(true);
    setError('');
    setMessage('');
    const updates: SiteMapPositionUpdate[] = changedSiteIds.map((siteId) => ({
      siteId,
      x: positions[siteId].x,
      y: positions[siteId].y,
    }));
    const body: SiteMapPositionRequest = { positions: updates };
    try {
      const response = await fetch('/api/admin/sites/map-positions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as SiteMapPositionResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to save map positions.');
        return;
      }
      setChangedSiteIds([]);
      setMessage(result.message ?? 'Map positions saved.');
      router.refresh();
    } catch {
      setError('Unable to reach the server.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4" aria-labelledby="map-editor-heading">
      <div className="admin-card flex flex-wrap items-end gap-4 p-4">
        <label className="min-w-60 flex-1 text-sm font-bold text-forest-900">
          Marker to place
          <select
            value={selectedSiteId}
            onChange={(event) => setSelectedSiteId(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 font-normal"
          >
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.code} · {site.type.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <p id="map-editor-heading" className="max-w-md text-sm text-admin-muted">
          Select a site, then click its desired location on the map. Repeat before saving.
        </p>
        <button
          type="button"
          onClick={savePositions}
          disabled={saving || changedSiteIds.length === 0}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          Save Map
        </button>
        <Link
          href="/admin/resort-map"
          className="inline-flex h-11 items-center rounded-lg border border-admin-border px-4 text-sm font-bold text-admin-muted"
        >
          Exit Edit Mode
        </Link>
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
      <div className="admin-card overflow-x-auto">
        <div
          className="relative aspect-[980/361] min-w-[900px] cursor-crosshair bg-forest-800"
          onClick={placeMarker}
        >
          <Image
            src="/images/resort-map.jpg"
            alt="Sun Aura Resort marker placement map"
            fill
            priority
            sizes="(min-width: 1280px) 75vw, 100vw"
            className="pointer-events-none object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-white/15" aria-hidden="true" />
          {sites.map((site) => {
            const position = positions[site.id];
            return (
              <button
                key={site.id}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedSiteId(site.id);
                }}
                aria-label={`Select ${site.code} marker`}
                className={`absolute z-10 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-[9px] font-extrabold shadow-md ${
                  selectedSiteId === site.id
                    ? 'scale-125 border-admin-accent bg-white text-admin-accent ring-2 ring-white'
                    : 'border-white bg-admin-sidebar text-white'
                }`}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
              >
                {site.code.replace(/^(Cabin|RV|Tent)\s*/i, '')}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
