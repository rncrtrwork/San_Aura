import { Schema, type Types } from 'mongoose';

export const MANAGED_CONTENT_STATUSES = ['draft', 'published'] as const;

export type ManagedContentStatus = (typeof MANAGED_CONTENT_STATUSES)[number];

export type RelatedLink = {
  label: string;
  url: string;
};

export type ContentRevision = {
  title: string;
  body: string;
  editedBy: Types.ObjectId;
  editedAt: Date;
};

export const relatedLinkSchema = new Schema<RelatedLink>(
  {
    label: { type: String, required: true, trim: true, maxlength: 120 },
    url: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { _id: false },
);

export const contentRevisionSchema = new Schema<ContentRevision>(
  {
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 50000 },
    editedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    editedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);
