import { model, models, Schema, type Model, type Types } from 'mongoose';
import {
  DOCUMENT_OWNER_TYPES,
  DOCUMENT_TYPES,
  type DocumentOwnerType,
  type DocumentType,
} from '@/lib/documentOptions';

export {
  DOCUMENT_OWNER_TYPES,
  DOCUMENT_TYPES,
  type DocumentOwnerType,
  type DocumentType,
} from '@/lib/documentOptions';

export type DocumentRecord = {
  ownerType: DocumentOwnerType;
  ownerId: Types.ObjectId;
  type: DocumentType;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  originalFilename: string;
  mimeType: string;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const documentSchema = new Schema<DocumentRecord>(
  {
    ownerType: { type: String, enum: DOCUMENT_OWNER_TYPES, required: true },
    ownerId: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, enum: DOCUMENT_TYPES, required: true },
    cloudinaryUrl: { type: String, required: true, trim: true, maxlength: 2000 },
    cloudinaryPublicId: { type: String, required: true, trim: true, maxlength: 500 },
    originalFilename: { type: String, required: true, trim: true, maxlength: 255 },
    mimeType: { type: String, required: true, trim: true, maxlength: 120 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

documentSchema.index({ ownerType: 1, ownerId: 1, type: 1 });
documentSchema.index({ expiresAt: 1 }, { sparse: true });

export const Document =
  (models.Document as Model<DocumentRecord> | undefined) ??
  model<DocumentRecord>('Document', documentSchema);
