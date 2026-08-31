import { model, models, Schema, type Model } from 'mongoose';
import {
  contentRevisionSchema,
  MANAGED_CONTENT_STATUSES,
  relatedLinkSchema,
  type ContentRevision,
  type ManagedContentStatus,
  type RelatedLink,
} from '@/models/managedContentFields';

export type FAQItemDocument = {
  category: string;
  question: string;
  slug: string;
  answer: string;
  relatedLinks: RelatedLink[];
  displayOrder: number;
  status: ManagedContentStatus;
  featured: boolean;
  seoTitle: string;
  metaDescription: string;
  revisionHistory: ContentRevision[];
  createdAt: Date;
  updatedAt: Date;
};

const faqItemSchema = new Schema<FAQItemDocument>(
  {
    category: { type: String, required: true, trim: true, maxlength: 120, index: true },
    question: { type: String, required: true, trim: true, maxlength: 300 },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
    },
    answer: { type: String, required: true, maxlength: 50000 },
    relatedLinks: { type: [relatedLinkSchema], default: [] },
    displayOrder: { type: Number, required: true, min: 0, default: 0 },
    status: { type: String, enum: MANAGED_CONTENT_STATUSES, default: 'draft', index: true },
    featured: { type: Boolean, default: false, index: true },
    seoTitle: { type: String, trim: true, maxlength: 60, default: '' },
    metaDescription: { type: String, trim: true, maxlength: 160, default: '' },
    revisionHistory: { type: [contentRevisionSchema], default: [] },
  },
  { timestamps: true },
);

faqItemSchema.index({ category: 1, displayOrder: 1 });

export const FAQItem =
  (models.FAQItem as Model<FAQItemDocument> | undefined) ??
  model<FAQItemDocument>('FAQItem', faqItemSchema);
