import { connectToDatabase } from '@/lib/db';
import { ActivityLog, type ActivityAction, type ActivityEntityType } from '@/models/ActivityLog';
import { User } from '@/models/User';

export type RecentActivity = {
  id: string;
  actorName: string;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId: string;
  timestamp: string;
};

export async function getRecentActivity(limit = 6): Promise<RecentActivity[]> {
  await connectToDatabase();

  const entries = await ActivityLog.find()
    .select('actorId action entityType entityId timestamp')
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
  const actorIds = Array.from(new Set(entries.map((entry) => entry.actorId.toString())));
  const actors = await User.find({ _id: { $in: actorIds } })
    .select('_id name')
    .lean();
  const actorNames = new Map(
    actors.map((actor): [string, string] => [actor._id.toString(), actor.name]),
  );

  return entries.map((entry) => ({
    id: entry._id.toString(),
    actorName: actorNames.get(entry.actorId.toString()) ?? 'Former staff member',
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId.toString(),
    timestamp: entry.timestamp.toISOString(),
  }));
}
