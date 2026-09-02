import { model, models, Schema, type Model, type Types } from 'mongoose';
import {
  MEDIA_APPROVAL_STATUSES,
  MEDIA_USAGE_TYPES,
  type FocalPoint,
  type MediaApprovalStatus,
  type MediaDimensions,
  type MediaUsage,
} from '@/lib/mediaOptions';

export type MediaAssetDocument = {
  filename: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  mimeType: string;
  altText: string;
  caption: string;
  albumRef: Types.ObjectId | null;
  usage: MediaUsage[];
  approvalStatus: MediaApprovalStatus;
  publishToWebsite: boolean;
  privacyConfirmedNoPeople: boolean;
  privacyConfirmedBy: Types.ObjectId | null;
  privacyConfirmedAt: Date | null;
  focalPoint: FocalPoint;
  dimensions: MediaDimensions;
  archived: boolean;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const focalPointSchema = new Schema<FocalPoint>(
  {
    x: { type: Number, required: true, min: 0, max: 100, default: 50 },
    y: { type: Number, required: true, min: 0, max: 100, default: 50 },
  },
  { _id: false },
);

const dimensionsSchema = new Schema<MediaDimensions>(
  {
    width: { type: Number, required: true, min: 1 },
    height: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const mediaAssetSchema = new Schema<MediaAssetDocument>(
  {
    filename: { type: String, required: true, trim: true, maxlength: 255 },
    cloudinaryUrl: { type: String, required: true, trim: true, maxlength: 2000 },
    cloudinaryPublicId: { type: String, required: true, unique: true, trim: true, maxlength: 500 },
    mimeType: { type: String, required: true, trim: true, maxlength: 120 },
    altText: { type: String, required: true, trim: true, maxlength: 300 },
    caption: { type: String, trim: true, maxlength: 1000, default: '' },
    albumRef: { type: Schema.Types.ObjectId, ref: 'Album', default: null, index: true },
    usage: [{ type: String, enum: MEDIA_USAGE_TYPES }],
    approvalStatus: {
      type: String,
      enum: MEDIA_APPROVAL_STATUSES,
      required: true,
      default: 'draft',
      index: true,
    },
    publishToWebsite: { type: Boolean, default: false, index: true },
    privacyConfirmedNoPeople: { type: Boolean, default: false },
    privacyConfirmedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    privacyConfirmedAt: { type: Date, default: null },
    focalPoint: { type: focalPointSchema, required: true, default: () => ({ x: 50, y: 50 }) },
    dimensions: { type: dimensionsSchema, required: true },
    archived: { type: Boolean, default: false, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

mediaAssetSchema.pre('validate', function enforceMediaPrivacyApproval() {
  if (this.publishToWebsite && this.approvalStatus !== 'approved') {
    this.invalidate('publishToWebsite', 'Published media must be approved');
  }

  if (this.privacyConfirmedNoPeople && (!this.privacyConfirmedBy || !this.privacyConfirmedAt)) {
    this.invalidate('privacyConfirmedBy', 'Privacy confirmation requires an actor and timestamp');
  }
});

mediaAssetSchema.index({ approvalStatus: 1, publishToWebsite: 1, archived: 1 });
mediaAssetSchema.index({ usage: 1, albumRef: 1 });

export const MediaAsset =
  (models.MediaAsset as Model<MediaAssetDocument> | undefined) ??
  model<MediaAssetDocument>('MediaAsset', mediaAssetSchema);
