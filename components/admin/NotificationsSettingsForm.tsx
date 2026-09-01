'use client';

import { BellRing, LoaderCircle, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  enabledNotificationCount,
  NOTIFICATION_SETTING_DEFINITIONS,
  type NotificationSettingKey,
  type NotificationSettingsMutationRequest,
  type NotificationSettingsMutationResponse,
  type SettingsOverview,
} from '@/lib/settingsManager';

type NotificationsSettingsFormProps = {
  notifications: SettingsOverview['notifications'];
};

export function NotificationsSettingsForm({ notifications }: NotificationsSettingsFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<NotificationSettingsMutationRequest>(notifications.values);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const enabledCount = enabledNotificationCount(values);

  function updateValue(key: NotificationSettingKey, checked: boolean) {
    setValues((current) => ({ ...current, [key]: checked }));
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as NotificationSettingsMutationResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to save notifications.');
        return;
      }

      setMessage(result.message ?? 'Notification settings saved.');
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
            Notifications
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">Staff alert toggles</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">
            Enable operational alerts. Payment Failed is intentionally represented as Payment
            Recorded for the MVP because real payment processing is out of scope.
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
          Save Notifications
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-admin-border bg-cream-alt/70 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-forest-900">
          <BellRing aria-hidden="true" className="size-4 text-admin-accent" />
          {enabledCount}/{NOTIFICATION_SETTING_DEFINITIONS.length} alerts enabled
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {NOTIFICATION_SETTING_DEFINITIONS.map((definition) => (
          <label
            key={definition.key}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
              values[definition.key]
                ? 'border-admin-accent bg-[#FFF7E8] text-forest-900'
                : 'border-admin-border bg-white text-admin-muted'
            }`}
          >
            <input
              type="checkbox"
              checked={values[definition.key]}
              onChange={(event) => updateValue(definition.key, event.target.checked)}
              className="mt-1 size-4 rounded border-admin-border text-admin-accent"
            />
            <span>
              <span className="block text-sm font-bold">{definition.label}</span>
              <span className="mt-1 block text-xs leading-5">{definition.description}</span>
            </span>
          </label>
        ))}
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
