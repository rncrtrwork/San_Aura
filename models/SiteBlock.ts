import { model, models, Schema, type Model, type Types } from 'mongoose';
import { SITE_BLOCK_KINDS, type SiteBlockKind } from '@/lib/siteBlockOptions';

export type SiteBlockDocument = {
  siteRef: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  kind: SiteBlockKind;
  note: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const siteBlockSchema = new Schema<SiteBlockDocument>(
  {
    siteRef: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    kind: { type: String, enum: SITE_BLOCK_KINDS, required: true, default: 'blocked' },
    note: { type: String, trim: true, maxlength: 2000, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

siteBlockSchema.pre('validate', function validateBlockDates() {
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
});

siteBlockSchema.index({ siteRef: 1, startDate: 1, endDate: 1 });

export const SiteBlock =
  (models.SiteBlock as Model<SiteBlockDocument> | undefined) ??
  model<SiteBlockDocument>('SiteBlock', siteBlockSchema);
