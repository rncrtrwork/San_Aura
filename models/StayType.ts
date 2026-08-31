import { model, models, Schema, type Model } from 'mongoose';
import { SITE_TYPES, type SiteType } from '@/models/Site';

export type StayTypeDocument = {
  name: string;
  slug: string;
  siteType: SiteType;
  description: string;
  amenities: string[];
  baseRate: number;
  weekendRate: number;
  extraGuestFee: number;
  minimumStay: number;
  cleaningFee: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const stayTypeSchema = new Schema<StayTypeDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
    },
    siteType: { type: String, enum: SITE_TYPES, required: true, index: true },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    amenities: { type: [String], default: [] },
    baseRate: { type: Number, required: true, min: 0 },
    weekendRate: { type: Number, required: true, min: 0 },
    extraGuestFee: { type: Number, required: true, min: 0, default: 0 },
    minimumStay: { type: Number, required: true, min: 1, default: 1 },
    cleaningFee: { type: Number, required: true, min: 0, default: 0 },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const StayType =
  (models.StayType as Model<StayTypeDocument> | undefined) ??
  model<StayTypeDocument>('StayType', stayTypeSchema);
