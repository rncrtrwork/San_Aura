'use client';

import { CreditCard, LoaderCircle, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type {
  PaymentSettingsMutationRequest,
  PaymentSettingsMutationResponse,
  SettingsOverview,
} from '@/lib/settingsManager';

type PaymentsSettingsFormProps = {
  payments: SettingsOverview['payments'];
};

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function PaymentsSettingsForm({ payments }: PaymentsSettingsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    const form = new FormData(formEvent.currentTarget);
    const payload: PaymentSettingsMutationRequest = {
      paypalMeUrl: fieldValue(form, 'paypalMeUrl'),
    };

    try {
      const response = await fetch('/api/admin/settings/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as PaymentSettingsMutationResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to save payment settings.');
        return;
      }

      setMessage(result.message ?? 'Payment settings saved.');
      router.refresh();
    } catch {
      setError('Unable to reach the server.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-admin-border bg-white p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">Payments</p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">PayPal-link-only MVP</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">
            The MVP does not store cards, processor keys, webhooks, or payment tokens. Staff record
            payments manually after guests or members pay through the resort’s off-platform link.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          Save Payments
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-admin-accent/25 bg-[#FFF7E8] p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-forest-900">
          <CreditCard aria-hidden="true" className="size-4 text-admin-accent" />
          No payment processor is connected for MVP.
        </p>
        <p className="mt-2 text-sm leading-6 text-admin-muted">
          Payment Failed alerts and processor credential fields stay unavailable until a future
          payment-integration phase.
        </p>
      </div>

      <label className="mt-5 block text-sm font-semibold text-forest-900">
        Resort PayPal.me link
        <input
          name="paypalMeUrl"
          type="url"
          maxLength={2000}
          defaultValue={payments.paypalMeUrl}
          className="mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900 placeholder:text-admin-muted"
          placeholder="https://paypal.me/sunauraresort"
        />
      </label>
      <p className="mt-2 text-xs font-semibold text-admin-muted">
        Status: {payments.paypalMeConfigured ? 'PayPal.me link configured' : 'No payment link set'}
      </p>

      {message ? (
        <p role="status" className="mt-4 text-sm font-semibold text-admin-success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 text-sm font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
    </form>
  );
}
