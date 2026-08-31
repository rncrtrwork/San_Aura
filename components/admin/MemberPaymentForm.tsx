'use client';

import { LoaderCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { MemberPaymentCreateRequest, MemberPaymentCreateResponse } from '@/lib/paymentForms';
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_TYPES,
  PAYMENT_TYPE_LABELS,
} from '@/lib/paymentOptions';

type MemberPaymentFormProps = {
  memberId: string;
};

const inputClass =
  'mt-1.5 h-10 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900';

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function todayValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function MemberPaymentForm({ memberId }: MemberPaymentFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload: MemberPaymentCreateRequest = {
      amount: Number(fieldValue(form, 'amount')),
      type: fieldValue(form, 'type') as MemberPaymentCreateRequest['type'],
      method: fieldValue(form, 'method') as MemberPaymentCreateRequest['method'],
      date: fieldValue(form, 'date'),
      periodStart: fieldValue(form, 'periodStart'),
      periodEnd: fieldValue(form, 'periodEnd'),
      externalReference: fieldValue(form, 'externalReference'),
      notes: fieldValue(form, 'notes'),
    };

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/api/admin/members/${memberId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as MemberPaymentCreateResponse;
      if (!response.ok || !result.id) {
        setError(result.message ?? 'Unable to record the payment.');
        return;
      }
      formElement.reset();
      setSuccess('Payment recorded.');
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
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active"
      >
        <Plus aria-hidden="true" className="size-4" />
        Add Payment
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-lg border border-admin-border bg-admin-canvas p-4"
    >
      <div className="flex items-center justify-between gap-4">
        <h4 className="font-bold text-forest-900">Record Manual Payment</h4>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm font-semibold text-admin-muted hover:text-forest-900"
        >
          Cancel
        </button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-semibold text-forest-900">
          Amount
          <input
            name="amount"
            type="number"
            min="0.01"
            max="1000000"
            step="0.01"
            required
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Type
          <select name="type" required defaultValue="dues" className={inputClass}>
            {PAYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {PAYMENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Method
          <select name="method" required defaultValue="cash" className={inputClass}>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {PAYMENT_METHOD_LABELS[method]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Payment date
          <input
            name="date"
            type="date"
            required
            defaultValue={todayValue()}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Applies from
          <input name="periodStart" type="date" className={inputClass} />
        </label>
        <label className="text-sm font-semibold text-forest-900">
          Applies through
          <input name="periodEnd" type="date" className={inputClass} />
        </label>
        <label className="text-sm font-semibold text-forest-900 lg:col-span-2">
          Reference
          <input
            name="externalReference"
            maxLength={200}
            placeholder="Check or receipt number"
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold text-forest-900 sm:col-span-2 lg:col-span-4">
          Notes
          <textarea
            name="notes"
            maxLength={2000}
            rows={3}
            className="mt-1.5 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900"
          />
        </label>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="mt-3 text-sm font-semibold text-admin-success">
          {success}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-60"
      >
        {submitting ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Plus aria-hidden="true" className="size-4" />
        )}
        {submitting ? 'Recording…' : 'Record Payment'}
      </button>
    </form>
  );
}
