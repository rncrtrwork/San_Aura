import { parseActivityLogFilters, type ActivityLogFilters } from '@/lib/activityLogFilters';
import { connectToDatabase } from '@/lib/db';
import {
  ActivityLog,
  type ActivityAction,
  type ActivityEntityType,
  type ActivitySnapshot,
} from '@/models/ActivityLog';
import { User } from '@/models/User';

export type ActivityLogEntry = {
  id: string;
  actorName: string;
  actorEmail: string;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId: string;
  beforeSnapshot: ActivitySnapshot | null;
  afterSnapshot: ActivitySnapshot | null;
  timestamp: string;
};

type ActivityLogEntryLean = {
  _id: { toString(): string };
  actorId: { toString(): string };
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId: { toString(): string };
  beforeSnapshot: ActivitySnapshot | null;
  afterSnapshot: ActivitySnapshot | null;
  timestamp: Date;
};

type ActivityActorLean = {
  _id: { toString(): string };
  name: string;
  email: string;
};

type ActivityLogQuery = {
  action?: ActivityAction;
  entityType?: ActivityEntityType;
};

function entryMatchesQuery(entry: ActivityLogEntry, query: string): boolean {
  if (!query) return true;
  const needle = query.toLowerCase();
  return [
    entry.actorName,
    entry.actorEmail,
    entry.action,
    entry.entityType,
    entry.entityId,
    JSON.stringify(entry.beforeSnapshot ?? {}),
    JSON.stringify(entry.afterSnapshot ?? {}),
  ].some((value) => value.toLowerCase().includes(needle));
}

export async function getActivityLogEntries(
  filters: ActivityLogFilters,
): Promise<ActivityLogEntry[]> {
  await connectToDatabase();
  const query: ActivityLogQuery = {};
  if (filters.action !== 'all') query.action = filters.action;
  if (filters.entityType !== 'all') query.entityType = filters.entityType;

  const entries = await ActivityLog.find(query)
    .sort({ timestamp: -1 })
    .limit(100)
    .lean<ActivityLogEntryLean[]>();
  const actorIds = Array.from(new Set(entries.map((entry) => entry.actorId.toString())));
  const actors = actorIds.length
    ? await User.find({ _id: { $in: actorIds } })
        .select('name email')
        .lean<ActivityActorLean[]>()
    : [];
  const actorsById = new Map(actors.map((actor) => [actor._id.toString(), actor]));
  const mappedEntries = entries.map((entry) => {
    const actor = actorsById.get(entry.actorId.toString());

    return {
      id: entry._id.toString(),
      actorName: actor?.name ?? 'Former staff user',
      actorEmail: actor?.email ?? 'inactive',
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId.toString(),
      beforeSnapshot: entry.beforeSnapshot,
      afterSnapshot: entry.afterSnapshot,
      timestamp: entry.timestamp.toISOString(),
    };
  });

  return mappedEntries.filter((entry) => entryMatchesQuery(entry, filters.query));
}

export async function getActivityLogEntriesFromParams(
  params: Record<string, string | string[] | undefined>,
): Promise<ActivityLogEntry[]> {
  return getActivityLogEntries(parseActivityLogFilters(params));
}
