import type { DocumentType } from '@/lib/documentOptions';

export type CloudinarySignableValue = string | number | boolean;

export type CloudinaryWidgetConfig = {
  cloudName?: string;
  apiKey?: string;
  message?: string;
};

export type CloudinarySignatureRequest = {
  paramsToSign: Record<string, CloudinarySignableValue>;
};

export type CloudinarySignatureResponse = {
  signature?: string;
  message?: string;
};

export type MemberDocumentCreateRequest = {
  type: DocumentType;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  originalFilename: string;
  mimeType: string;
  expiresAt: string | null;
};

export type MemberDocumentResponse = {
  document?: {
    id: string;
    type: DocumentType;
    url: string;
    filename: string;
    mimeType: string;
    uploadedAt: string;
    expiresAt: string | null;
  };
  message?: string;
};
