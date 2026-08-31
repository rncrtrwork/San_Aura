import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import {
  ActivityLog,
  type ActivityAction,
  type ActivityEntityType,
  type ActivitySnapshot,
} from '@/models/ActivityLog';

export type LogActivityInput = {
  actorId: string | Types.ObjectId;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId: string | Types.ObjectId;
  beforeSnapshot?: ActivitySnapshot | null;
  afterSnapshot?: ActivitySnapshot | null;
};

export async function logActivity(input: LogActivityInput): Promise<void> {
  await connectToDatabase();
  await ActivityLog.create({
    actorId: input.actorId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    beforeSnapshot: input.beforeSnapshot ?? null,
    afterSnapshot: input.afterSnapshot ?? null,
  });
}
