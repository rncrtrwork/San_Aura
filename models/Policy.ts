import { model, models, Schema, type Model } from 'mongoose';
import {
  contentRevisionSchema,
  MANAGED_CONTENT_STATUSES,
  relatedLinkSchema,
  type ContentRevision,
  type ManagedContentStatus,
  type RelatedLink,
} from '@/models/managedContentFields';

export type PolicyDocument = {
  category: string;
  title: string;
  slug: string;
  body: string;
  relatedLinks: RelatedLink[];
  displayOrder: number;
  status: ManagedContentStatus;
  seoTitle: string;
  metaDescription: string;
  revisionHistory: ContentRevision[];
  createdAt: Date;
  updatedAt: Date;
};

const policySchema = new Schema<PolicyDocument>(
  {
    category: { type: String, required: true, trim: true, maxlength: 120, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
    },
    body: { type: String, required: true, maxlength: 50000 },
    relatedLinks: { type: [relatedLinkSchema], default: [] },
    displayOrder: { type: Number, required: true, min: 0, default: 0 },
    status: { type: String, enum: MANAGED_CONTENT_STATUSES, default: 'draft', index: true },
    seoTitle: { type: String, trim: true, maxlength: 60, default: '' },
    metaDescription: { type: String, trim: true, maxlength: 160, default: '' },
    revisionHistory: { type: [contentRevisionSchema], default: [] },
  },
  { timestamps: true },
);

policySchema.index({ category: 1, displayOrder: 1 });

export const Policy =
  (models.Policy as Model<PolicyDocument> | undefined) ??
  model<PolicyDocument>('Policy', policySchema);
