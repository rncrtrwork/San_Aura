import { model, models, Schema, type Model } from 'mongoose';

export type VisitorVisitDocument = {
  browserName: string;
  browserVersion: string;
  operatingSystem: string;
  country: string;
  region: string;
  city: string;
  createdAt: Date;
};

const visitorVisitSchema = new Schema<VisitorVisitDocument>(
  {
    browserName: { type: String, required: true, trim: true, maxlength: 80, index: true },
    browserVersion: { type: String, trim: true, maxlength: 40, default: '' },
    operatingSystem: { type: String, required: true, trim: true, maxlength: 80, index: true },
    country: { type: String, required: true, trim: true, maxlength: 80, index: true },
    region: { type: String, required: true, trim: true, maxlength: 120, index: true },
    city: { type: String, required: true, trim: true, maxlength: 120, index: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

visitorVisitSchema.index({ createdAt: -1 });
visitorVisitSchema.index({ country: 1, region: 1, city: 1, createdAt: -1 });

export const VisitorVisit =
  (models.VisitorVisit as Model<VisitorVisitDocument> | undefined) ??
  model<VisitorVisitDocument>('VisitorVisit', visitorVisitSchema);
