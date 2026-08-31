import { model, models, Schema, type Model, type Types } from 'mongoose';
import { ELECTRIC_BILLING_MODES, type ElectricBillingMode } from '@/models/Member';

export type ElectricReadingDocument = {
  siteRef: Types.ObjectId | null;
  memberRef: Types.ObjectId | null;
  previousReadingRef: Types.ObjectId | null;
  meterValue: number;
  readingDate: Date;
  kwhUsed: number;
  enteredBy: Types.ObjectId;
  billingMode: ElectricBillingMode;
  resultingCharge: number;
  createdAt: Date;
  updatedAt: Date;
};

const electricReadingSchema = new Schema<ElectricReadingDocument>(
  {
    siteRef: { type: Schema.Types.ObjectId, ref: 'Site', default: null, index: true },
    memberRef: { type: Schema.Types.ObjectId, ref: 'Member', default: null, index: true },
    previousReadingRef: { type: Schema.Types.ObjectId, ref: 'ElectricReading', default: null },
    meterValue: { type: Number, required: true, min: 0 },
    readingDate: { type: Date, required: true, default: Date.now, index: true },
    kwhUsed: { type: Number, required: true, min: 0, default: 0 },
    enteredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    billingMode: { type: String, enum: ELECTRIC_BILLING_MODES, required: true },
    resultingCharge: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true },
);

electricReadingSchema.pre('validate', function validateReadingOwner() {
  if (!this.siteRef && !this.memberRef) {
    this.invalidate('memberRef', 'A site or member reference is required');
  }
});

electricReadingSchema.index({ siteRef: 1, readingDate: -1 });
electricReadingSchema.index({ memberRef: 1, readingDate: -1 });

export const ElectricReading =
  (models.ElectricReading as Model<ElectricReadingDocument> | undefined) ??
  model<ElectricReadingDocument>('ElectricReading', electricReadingSchema);
