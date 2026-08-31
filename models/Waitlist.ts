import { model, models, Schema, type Model, type Types } from 'mongoose';
import { WAITLIST_STATUSES, type WaitlistStatus } from '@/lib/waitlistOptions';

export { WAITLIST_STATUSES, type WaitlistStatus } from '@/lib/waitlistOptions';

export type WaitlistContact = {
  name: string;
  email: string;
  phone: string;
};

export type WaitlistDocument = {
  requestedCheckIn: Date;
  requestedCheckOut: Date;
  stayTypeRef: Types.ObjectId;
  siteCount: number;
  contact: WaitlistContact;
  status: WaitlistStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

const waitlistContactSchema = new Schema<WaitlistContact>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
  },
  { _id: false },
);

const waitlistSchema = new Schema<WaitlistDocument>(
  {
    requestedCheckIn: { type: Date, required: true, index: true },
    requestedCheckOut: { type: Date, required: true, index: true },
    stayTypeRef: { type: Schema.Types.ObjectId, ref: 'StayType', required: true, index: true },
    siteCount: { type: Number, required: true, min: 1, default: 1 },
    contact: { type: waitlistContactSchema, required: true },
    status: {
      type: String,
      enum: WAITLIST_STATUSES,
      required: true,
      default: 'pending',
      index: true,
    },
    notes: { type: String, trim: true, maxlength: 3000, default: '' },
  },
  { timestamps: true },
);

waitlistSchema.pre('validate', function validateWaitlistDates() {
  if (
    this.requestedCheckIn &&
    this.requestedCheckOut &&
    this.requestedCheckOut <= this.requestedCheckIn
  ) {
    this.invalidate('requestedCheckOut', 'Requested check-out must be after check-in');
  }
});

waitlistSchema.index({ status: 1, requestedCheckIn: 1, requestedCheckOut: 1 });

export const Waitlist =
  (models.Waitlist as Model<WaitlistDocument> | undefined) ??
  model<WaitlistDocument>('Waitlist', waitlistSchema);
