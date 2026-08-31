'use client';

import { CalendarCheck, LoaderCircle, MailCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ReservationActionResponse } from '@/lib/reservationActions';
import type { ReservationStatus } from '@/models/Reservation';

type ReservationActionsProps = { reservationId: string; status: ReservationStatus };

export function ReservationActions({ reservationId, status }: ReservationActionsProps) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
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
  async function checkIn() {
    setCheckingIn(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}/check-in`, {
        method: 'POST',
      });
      const result = (await response.json()) as ReservationActionResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to check in this reservation.');
        return;
      }
      setMessage(result.message ?? 'Guest checked in.');
      router.refresh();
    } catch {
      setError('Unable to reach the server.');
    } finally {
      setCheckingIn(false);
    }
  }
  return (
    <div className="border-b border-admin-border px-5 py-4 sm:px-6">
      <div className="flex flex-wrap gap-2">
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
        {status === 'confirmed' ? (
          <button
            type="button"
            onClick={checkIn}
            disabled={checkingIn}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-60"
          >
            {checkingIn ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <CalendarCheck aria-hidden="true" className="size-4" />
            )}
            Check In
          </button>
        ) : null}
      </div>
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
