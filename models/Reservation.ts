import { model, models, Schema, type Model, type Types } from 'mongoose';

export const RESERVATION_OWNER_TYPES = ['Member', 'Guest'] as const;
export const RESERVATION_PAYMENT_STATUSES = [
  'paid',
  'deposit-due',
  'deposit-paid',
  'unpaid',
] as const;
export const RESERVATION_STATUSES = [
  'pending',
  'confirmed',
  'checked-in',
  'completed',
  'cancelled',
] as const;

export type ReservationOwnerType = (typeof RESERVATION_OWNER_TYPES)[number];
export type ReservationPaymentStatus = (typeof RESERVATION_PAYMENT_STATUSES)[number];
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export type ReservationDocument = {
  guestOrMemberType: ReservationOwnerType;
  guestOrMemberRef: Types.ObjectId;
  siteRef: Types.ObjectId;
  stayType: Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  totalAmount: number;
  paymentStatus: ReservationPaymentStatus;
  paymentMethodNote: string;
  source: string;
  internalNotes: string;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
};

const reservationSchema = new Schema<ReservationDocument>(
  {
    guestOrMemberType: { type: String, enum: RESERVATION_OWNER_TYPES, required: true, index: true },
    guestOrMemberRef: {
      type: Schema.Types.ObjectId,
      refPath: 'guestOrMemberType',
      required: true,
      index: true,
    },
    siteRef: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    stayType: { type: Schema.Types.ObjectId, ref: 'StayType', required: true, index: true },
    checkIn: { type: Date, required: true, index: true },
    checkOut: { type: Date, required: true, index: true },
    guestsCount: { type: Number, required: true, min: 1, max: 100 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: RESERVATION_PAYMENT_STATUSES,
      required: true,
      default: 'unpaid',
      index: true,
    },
    paymentMethodNote: { type: String, trim: true, maxlength: 500, default: '' },
    source: { type: String, required: true, trim: true, maxlength: 80, default: 'staff' },
    internalNotes: { type: String, trim: true, maxlength: 5000, default: '', select: false },
    status: {
      type: String,
      enum: RESERVATION_STATUSES,
      required: true,
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true },
);

reservationSchema.pre('validate', function validateReservationDates() {
  if (this.checkIn && this.checkOut && this.checkOut <= this.checkIn) {
    this.invalidate('checkOut', 'Check-out must be after check-in');
  }
});

reservationSchema.index({ siteRef: 1, checkIn: 1, checkOut: 1, status: 1 });
reservationSchema.index({ status: 1, checkIn: 1 });

export const Reservation =
  (models.Reservation as Model<ReservationDocument> | undefined) ??
  model<ReservationDocument>('Reservation', reservationSchema);
