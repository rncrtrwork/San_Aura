import { model, models, Schema, type Model, type Types } from 'mongoose';
import type { PartyLink, VehicleInfo } from '@/models/Member';

export type GuestDocument = {
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicleInfo: VehicleInfo[];
  partyLinks: PartyLink[];
  reservationIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};

const vehicleInfoSchema = new Schema<VehicleInfo>(
  {
    make: { type: String, trim: true, maxlength: 80, default: '' },
    model: { type: String, trim: true, maxlength: 80, default: '' },
    year: { type: Number, min: 1900, max: 2200, default: null },
    plate: { type: String, trim: true, uppercase: true, maxlength: 20, default: '' },
    state: { type: String, trim: true, uppercase: true, maxlength: 20, default: '' },
  },
  { _id: false },
);

const partyLinkSchema = new Schema<PartyLink>(
  {
    entityType: { type: String, enum: ['Member', 'Guest'], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
  },
  { _id: false },
);

const guestSchema = new Schema<GuestDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120, index: true },
    email: { type: String, trim: true, lowercase: true, maxlength: 254, default: '' },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    address: { type: String, trim: true, maxlength: 300, default: '' },
    vehicleInfo: { type: [vehicleInfoSchema], default: [] },
    partyLinks: { type: [partyLinkSchema], default: [] },
    reservationIds: [{ type: Schema.Types.ObjectId, ref: 'Reservation' }],
  },
  { timestamps: true },
);

guestSchema.index({ email: 1 });
guestSchema.index({ phone: 1 });

export const Guest =
  (models.Guest as Model<GuestDocument> | undefined) ?? model<GuestDocument>('Guest', guestSchema);
