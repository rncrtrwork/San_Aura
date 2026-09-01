import { model, models, Schema, type Model, type Types } from 'mongoose';
import {
  MEMBER_UPDATE_REQUEST_TOPICS,
  type MemberUpdateRequestTopic,
} from '@/lib/memberUpdateRequests';

export const MEMBER_UPDATE_REQUEST_STATUSES = ['open', 'reviewed', 'closed'] as const;

export type MemberUpdateRequestStatus = (typeof MEMBER_UPDATE_REQUEST_STATUSES)[number];

export type MemberUpdateRequestDocument = {
  memberRef: Types.ObjectId;
  topic: MemberUpdateRequestTopic;
  message: string;
  status: MemberUpdateRequestStatus;
  createdAt: Date;
  updatedAt: Date;
};

const memberUpdateRequestSchema = new Schema<MemberUpdateRequestDocument>(
  {
    memberRef: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    topic: { type: String, enum: MEMBER_UPDATE_REQUEST_TOPICS, required: true, index: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: MEMBER_UPDATE_REQUEST_STATUSES,
      required: true,
      default: 'open',
      index: true,
    },
  },
  { timestamps: true },
);

memberUpdateRequestSchema.index({ status: 1, createdAt: -1 });
memberUpdateRequestSchema.index({ memberRef: 1, createdAt: -1 });

export const MemberUpdateRequest =
  (models.MemberUpdateRequest as Model<MemberUpdateRequestDocument> | undefined) ??
  model<MemberUpdateRequestDocument>('MemberUpdateRequest', memberUpdateRequestSchema);
