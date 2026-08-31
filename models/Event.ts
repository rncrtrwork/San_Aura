import { model, models, Schema, type Model } from 'mongoose';

export const EVENT_STATUSES = ['draft', 'scheduled', 'published', 'past'] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export type EventDocument = {
  title: string;
  startsAt: Date;
  endsAt: Date;
  location: string;
  capacity: number | null;
  registrationRequired: boolean;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  status: EventStatus;
  featureOnHomepage: boolean;
  sendReminder: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const eventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160, index: true },
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true, index: true },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    capacity: { type: Number, min: 1, default: null },
    registrationRequired: { type: Boolean, default: false },
    description: { type: String, required: true, maxlength: 10000 },
    imageUrl: { type: String, trim: true, maxlength: 2000, default: '' },
    imagePublicId: { type: String, trim: true, maxlength: 500, default: '' },
    status: { type: String, enum: EVENT_STATUSES, required: true, default: 'draft', index: true },
    featureOnHomepage: { type: Boolean, default: false, index: true },
    sendReminder: { type: Boolean, default: false },
  },
  { timestamps: true },
);

eventSchema.pre('validate', function validateEventDates() {
  if (this.startsAt && this.endsAt && this.endsAt < this.startsAt) {
    this.invalidate('endsAt', 'Event end must be on or after its start');
  }
});

eventSchema.index({ status: 1, startsAt: 1 });

export const Event =
  (models.Event as Model<EventDocument> | undefined) ?? model<EventDocument>('Event', eventSchema);
