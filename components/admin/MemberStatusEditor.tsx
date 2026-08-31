'use client';

import { LoaderCircle, Pencil, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { MEMBER_STATUSES, type MemberStatus } from '@/lib/memberOptions';
import type { MemberStatusUpdateRequest, MemberStatusUpdateResponse } from '@/lib/memberUpdates';

type MemberStatusEditorProps = {
  memberId: string;
  initialStatus: MemberStatus;
  initialRenewalMonth: number;
};

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' });

function monthName(month: number): string {
  return monthFormatter.format(new Date(Date.UTC(2026, month - 1, 1)));
}

export function MemberStatusEditor({
  memberId,
  initialStatus,
  initialRenewalMonth,
}: MemberStatusEditorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [renewalMonth, setRenewalMonth] = useState(initialRenewalMonth);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: MemberStatusUpdateRequest = { status, renewalMonth };
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as MemberStatusUpdateResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to update the member.');
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-admin-border px-3 text-xs font-bold text-forest-900 hover:border-admin-accent hover:text-admin-accent"
      >
        <Pencil aria-hidden="true" className="size-3.5" />
        Edit status
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end justify-end gap-2">
      <label className="text-left text-xs font-semibold text-admin-muted">
        Status
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as MemberStatus)}
          className="mt-1 block h-9 rounded-lg border border-admin-border bg-white px-2 text-sm capitalize text-forest-900"
        >
          {MEMBER_STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="text-left text-xs font-semibold text-admin-muted">
        Renewal
        <select
          value={renewalMonth}
          onChange={(event) => setRenewalMonth(Number(event.target.value))}
          className="mt-1 block h-9 rounded-lg border border-admin-border bg-white px-2 text-sm text-forest-900"
        >
          {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
            <option key={month} value={month}>
              {monthName(month)}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-admin-sidebar px-3 text-xs font-bold text-white disabled:opacity-60"
      >
        {submitting ? (
          <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
        ) : (
          <Save aria-hidden="true" className="size-3.5" />
        )}
        Save
      </button>
      <button
        type="button"
        onClick={() => {
          setStatus(initialStatus);
          setRenewalMonth(initialRenewalMonth);
          setError('');
          setOpen(false);
        }}
        className="h-9 px-2 text-xs font-semibold text-admin-muted"
      >
        Cancel
      </button>
      {error ? (
        <p role="alert" className="w-full text-right text-xs font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
    </form>
  );
}
