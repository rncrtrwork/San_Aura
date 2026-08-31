'use client';

import { LoaderCircle, LockKeyhole, Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { MemberNotesUpdateResponse } from '@/lib/memberNotes';

type MemberNotesPanelProps = {
  memberId: string;
  initialNotes: string;
};

export function MemberNotesPanel({ memberId, initialNotes }: MemberNotesPanelProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch(`/api/admin/members/${memberId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const result = (await response.json()) as MemberNotesUpdateResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to save staff notes.');
        return;
      }
      setMessage(result.message ?? 'Staff notes saved.');
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-5 sm:p-6">
      <div className="flex gap-3 rounded-lg border border-admin-accent/25 bg-[#FFF7E8] px-4 py-3">
        <LockKeyhole aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-admin-accent" />
        <div>
          <p className="text-sm font-bold text-forest-900">Staff Only</p>
          <p className="mt-0.5 text-xs leading-relaxed text-admin-muted">
            These notes are restricted to staff and are never included in member portal data.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-5">
        <label className="text-sm font-semibold text-forest-900">
          Internal notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={10_000}
            rows={10}
            placeholder="Add operational details for staff…"
            className="mt-2 w-full rounded-lg border border-admin-border bg-white px-3 py-3 text-sm leading-6 text-forest-900 placeholder:text-admin-muted"
          />
        </label>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-admin-muted">{notes.length.toLocaleString()} / 10,000</p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-60"
          >
            {submitting ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Save aria-hidden="true" className="size-4" />
            )}
            Save Notes
          </button>
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
      </form>
    </div>
  );
}
