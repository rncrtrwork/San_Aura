import { Activity, FilePenLine, LogIn, MailCheck, Plus, Send, Trash2 } from 'lucide-react';
import type { RecentActivity as RecentActivityEntry } from '@/server/dashboard/getRecentActivity';

type RecentActivityProps = {
  entries: RecentActivityEntry[];
};

const actionLabels = {
  create: 'created',
  update: 'updated',
  delete: 'deleted',
  'status-change': 'changed the status of',
  publish: 'published',
  login: 'signed in to',
  send: 'sent a confirmation for',
} satisfies Record<RecentActivityEntry['action'], string>;

const actionIcons = {
  create: Plus,
  update: FilePenLine,
  delete: Trash2,
  'status-change': Activity,
  publish: Send,
  login: LogIn,
  send: MailCheck,
} satisfies Record<RecentActivityEntry['action'], typeof Activity>;

function formatEntityType(entityType: RecentActivityEntry['entityType']): string {
  return entityType.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}

function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function RecentActivity({ entries }: RecentActivityProps) {
  return (
    <section className="admin-card p-5 sm:p-6" aria-labelledby="recent-activity-heading">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id="recent-activity-heading" className="text-base font-bold text-forest-900">
            Recent Activity
          </h2>
          <p className="mt-1 text-xs text-admin-muted">Latest staff actions across the resort</p>
        </div>
        <Activity aria-hidden="true" className="size-5 text-admin-accent" />
      </div>

      {entries.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm font-semibold text-forest-900">No staff activity yet</p>
          <p className="mt-1 text-xs text-admin-muted">Recorded actions will appear here.</p>
        </div>
      ) : (
        <ol className="mt-5 grid gap-x-8 gap-y-1 lg:grid-cols-2">
          {entries.map((entry) => {
            const ActionIcon = actionIcons[entry.action];
            return (
              <li
                key={entry.id}
                className="flex gap-3 border-t border-admin-border py-4 first:border-0"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cream-alt text-admin-accent">
                  <ActionIcon aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-forest-900">
                    <span className="font-semibold">{entry.actorName}</span>{' '}
                    {actionLabels[entry.action]} {formatEntityType(entry.entityType)}
                  </p>
                  <p className="mt-1 text-xs text-admin-muted">
                    {formatTimestamp(entry.timestamp)} · Record{' '}
                    {entry.entityId.slice(-6).toUpperCase()}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
