import { Activity, Search } from 'lucide-react';
import { ACTIVITY_ACTIONS, parseActivityLogFilters } from '@/lib/activityLogFilters';
import {
  ACTIVITY_ENTITY_TYPES,
  type ActivityAction,
  type ActivitySnapshot,
} from '@/models/ActivityLog';
import { getActivityLogEntries } from '@/server/activity/getActivityLogEntries';
import { requirePagePermission } from '@/server/auth/pageAuthorization';

export const dynamic = 'force-dynamic';

type ActivityLogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const actionLabels = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  'status-change': 'Status changed',
  publish: 'Published',
  login: 'Signed in',
  send: 'Sent',
} satisfies Record<ActivityAction, string>;

function formatEntityType(entityType: string): string {
  return entityType.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function snapshotSummary(snapshot: ActivitySnapshot | null): string {
  if (!snapshot) return 'No snapshot';
  const keys = Object.keys(snapshot);
  return keys.length > 0 ? keys.slice(0, 5).join(', ') : 'No snapshot';
}

export default async function ActivityLogPage({ searchParams }: ActivityLogPageProps) {
  await requirePagePermission('activity.read');
  const params = await searchParams;
  const filters = parseActivityLogFilters(params);
  const entries = await getActivityLogEntries(filters);

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
          Audit trail
        </p>
        <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">Activity Log</h1>
        <p className="mt-2 max-w-2xl text-sm text-admin-muted">
          Search and filter staff actions across reservations, members, content, media, settings,
          and system administration.
        </p>
      </header>

      <section className="admin-card p-5" aria-labelledby="activity-filters-heading">
        <h2 id="activity-filters-heading" className="font-serif text-2xl text-forest-900">
          Filters
        </h2>
        <form className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem_13rem_auto]">
          <label className="text-sm font-semibold text-forest-900">
            Search
            <span className="relative mt-1.5 block">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted"
              />
              <input
                name="q"
                defaultValue={filters.query}
                maxLength={120}
                className="h-11 w-full rounded-lg border border-admin-border bg-white pl-10 pr-3 text-sm text-forest-900"
                placeholder="Actor, action, entity, or snapshot"
              />
            </span>
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Action
            <select
              name="action"
              defaultValue={filters.action}
              className="mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
            >
              <option value="all">All actions</option>
              {ACTIVITY_ACTIONS.map((action) => (
                <option key={action} value={action}>
                  {actionLabels[action]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Entity
            <select
              name="entityType"
              defaultValue={filters.entityType}
              className="mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
            >
              <option value="all">All entities</option>
              {ACTIVITY_ENTITY_TYPES.map((entityType) => (
                <option key={entityType} value={entityType}>
                  {formatEntityType(entityType)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active"
          >
            <Activity aria-hidden="true" className="size-4" />
            Apply
          </button>
        </form>
      </section>

      <section className="admin-card overflow-hidden" aria-labelledby="activity-log-heading">
        <div className="flex items-center justify-between gap-4 border-b border-admin-border p-5">
          <div>
            <h2 id="activity-log-heading" className="font-serif text-2xl text-forest-900">
              Matching activity
            </h2>
            <p className="mt-1 text-sm text-admin-muted">{entries.length} entries shown</p>
          </div>
          <Activity aria-hidden="true" className="size-5 text-admin-accent" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-cream-alt text-xs uppercase tracking-[0.12em] text-admin-muted">
              <tr>
                <th scope="col" className="px-5 py-3">
                  When
                </th>
                <th scope="col" className="px-5 py-3">
                  Actor
                </th>
                <th scope="col" className="px-5 py-3">
                  Action
                </th>
                <th scope="col" className="px-5 py-3">
                  Entity
                </th>
                <th scope="col" className="px-5 py-3">
                  Snapshot
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border bg-white">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-admin-muted">
                    No activity matches these filters.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-5 py-4 text-admin-muted">
                      {formatTimestamp(entry.timestamp)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="block font-bold text-forest-900">{entry.actorName}</span>
                      <span className="mt-1 block text-xs text-admin-muted">
                        {entry.actorEmail}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-cream-alt px-3 py-1 text-xs font-bold text-forest-900">
                        {actionLabels[entry.action]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-admin-muted">
                      <span className="block font-semibold text-forest-900">
                        {formatEntityType(entry.entityType)}
                      </span>
                      <span className="mt-1 block text-xs">
                        Record {entry.entityId.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-admin-muted">
                      Before: {snapshotSummary(entry.beforeSnapshot)}
                      <br />
                      After: {snapshotSummary(entry.afterSnapshot)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
