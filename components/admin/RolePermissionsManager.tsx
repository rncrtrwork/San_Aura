'use client';

import { LoaderCircle, Save, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  PERMISSION_GROUPS,
  type RolePermissionsMutationResponse,
  type SettingsOverview,
} from '@/lib/settingsManager';
import type { Permission } from '@/server/auth/permissions';

type RolePermissionsManagerProps = {
  roles: SettingsOverview['staff']['roles'];
};

type RoleMessage = {
  message: string;
  error: boolean;
};

function permissionLabel(permission: Permission): string {
  return permission
    .split('.')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function RolePermissionsManager({ roles }: RolePermissionsManagerProps) {
  const router = useRouter();
  const [rolePermissions, setRolePermissions] = useState<Record<string, Permission[]>>(
    Object.fromEntries(roles.map((role) => [role.id, role.permissions])),
  );
  const [savingRoleId, setSavingRoleId] = useState('');
  const [messages, setMessages] = useState<Record<string, RoleMessage>>({});

  function togglePermission(roleId: string, permission: Permission) {
    setRolePermissions((current) => {
      const currentPermissions = current[roleId] ?? [];
      const nextPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter((entry) => entry !== permission)
        : [...currentPermissions, permission];

      return { ...current, [roleId]: nextPermissions };
    });
  }

  async function saveRole(roleId: string) {
    setSavingRoleId(roleId);
    setMessages((current) => ({ ...current, [roleId]: { message: '', error: false } }));

    try {
      const response = await fetch(`/api/admin/settings/roles/${roleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: rolePermissions[roleId] ?? [] }),
      });
      const result = (await response.json()) as RolePermissionsMutationResponse;
      if (!response.ok) {
        setMessages((current) => ({
          ...current,
          [roleId]: { message: result.message ?? 'Unable to save role permissions.', error: true },
        }));
        return;
      }

      setMessages((current) => ({
        ...current,
        [roleId]: { message: result.message ?? 'Role permissions saved.', error: false },
      }));
      router.refresh();
    } catch {
      setMessages((current) => ({
        ...current,
        [roleId]: { message: 'Unable to reach the server.', error: true },
      }));
    } finally {
      setSavingRoleId('');
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-admin-border bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-cream-alt text-admin-accent">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Manage roles
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">Permission checklist editor</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">
            Adjust module permissions per staff role. Dashboard access is required on every role so
            staff are never dropped into a blank admin shell.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {roles.map((role) => {
          const selectedPermissions = rolePermissions[role.id] ?? [];
          const roleMessage = messages[role.id];
          const saving = savingRoleId === role.id;

          return (
            <details
              key={role.id}
              className="rounded-xl border border-admin-border bg-cream-alt/40 p-4"
            >
              <summary className="cursor-pointer list-none">
                <span className="flex flex-wrap items-center justify-between gap-3">
                  <span>
                    <span className="block font-bold text-forest-900">{role.name}</span>
                    <span className="mt-1 block text-xs font-semibold text-admin-muted">
                      {selectedPermissions.length} permissions selected
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      void saveRole(role.id);
                    }}
                    disabled={saving}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-60"
                  >
                    {saving ? (
                      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                    ) : (
                      <Save aria-hidden="true" className="size-4" />
                    )}
                    Save Role
                  </button>
                </span>
              </summary>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {PERMISSION_GROUPS.map((group) => (
                  <fieldset key={`${role.id}-${group.label}`} className="rounded-lg bg-white p-4">
                    <legend className="text-sm font-bold text-forest-900">{group.label}</legend>
                    <div className="mt-3 space-y-2">
                      {group.permissions.map((permission) => (
                        <label
                          key={`${role.id}-${permission}`}
                          className="flex cursor-pointer items-center gap-3 text-sm text-admin-muted"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission)}
                            onChange={() => togglePermission(role.id, permission)}
                            className="size-4 rounded border-admin-border text-admin-accent"
                          />
                          {permissionLabel(permission)}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>

              {roleMessage?.message ? (
                <p
                  role={roleMessage.error ? 'alert' : 'status'}
                  className={`mt-4 text-sm font-semibold ${
                    roleMessage.error ? 'text-admin-danger' : 'text-admin-success'
                  }`}
                >
                  {roleMessage.message}
                </p>
              ) : null}
            </details>
          );
        })}
      </div>
    </section>
  );
}
