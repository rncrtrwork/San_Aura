'use client';

import { LoaderCircle, MailCheck } from 'lucide-react';
import { useState } from 'react';
import type { ReservationActionResponse } from '@/lib/reservationActions';

type ReservationActionsProps = { reservationId: string };

export function ReservationActions({ reservationId }: ReservationActionsProps) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function sendConfirmation() {
    setSending(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}/send-confirmation`, {
        method: 'POST',
      });
      const result = (await response.json()) as ReservationActionResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to send confirmation.');
        return;
      }
      setMessage(result.message ?? 'Confirmation prepared.');
    } catch {
      setError('Unable to reach the server.');
    } finally {
      setSending(false);
    }
  }
  return (
    <div className="border-b border-admin-border px-5 py-4 sm:px-6">
      <button
        type="button"
        onClick={sendConfirmation}
        disabled={sending}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-admin-sidebar px-4 text-sm font-bold text-admin-sidebar hover:bg-admin-sidebar hover:text-white disabled:opacity-60"
      >
        {sending ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <MailCheck aria-hidden="true" className="size-4" />
        )}
        Send Confirmation
      </button>
      {message ? (
        <p role="status" className="mt-2 text-xs font-semibold text-admin-success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-xs font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
