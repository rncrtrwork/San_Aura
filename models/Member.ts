import { model, models, Schema, type Model, type Types } from 'mongoose';

export const MEMBERSHIP_TIERS = ['2850', '2000', '1250', '500'] as const;
export const MEMBER_STATUSES = ['active', 'probationary', 'hiatus', 'inactive'] as const;
export const ELECTRIC_BILLING_MODES = ['flat25', 'flat15', 'kwh', 'weekly'] as const;

export type MembershipTier = (typeof MEMBERSHIP_TIERS)[number];
export type MemberStatus = (typeof MEMBER_STATUSES)[number];
export type ElectricBillingMode = (typeof ELECTRIC_BILLING_MODES)[number];

export type VehicleInfo = {
  make: string;
  model: string;
  year: number | null;
  plate: string;
  state: string;
};

export type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
};

export type PartyLink = {
  entityType: 'Member' | 'Guest';
  entityId: Types.ObjectId;
};

export type MemberDocument = {
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicleInfo: VehicleInfo[];
  membershipTier: MembershipTier;
  status: MemberStatus;
  renewalMonth: number;
  joinDate: Date;
  emergencyContact: EmergencyContact | null;
  electricBillingMode: ElectricBillingMode | null;
  assignedSiteId: Types.ObjectId | null;
  partyLinks: PartyLink[];
  staffNotes: string;
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

const emergencyContactSchema = new Schema<EmergencyContact>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    relationship: { type: String, trim: true, maxlength: 80, default: '' },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
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

const memberSchema = new Schema<MemberDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120, index: true },
    email: { type: String, trim: true, lowercase: true, maxlength: 254, default: '' },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    address: { type: String, trim: true, maxlength: 300, default: '' },
    vehicleInfo: { type: [vehicleInfoSchema], default: [] },
    membershipTier: { type: String, enum: MEMBERSHIP_TIERS, required: true, index: true },
    status: { type: String, enum: MEMBER_STATUSES, required: true, default: 'active', index: true },
    renewalMonth: { type: Number, required: true, min: 1, max: 12, index: true },
    joinDate: { type: Date, required: true, default: Date.now },
    emergencyContact: { type: emergencyContactSchema, default: null },
    electricBillingMode: { type: String, enum: ELECTRIC_BILLING_MODES, default: null },
    assignedSiteId: { type: Schema.Types.ObjectId, ref: 'Site', default: null, index: true },
    partyLinks: { type: [partyLinkSchema], default: [] },
    staffNotes: { type: String, maxlength: 10000, default: '', select: false },
  },
  { timestamps: true },
);

memberSchema.index({ status: 1, membershipTier: 1, renewalMonth: 1 });
memberSchema.index({ email: 1 }, { sparse: true });

export const Member =
  (models.Member as Model<MemberDocument> | undefined) ??
  model<MemberDocument>('Member', memberSchema);
