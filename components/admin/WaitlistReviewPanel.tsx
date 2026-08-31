'use client';

import { LoaderCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { WaitlistUpdateRequest, WaitlistUpdateResponse } from '@/lib/waitlistActions';
import { WAITLIST_STATUSES, type WaitlistStatus } from '@/lib/waitlistOptions';
import type { CalendarWaitlistDetail } from '@/server/calendar/getWaitlistOverview';

type WaitlistReviewPanelProps = {
  entry: CalendarWaitlistDetail;
  closeHref: string;
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function WaitlistReviewPanel({ entry, closeHref }: WaitlistReviewPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState<WaitlistStatus>(entry.status);
  const [notes, setNotes] = useState(entry.notes);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    const body: WaitlistUpdateRequest = { status, notes };
    try {
      const response = await fetch(`/api/admin/waitlist/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as WaitlistUpdateResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to update this waitlist request.');
        return;
      }
      setMessage(result.message ?? 'Waitlist request updated.');
      router.refresh();
    } catch {
      setError('Unable to reach the server.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-forest-950/35" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-review-heading"
        className="h-full w-full max-w-lg overflow-y-auto bg-admin-surface shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-admin-border p-5 sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-accent">
              Waitlist request
            </p>
            <h2 id="waitlist-review-heading" className="mt-1 font-serif text-3xl text-forest-900">
              {entry.contactName}
            </h2>
          </div>
          <Link
            href={closeHref}
            aria-label="Close waitlist review"
            className="grid size-10 place-items-center rounded-full border border-admin-border text-admin-muted"
          >
            <X aria-hidden="true" className="size-4" />
          </Link>
        </header>
        <div className="grid gap-4 border-b border-admin-border p-5 text-sm sm:grid-cols-2 sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase text-admin-muted">Dates</p>
            <p className="mt-1 font-semibold text-forest-900">
              {dateFormatter.format(new Date(entry.requestedCheckIn))} –{' '}
              {dateFormatter.format(new Date(entry.requestedCheckOut))}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-admin-muted">Stay</p>
            <p className="mt-1 font-semibold text-forest-900">
              {entry.stayTypeName} · {entry.siteCount} site{entry.siteCount === 1 ? '' : 's'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-admin-muted">Email</p>
            <a className="mt-1 block text-admin-sidebar underline" href={`mailto:${entry.email}`}>
              {entry.email}
            </a>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-admin-muted">Phone</p>
            <a className="mt-1 block text-admin-sidebar underline" href={`tel:${entry.phone}`}>
              {entry.phone}
            </a>
          </div>
        </div>
        <form className="space-y-5 p-5 sm:p-6" onSubmit={submit}>
          <label className="block text-sm font-bold text-forest-900">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as WaitlistStatus)}
              className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 font-normal"
            >
              {WAITLIST_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option.replace('-', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold text-forest-900">
            Review notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={3000}
              rows={7}
              className="mt-2 w-full rounded-lg border border-admin-border bg-white p-3 font-normal"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-60"
          >
            {saving ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
            Save Review
          </button>
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
        </form>
      </section>
    </div>
  );
}
