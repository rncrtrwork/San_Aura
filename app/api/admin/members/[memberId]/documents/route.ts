import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { CLOUDINARY_FOLDERS, isCloudinaryPublicIdInFolder } from '@/lib/cloudinaryFolders';
import {
  type MemberDocumentCreateRequest,
  type MemberDocumentResponse,
} from '@/lib/cloudinaryUpload';
import { DOCUMENT_TYPES, documentTracksExpiry, type DocumentType } from '@/lib/documentOptions';
import { Document } from '@/models/Document';
import { Member } from '@/models/Member';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ memberId: string }>;
};

function isDocumentType(value: string): value is DocumentType {
  return DOCUMENT_TYPES.some((type) => type === value);
}

function validateDocument(body: MemberDocumentCreateRequest): string | null {
  if (
    !body ||
    typeof body.type !== 'string' ||
    typeof body.cloudinaryUrl !== 'string' ||
    typeof body.cloudinaryPublicId !== 'string' ||
    typeof body.originalFilename !== 'string' ||
    typeof body.mimeType !== 'string' ||
    (body.expiresAt !== null && typeof body.expiresAt !== 'string')
  ) {
    return 'Document details are incomplete or malformed.';
  }
  if (!isDocumentType(body.type)) {
    return 'Select a valid document type.';
  }
  if (documentTracksExpiry(body.type) && !body.expiresAt) {
    return 'An expiration date is required for insurance and rabies records.';
  }
  if (
    !body.cloudinaryUrl.startsWith('https://res.cloudinary.com/') ||
    !isCloudinaryPublicIdInFolder(body.cloudinaryPublicId, CLOUDINARY_FOLDERS.memberDocuments)
  ) {
    return 'The uploaded document location is invalid.';
  }
  if (
    !body.originalFilename ||
    body.originalFilename.length > 255 ||
    !body.mimeType ||
    body.mimeType.length > 120
  ) {
    return 'The uploaded file metadata is invalid.';
  }
  if (body.expiresAt && Number.isNaN(Date.parse(body.expiresAt))) {
    return 'Enter a valid expiration date.';
  }
  return null;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'members.write');
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { memberId } = await context.params;
  if (!Types.ObjectId.isValid(memberId)) {
    return NextResponse.json<MemberDocumentResponse>(
      { message: 'Member not found.' },
      { status: 404 },
    );
  }

  let body: MemberDocumentCreateRequest;
  try {
    body = (await request.json()) as MemberDocumentCreateRequest;
  } catch {
    return NextResponse.json<MemberDocumentResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validationMessage = validateDocument(body);
  if (validationMessage) {
    return NextResponse.json<MemberDocumentResponse>(
      { message: validationMessage },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const memberExists = await Member.exists({ _id: memberId });
  if (!memberExists) {
    return NextResponse.json<MemberDocumentResponse>(
      { message: 'Member not found.' },
      { status: 404 },
    );
  }

  const document = await Document.create({
    ownerType: 'Member',
    ownerId: memberId,
    type: body.type,
    cloudinaryUrl: body.cloudinaryUrl,
    cloudinaryPublicId: body.cloudinaryPublicId,
    originalFilename: body.originalFilename,
    mimeType: body.mimeType,
    uploadedBy: authorization.staff.userId,
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
  });

  await logActivity({
    actorId: authorization.staff.userId,
    action: 'create',
    entityType: 'Document',
    entityId: document._id,
    afterSnapshot: { ownerId: memberId, type: document.type, filename: document.originalFilename },
  });

  return NextResponse.json<MemberDocumentResponse>(
    {
      document: {
        id: document._id.toString(),
        type: document.type,
        url: document.cloudinaryUrl,
        filename: document.originalFilename,
        mimeType: document.mimeType,
        uploadedAt: document.uploadedAt.toISOString(),
        expiresAt: document.expiresAt?.toISOString() ?? null,
      },
    },
    { status: 201 },
  );
}
