import { model, models, Schema, type Model } from 'mongoose';

export type PropertyAddress = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type PrivacySettings = {
  photographyProhibited: boolean;
  videoProhibited: boolean;
  showPrivacyNoticeAtBooking: boolean;
};

export type NotificationSettings = {
  newReservation: boolean;
  cancellation: boolean;
  paymentRecorded: boolean;
  arrivalReminder: boolean;
};

export type PropertySettingsDocument = {
  key: 'property';
  resortName: string;
  logoUrl: string;
  logoPublicId: string;
  address: PropertyAddress;
  phone: string;
  email: string;
  timezone: string;
  checkInTime: string;
  checkOutTime: string;
  keyReturnTime: string;
  cancellationWindowDays: number;
  depositRequirementPercent: number;
  minimumAge: number;
  defaultMinimumStay: number;
  openYearRound: boolean;
  taxRatePercent: number;
  currency: string;
  dateFormat: string;
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  paypalMeUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

const propertyAddressSchema = new Schema<PropertyAddress>(
  {
    street: { type: String, required: true, trim: true, maxlength: 200 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    postalCode: { type: String, required: true, trim: true, maxlength: 20 },
    country: { type: String, required: true, trim: true, maxlength: 100, default: 'United States' },
  },
  { _id: false },
);

const privacySettingsSchema = new Schema<PrivacySettings>(
  {
    photographyProhibited: { type: Boolean, default: true },
    videoProhibited: { type: Boolean, default: true },
    showPrivacyNoticeAtBooking: { type: Boolean, default: true },
  },
  { _id: false },
);

const notificationSettingsSchema = new Schema<NotificationSettings>(
  {
    newReservation: { type: Boolean, default: true },
    cancellation: { type: Boolean, default: true },
    paymentRecorded: { type: Boolean, default: true },
    arrivalReminder: { type: Boolean, default: true },
  },
  { _id: false },
);

const propertySettingsSchema = new Schema<PropertySettingsDocument>(
  {
    key: { type: String, enum: ['property'], default: 'property', unique: true, immutable: true },
    resortName: { type: String, required: true, trim: true, maxlength: 160 },
    logoUrl: { type: String, trim: true, maxlength: 2000, default: '' },
    logoPublicId: { type: String, trim: true, maxlength: 500, default: '' },
    address: { type: propertyAddressSchema, required: true },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    timezone: { type: String, required: true, trim: true, maxlength: 100 },
    checkInTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    checkOutTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    keyReturnTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    cancellationWindowDays: { type: Number, required: true, min: 0 },
    depositRequirementPercent: { type: Number, required: true, min: 0, max: 100 },
    minimumAge: { type: Number, required: true, min: 18, default: 21 },
    defaultMinimumStay: { type: Number, required: true, min: 1, default: 1 },
    openYearRound: { type: Boolean, default: true },
    taxRatePercent: { type: Number, required: true, min: 0, max: 100, default: 0 },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
      default: 'USD',
    },
    dateFormat: { type: String, required: true, trim: true, maxlength: 30, default: 'MM/DD/YYYY' },
    privacy: { type: privacySettingsSchema, required: true, default: () => ({}) },
    notifications: { type: notificationSettingsSchema, required: true, default: () => ({}) },
    paypalMeUrl: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  { timestamps: true },
);

export const PropertySettings =
  (models.PropertySettings as Model<PropertySettingsDocument> | undefined) ??
  model<PropertySettingsDocument>('PropertySettings', propertySettingsSchema);
