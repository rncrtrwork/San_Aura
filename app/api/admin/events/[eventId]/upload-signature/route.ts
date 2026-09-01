import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { getCloudinary } from '@/lib/cloudinary';
import type {
  CloudinarySignatureRequest,
  CloudinarySignatureResponse,
  CloudinaryWidgetConfig,
} from '@/lib/cloudinaryUpload';
import { connectToDatabase } from '@/lib/db';
import { Event } from '@/models/Event';
import { authorizeRequest } from '@/server/auth/authorization';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

async function authorizeEventUpload(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'events.write');
  if (!authorization.authorized) {
    return { response: authorization.response, eventId: '' };
  }

  const { eventId } = await context.params;
  if (!Types.ObjectId.isValid(eventId)) {
    return {
      response: NextResponse.json({ message: 'Event not found.' }, { status: 404 }),
      eventId: '',
    };
  }

  await connectToDatabase();
  const eventExists = await Event.exists({ _id: eventId });
  if (!eventExists) {
    return {
      response: NextResponse.json({ message: 'Event not found.' }, { status: 404 }),
      eventId: '',
    };
  }

  return { response: null, eventId };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const uploadAuthorization = await authorizeEventUpload(request, context);
  if (uploadAuthorization.response) {
    return uploadAuthorization.response;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (!cloudName || !apiKey || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json<CloudinaryWidgetConfig>(
      { message: 'Event image uploads are not configured.' },
      { status: 503 },
    );
  }

  return NextResponse.json<CloudinaryWidgetConfig>({ cloudName, apiKey });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const uploadAuthorization = await authorizeEventUpload(request, context);
  if (uploadAuthorization.response) {
    return uploadAuthorization.response;
  }

  let body: CloudinarySignatureRequest;
  try {
    body = (await request.json()) as CloudinarySignatureRequest;
  } catch {
    return NextResponse.json<CloudinarySignatureResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  if (!body || !body.paramsToSign || typeof body.paramsToSign !== 'object') {
    return NextResponse.json<CloudinarySignatureResponse>(
      { message: 'Upload parameters are missing.' },
      { status: 400 },
    );
  }

  const entries = Object.entries(body.paramsToSign);
  const invalidValue = entries.some(
    ([, value]) =>
      !['string', 'number', 'boolean'].includes(typeof value) || String(value).length > 1000,
  );
  const requestedFolder = body.paramsToSign.folder;
  if (
    entries.length > 30 ||
    invalidValue ||
    (requestedFolder !== undefined && requestedFolder !== 'sun-aura/events')
  ) {
    return NextResponse.json<CloudinarySignatureResponse>(
      { message: 'Upload parameters are invalid.' },
      { status: 400 },
    );
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    return NextResponse.json<CloudinarySignatureResponse>(
      { message: 'Event image uploads are not configured.' },
      { status: 503 },
    );
  }

  const signature = getCloudinary().utils.api_sign_request(body.paramsToSign, apiSecret);
  return NextResponse.json<CloudinarySignatureResponse>({ signature });
}
