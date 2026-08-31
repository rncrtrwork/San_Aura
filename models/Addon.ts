import { model, models, Schema, type Model } from 'mongoose';

export const ADDON_TYPES = ['optional', 'external-partner'] as const;

export type AddonType = (typeof ADDON_TYPES)[number];

export type AddonDocument = {
  name: string;
  description: string;
  type: AddonType;
  price: number;
  partnerUrl: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const addonSchema = new Schema<AddonDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    type: { type: String, enum: ADDON_TYPES, required: true, default: 'optional' },
    price: { type: Number, required: true, min: 0 },
    partnerUrl: { type: String, trim: true, maxlength: 2000, default: '' },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Addon =
  (models.Addon as Model<AddonDocument> | undefined) ?? model<AddonDocument>('Addon', addonSchema);
