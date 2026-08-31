import { model, models, Schema, type Model, type Types } from 'mongoose';

export const PAYMENT_TYPES = ['dues', 'electric', 'day-fee', 'cabin', 'rv', 'addon'] as const;
export const PAYMENT_METHODS = ['cash', 'check', 'paypal-external', 'manual-adjustment'] as const;
export const LEDGER_ENTRY_KINDS = ['charge', 'payment', 'credit'] as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type LedgerEntryKind = (typeof LEDGER_ENTRY_KINDS)[number];

export type AppliesToPeriod = {
  start: Date;
  end: Date;
};

export type PaymentDocument = {
  reservationRef: Types.ObjectId | null;
  memberRef: Types.ObjectId | null;
  amount: number;
  entryKind: LedgerEntryKind;
  type: PaymentType;
  method: PaymentMethod;
  externalReference: string;
  recordedBy: Types.ObjectId;
  date: Date;
  appliesToPeriod: AppliesToPeriod | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

const appliesToPeriodSchema = new Schema<AppliesToPeriod>(
  {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  { _id: false },
);

const paymentSchema = new Schema<PaymentDocument>(
  {
    reservationRef: { type: Schema.Types.ObjectId, ref: 'Reservation', default: null, index: true },
    memberRef: { type: Schema.Types.ObjectId, ref: 'Member', default: null, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    entryKind: { type: String, enum: LEDGER_ENTRY_KINDS, required: true, default: 'payment' },
    type: { type: String, enum: PAYMENT_TYPES, required: true, index: true },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    externalReference: { type: String, trim: true, maxlength: 200, default: '' },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true, default: Date.now, index: true },
    appliesToPeriod: { type: appliesToPeriodSchema, default: null },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  { timestamps: true },
);

paymentSchema.pre('validate', function validatePaymentReferences() {
  if (!this.reservationRef && !this.memberRef) {
    this.invalidate('memberRef', 'A reservation or member reference is required');
  }

  if (this.appliesToPeriod && this.appliesToPeriod.end < this.appliesToPeriod.start) {
    this.invalidate('appliesToPeriod.end', 'Period end must be on or after period start');
  }
});

paymentSchema.index({ memberRef: 1, date: -1 });
paymentSchema.index({ reservationRef: 1, date: -1 });

export const Payment =
  (models.Payment as Model<PaymentDocument> | undefined) ??
  model<PaymentDocument>('Payment', paymentSchema);
