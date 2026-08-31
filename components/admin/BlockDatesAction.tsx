'use client';

import { CalendarOff, LoaderCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  SITE_BLOCK_KINDS,
  type SiteBlockCreateRequest,
  type SiteBlockCreateResponse,
  type SiteBlockKind,
} from '@/lib/siteBlockOptions';
import type { BlockDateSiteOption } from '@/server/calendar/getBlockDateOptions';

type BlockDatesActionProps = {
  sites: BlockDateSiteOption[];
  defaultDate: string;
};

export function BlockDatesAction({ sites, defaultDate }: BlockDatesActionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [siteId, setSiteId] = useState(sites[0]?.id ?? '');
  const [startDate, setStartDate] = useState(defaultDate);
  const [endDate, setEndDate] = useState(defaultDate);
  const [kind, setKind] = useState<SiteBlockKind>('blocked');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const body: SiteBlockCreateRequest = { siteId, startDate, endDate, kind, note };
    try {
      const response = await fetch('/api/admin/site-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as SiteBlockCreateResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to block these dates.');
        return;
      }
      setOpen(false);
      setNote('');
      router.refresh();
    } catch {
      setError('Unable to reach the server.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={sites.length === 0}
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-50"
      >
        <CalendarOff aria-hidden="true" className="size-4" />
        Block Dates
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-forest-950/40 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="block-dates-heading"
            className="admin-card w-full max-w-xl p-5 sm:p-6"
          >
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-accent">
                  Site inventory
                </p>
                <h2 id="block-dates-heading" className="mt-1 font-serif text-3xl text-forest-900">
                  Block Dates
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close block dates form"
                className="grid size-10 place-items-center rounded-full border border-admin-border text-admin-muted"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </header>
            <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-bold text-forest-900 sm:col-span-2">
                Site
                <select
                  required
                  value={siteId}
                  onChange={(event) => setSiteId(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 font-normal"
                >
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.code} · {site.type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-bold text-forest-900">
                Start date
                <input
                  required
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 font-normal"
                />
              </label>
              <label className="block text-sm font-bold text-forest-900">
                End date
                <input
                  required
                  type="date"
                  min={startDate}
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 font-normal"
                />
              </label>
              <label className="block text-sm font-bold text-forest-900 sm:col-span-2">
                Reason
                <select
                  value={kind}
                  onChange={(event) => setKind(event.target.value as SiteBlockKind)}
                  className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 font-normal capitalize"
                >
                  {SITE_BLOCK_KINDS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-bold text-forest-900 sm:col-span-2">
                Note
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={2000}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-admin-border bg-white p-3 font-normal"
                  placeholder="Why this site is unavailable"
                />
              </label>
              {error ? (
                <p role="alert" className="text-sm font-semibold text-admin-danger sm:col-span-2">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={saving || !siteId}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2"
              >
                {saving ? (
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                ) : null}
                Save Block
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
