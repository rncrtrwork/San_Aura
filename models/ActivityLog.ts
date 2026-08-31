import { model, models, Schema, type Model, type Types } from 'mongoose';

export const ACTIVITY_ENTITY_TYPES = [
  'Member',
  'Document',
  'Guest',
  'Reservation',
  'Payment',
  'ElectricReading',
  'Event',
  'MediaAsset',
  'FAQItem',
  'ResortRule',
  'Policy',
  'Page',
  'PropertySettings',
  'Site',
  'StaffUser',
  'Role',
] as const;

export type ActivityEntityType = (typeof ACTIVITY_ENTITY_TYPES)[number];
export type ActivityAction = 'create' | 'update' | 'delete' | 'status-change' | 'publish' | 'login';

export type SnapshotValue = string | number | boolean | null | Date;

export type ActivitySnapshot = {
  [key: string]: SnapshotValue | SnapshotValue[];
};

export type ActivityLogDocument = {
  actorId: Types.ObjectId;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId: Types.ObjectId;
  beforeSnapshot: ActivitySnapshot | null;
  afterSnapshot: ActivitySnapshot | null;
  timestamp: Date;
};

const activityLogSchema = new Schema<ActivityLogDocument>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'status-change', 'publish', 'login'],
      required: true,
    },
    entityType: { type: String, enum: ACTIVITY_ENTITY_TYPES, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    beforeSnapshot: { type: Schema.Types.Mixed, default: null },
    afterSnapshot: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } },
);

activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });

export const ActivityLog =
  (models.ActivityLog as Model<ActivityLogDocument> | undefined) ??
  model<ActivityLogDocument>('ActivityLog', activityLogSchema);
