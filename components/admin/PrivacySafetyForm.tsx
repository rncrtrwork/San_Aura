'use client';

import { CameraOff, LoaderCircle, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type {
  PrivacySettingsMutationRequest,
  PrivacySettingsMutationResponse,
  SettingsOverview,
} from '@/lib/settingsManager';
import { privacyPolicySummaryText } from '@/lib/settingsManager';

type PrivacySafetyFormProps = {
  privacy: SettingsOverview['privacy'];
};

export function PrivacySafetyForm({ privacy }: PrivacySafetyFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<PrivacySettingsMutationRequest>(privacy);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function updateValue(key: keyof PrivacySettingsMutationRequest, checked: boolean) {
    setValues((current) => ({ ...current, [key]: checked }));
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/settings/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as PrivacySettingsMutationResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to save privacy settings.');
        return;
      }

      setMessage(result.message ?? 'Privacy settings saved.');
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
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Privacy & safety
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">Guest media policy</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">
            Keep the resort’s no-photo/no-video policy visible anywhere guests make booking
            decisions.
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
          Save Privacy
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          {
            key: 'photographyProhibited' as const,
            label: 'Photography prohibited',
          },
          {
            key: 'videoProhibited' as const,
            label: 'Video prohibited',
          },
          {
            key: 'showPrivacyNoticeAtBooking' as const,
            label: 'Show notice at booking',
          },
        ].map((item) => (
          <label
            key={item.key}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-bold ${
              values[item.key]
                ? 'border-admin-accent bg-[#FFF7E8] text-forest-900'
                : 'border-admin-border bg-cream-alt/50 text-admin-muted'
            }`}
          >
            <input
              type="checkbox"
              checked={values[item.key]}
              onChange={(event) => updateValue(item.key, event.target.checked)}
              className="size-4 rounded border-admin-border text-admin-accent"
            />
            {item.label}
          </label>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-admin-accent/25 bg-[#FFF7E8] p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-forest-900">
          <CameraOff aria-hidden="true" className="size-4 text-admin-accent" />
          Live privacy policy summary
        </p>
        <p className="mt-2 text-sm leading-6 text-admin-muted">
          {privacyPolicySummaryText(values)}
        </p>
      </div>

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
