import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import type { DocumentType } from '@/lib/documentOptions';
import { Document } from '@/models/Document';

export type MemberDocumentItem = {
  id: string;
  type: DocumentType;
  url: string;
  filename: string;
  mimeType: string;
  uploadedAt: string;
  expiresAt: string | null;
};

export async function getMemberDocuments(memberId: string): Promise<MemberDocumentItem[]> {
  if (!Types.ObjectId.isValid(memberId)) {
    return [];
  }

  await connectToDatabase();
  const documents = await Document.find({ ownerType: 'Member', ownerId: memberId })
    .select('type cloudinaryUrl originalFilename mimeType uploadedAt expiresAt')
    .sort({ uploadedAt: -1 })
    .lean();

  return documents.map((document) => ({
    id: document._id.toString(),
    type: document.type,
    url: document.cloudinaryUrl,
    filename: document.originalFilename,
    mimeType: document.mimeType,
    uploadedAt: document.uploadedAt.toISOString(),
    expiresAt: document.expiresAt?.toISOString() ?? null,
  }));
}
