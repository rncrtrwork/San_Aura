'use client';

import { LoaderCircle, Save, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type {
  SettingsOverview,
  StaffUserCreateRequest,
  StaffUserMutationResponse,
  StaffUserUpdateRequest,
} from '@/lib/settingsManager';

type StaffUserManagementProps = {
  staff: SettingsOverview['staff'];
};

type StaffUserMessage = {
  message: string;
  error: boolean;
};

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900 placeholder:text-admin-muted';

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function StaffUserManagement({ staff }: StaffUserManagementProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [savingUserId, setSavingUserId] = useState('');
  const [createMessage, setCreateMessage] = useState<StaffUserMessage>({
    message: '',
    error: false,
  });
  const [userMessages, setUserMessages] = useState<Record<string, StaffUserMessage>>({});

  async function createStaffUser(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setCreating(true);
    setCreateMessage({ message: '', error: false });
    const form = new FormData(formEvent.currentTarget);
    const payload: StaffUserCreateRequest = {
      name: fieldValue(form, 'name'),
      email: fieldValue(form, 'email'),
      roleId: fieldValue(form, 'roleId'),
      temporaryPassword: fieldValue(form, 'temporaryPassword'),
    };

    try {
      const response = await fetch('/api/admin/settings/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as StaffUserMutationResponse;
      if (!response.ok) {
        setCreateMessage({
          message: result.message ?? 'Unable to create staff account.',
          error: true,
        });
        return;
      }

      formEvent.currentTarget.reset();
      setCreateMessage({ message: result.message ?? 'Staff account created.', error: false });
      router.refresh();
    } catch {
      setCreateMessage({ message: 'Unable to reach the server.', error: true });
    } finally {
      setCreating(false);
    }
  }

  async function updateStaffUser(formEvent: FormEvent<HTMLFormElement>, userId: string) {
    formEvent.preventDefault();
    setSavingUserId(userId);
    setUserMessages((current) => ({ ...current, [userId]: { message: '', error: false } }));
    const form = new FormData(formEvent.currentTarget);
    const payload: StaffUserUpdateRequest = {
      roleId: fieldValue(form, 'roleId'),
      active: form.get('active') === 'on',
    };

    try {
      const response = await fetch(`/api/admin/settings/staff/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as StaffUserMutationResponse;
      if (!response.ok) {
        setUserMessages((current) => ({
          ...current,
          [userId]: { message: result.message ?? 'Unable to save staff account.', error: true },
        }));
        return;
      }

      setUserMessages((current) => ({
        ...current,
        [userId]: { message: result.message ?? 'Staff account saved.', error: false },
      }));
      router.refresh();
    } catch {
      setUserMessages((current) => ({
        ...current,
        [userId]: { message: 'Unable to reach the server.', error: true },
      }));
    } finally {
      setSavingUserId('');
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-admin-border bg-white p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
          Staff users
        </p>
        <h3 className="mt-1 font-serif text-2xl text-forest-900">Invite and manage staff</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">
          Create staff accounts with a temporary password, assign a role, and deactivate access when
          needed.
        </p>
      </div>

      <form onSubmit={createStaffUser} className="mt-5 rounded-xl border border-admin-border p-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-semibold text-forest-900">
            Name
            <input name="name" required maxLength={120} className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Email
            <input name="email" type="email" required maxLength={254} className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Role
            <select name="roleId" required className={inputClass} defaultValue="">
              <option value="" disabled>
                Select role
              </option>
              {staff.roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Temporary password
            <input
              name="temporaryPassword"
              type="password"
              required
              minLength={10}
              maxLength={200}
              className={inputClass}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-60"
        >
          {creating ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <UserPlus aria-hidden="true" className="size-4" />
          )}
          Create Staff Account
        </button>
        {createMessage.message ? (
          <p
            role={createMessage.error ? 'alert' : 'status'}
            className={`mt-3 text-sm font-semibold ${
              createMessage.error ? 'text-admin-danger' : 'text-admin-success'
            }`}
          >
            {createMessage.message}
          </p>
        ) : null}
      </form>

      <div className="mt-5 space-y-3">
        {staff.users.length === 0 ? (
          <p className="rounded-xl border border-admin-border bg-cream-alt/50 p-4 text-sm text-admin-muted">
            No staff users have been created yet.
          </p>
        ) : (
          staff.users.map((user) => {
            const message = userMessages[user.id];
            const saving = savingUserId === user.id;

            return (
              <form
                key={user.id}
                onSubmit={(event) => void updateStaffUser(event, user.id)}
                className="grid gap-4 rounded-xl border border-admin-border bg-cream-alt/40 p-4 lg:grid-cols-[minmax(0,1fr)_12rem_8rem_8rem]"
              >
                <div>
                  <p className="font-bold text-forest-900">{user.name}</p>
                  <p className="mt-1 text-sm text-admin-muted">{user.email}</p>
                  <p className="mt-1 text-xs text-admin-muted">
                    Last login:{' '}
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <label className="text-sm font-semibold text-forest-900">
                  Role
                  <select name="roleId" required className={inputClass} defaultValue={user.roleId}>
                    {staff.roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-3 self-end rounded-lg border border-admin-border bg-white px-4 py-3 text-sm font-bold text-forest-900">
                  <input
                    name="active"
                    type="checkbox"
                    defaultChecked={user.active}
                    className="size-4 rounded border-admin-border text-admin-accent"
                  />
                  Active
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                  ) : (
                    <Save aria-hidden="true" className="size-4" />
                  )}
                  Save
                </button>
                {message?.message ? (
                  <p
                    role={message.error ? 'alert' : 'status'}
                    className={`lg:col-span-4 text-sm font-semibold ${
                      message.error ? 'text-admin-danger' : 'text-admin-success'
                    }`}
                  >
                    {message.message}
                  </p>
                ) : null}
              </form>
            );
          })
        )}
      </div>
    </section>
  );
}
