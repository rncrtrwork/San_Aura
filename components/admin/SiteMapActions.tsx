'use client';

import { Ban, CalendarDays, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { SiteBlockRequest, SiteBlockResponse } from '@/lib/siteActions';
import type { SiteStatus } from '@/models/Site';

type SiteMapActionsProps = {
  siteId: string;
  status: SiteStatus;
  reservationId: string | null;
};

export function SiteMapActions({ siteId, status, reservationId }: SiteMapActionsProps) {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function blockSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    const body: SiteBlockRequest = { note };
    try {
      const response = await fetch(`/api/admin/sites/${siteId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as SiteBlockResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to block this site.');
        return;
      }
      setMessage(result.message ?? 'Site blocked.');
      router.refresh();
    } catch {
      setError('Unable to reach the server.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="border-t border-admin-border pt-5" aria-labelledby="site-actions-heading">
      <h3 id="site-actions-heading" className="text-xs font-bold uppercase text-admin-muted">
        Site actions
      </h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {reservationId ? (
          <Link
            href={`/admin/reservations?reservation=${reservationId}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-admin-sidebar px-4 text-sm font-bold text-admin-sidebar hover:bg-admin-sidebar hover:text-white"
          >
            <CalendarDays aria-hidden="true" className="size-4" />
            View Reservation
          </Link>
        ) : (
          <span className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-admin-border px-4 text-sm font-bold text-admin-muted">
            <CalendarDays aria-hidden="true" className="size-4" />
            No Active Stay
          </span>
        )}
        <details className="group sm:col-span-1">
          <summary
            className={`inline-flex h-11 w-full cursor-pointer list-none items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold text-white ${
              status === 'blocked' ? 'pointer-events-none bg-admin-muted' : 'bg-admin-accent'
            }`}
          >
            <Ban aria-hidden="true" className="size-4" />
            {status === 'blocked' ? 'Site Blocked' : 'Block Site'}
          </summary>
          {status !== 'blocked' ? (
            <form onSubmit={blockSite} className="mt-3 space-y-3 sm:col-span-2">
              <label className="block text-sm font-bold text-forest-900">
                Blocking reason
                <textarea
                  required
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={2000}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-admin-border bg-white p-3 font-normal"
                />
              </label>
              <button
                type="submit"
                disabled={saving || !note.trim()}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-admin-danger px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving ? (
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                ) : null}
                Confirm Block
              </button>
            </form>
          ) : null}
        </details>
      </div>
      {message ? (
        <p role="status" className="mt-3 text-sm font-semibold text-admin-success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
    </section>
  );
}
