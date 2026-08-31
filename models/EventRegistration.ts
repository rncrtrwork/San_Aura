import { model, models, Schema, type Model, type Types } from 'mongoose';

export const REGISTRANT_TYPES = ['Member', 'Guest'] as const;

export type RegistrantType = (typeof REGISTRANT_TYPES)[number];

export type EventRegistrationDocument = {
  eventRef: Types.ObjectId;
  registrantType: RegistrantType;
  guestOrMemberRef: Types.ObjectId;
  partySize: number;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const eventRegistrationSchema = new Schema<EventRegistrationDocument>(
  {
    eventRef: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    registrantType: { type: String, enum: REGISTRANT_TYPES, required: true },
    guestOrMemberRef: {
      type: Schema.Types.ObjectId,
      refPath: 'registrantType',
      required: true,
      index: true,
    },
    partySize: { type: Number, required: true, min: 1, max: 100, default: 1 },
    registeredAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

eventRegistrationSchema.index(
  { eventRef: 1, registrantType: 1, guestOrMemberRef: 1 },
  { unique: true },
);

export const EventRegistration =
  (models.EventRegistration as Model<EventRegistrationDocument> | undefined) ??
  model<EventRegistrationDocument>('EventRegistration', eventRegistrationSchema);
