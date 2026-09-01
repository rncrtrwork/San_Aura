import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { SettingsOverview } from '@/lib/settingsManager';

type StaffAccessSummaryProps = {
  staff: SettingsOverview['staff'];
};

export function StaffAccessSummary({ staff }: StaffAccessSummaryProps) {
  return (
    <section className="mt-6 rounded-xl border border-admin-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Staff access
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">Role permission summary</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">
            Review current roles before opening the permission checklist editor in the next task.
          </p>
        </div>
        <Link
          href="/admin/settings?tab=staff-roles"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-admin-accent px-4 text-sm font-bold text-admin-accent hover:bg-admin-accent hover:text-white"
        >
          <ShieldCheck aria-hidden="true" className="size-4" />
          Manage Roles
        </Link>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-admin-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-alt text-xs uppercase tracking-[0.12em] text-admin-muted">
            <tr>
              <th scope="col" className="px-4 py-3">
                Role
              </th>
              <th scope="col" className="px-4 py-3">
                Permissions
              </th>
              <th scope="col" className="px-4 py-3">
                Access state
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border bg-white">
            {staff.roles.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-5 text-admin-muted">
                  No roles have been seeded yet. Run the role seed before assigning staff access.
                </td>
              </tr>
            ) : (
              staff.roles.map((role) => (
                <tr key={role.id}>
                  <td className="px-4 py-3 font-bold text-forest-900">{role.name}</td>
                  <td className="px-4 py-3 text-admin-muted">{role.permissionCount}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-admin-success/10 px-3 py-1 text-xs font-bold text-admin-success">
                      Assignable
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs font-semibold text-admin-muted">
        {staff.activeStaffCount} active staff accounts can be governed by these roles.
      </p>
    </section>
  );
}
