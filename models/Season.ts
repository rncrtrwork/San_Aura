import { model, models, Schema, type Model, type Types } from 'mongoose';

export type SeasonRateOverride = {
  stayTypeRef: Types.ObjectId;
  baseRate: number;
  weekendRate: number;
};

export type SeasonDocument = {
  name: string;
  startsOn: Date;
  endsOn: Date;
  rateOverrides: SeasonRateOverride[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const seasonRateOverrideSchema = new Schema<SeasonRateOverride>(
  {
    stayTypeRef: { type: Schema.Types.ObjectId, ref: 'StayType', required: true },
    baseRate: { type: Number, required: true, min: 0 },
    weekendRate: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const seasonSchema = new Schema<SeasonDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    startsOn: { type: Date, required: true, index: true },
    endsOn: { type: Date, required: true, index: true },
    rateOverrides: { type: [seasonRateOverrideSchema], default: [] },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

seasonSchema.pre('validate', function validateSeasonDates() {
  if (this.startsOn && this.endsOn && this.endsOn < this.startsOn) {
    this.invalidate('endsOn', 'Season end must be on or after its start');
  }
});

seasonSchema.index({ startsOn: 1, endsOn: 1, active: 1 });

export const Season =
  (models.Season as Model<SeasonDocument> | undefined) ??
  model<SeasonDocument>('Season', seasonSchema);
