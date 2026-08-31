import { model, models, Schema, type Model } from 'mongoose';

export const SITE_TYPES = ['cabin', 'rv', 'tent'] as const;
export const SITE_STATUSES = ['available', 'occupied', 'maintenance', 'blocked'] as const;

export type SiteType = (typeof SITE_TYPES)[number];
export type SiteStatus = (typeof SITE_STATUSES)[number];

export type MapPosition = {
  x: number;
  y: number;
};

export type SiteDocument = {
  code: string;
  type: SiteType;
  area: string;
  amenities: string[];
  status: SiteStatus;
  maintenanceNote: string;
  length: number | null;
  hookups: string[];
  mapPosition: MapPosition | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const mapPositionSchema = new Schema<MapPosition>(
  {
    x: { type: Number, required: true, min: 0, max: 100 },
    y: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false },
);

const siteSchema = new Schema<SiteDocument>(
  {
    code: { type: String, required: true, unique: true, trim: true, maxlength: 40 },
    type: { type: String, enum: SITE_TYPES, required: true, index: true },
    area: { type: String, required: true, trim: true, maxlength: 100, index: true },
    amenities: { type: [String], default: [] },
    status: {
      type: String,
      enum: SITE_STATUSES,
      required: true,
      default: 'available',
      index: true,
    },
    maintenanceNote: { type: String, trim: true, maxlength: 2000, default: '' },
    length: { type: Number, min: 0, default: null },
    hookups: { type: [String], default: [] },
    mapPosition: { type: mapPositionSchema, default: null },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

siteSchema.index({ type: 1, status: 1, active: 1 });

export const Site =
  (models.Site as Model<SiteDocument> | undefined) ?? model<SiteDocument>('Site', siteSchema);
