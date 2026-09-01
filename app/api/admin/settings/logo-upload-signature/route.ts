import { NextResponse, type NextRequest } from 'next/server';
import { getCloudinary } from '@/lib/cloudinary';
import { CLOUDINARY_FOLDERS } from '@/lib/cloudinaryFolders';
import type {
  CloudinarySignatureRequest,
  CloudinarySignatureResponse,
  CloudinaryWidgetConfig,
} from '@/lib/cloudinaryUpload';
import { authorizeRequest } from '@/server/auth/authorization';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const authorization = await authorizeRequest(request, 'settings.write');
  if (!authorization.authorized) return authorization.response;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (!cloudName || !apiKey || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json<CloudinaryWidgetConfig>(
      { message: 'Logo uploads are not configured.' },
      { status: 503 },
    );
  }

  return NextResponse.json<CloudinaryWidgetConfig>({ cloudName, apiKey });
}

export async function POST(request: NextRequest) {
  const authorization = await authorizeRequest(request, 'settings.write');
  if (!authorization.authorized) return authorization.response;

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
    (requestedFolder !== undefined && requestedFolder !== CLOUDINARY_FOLDERS.settings)
  ) {
    return NextResponse.json<CloudinarySignatureResponse>(
      { message: 'Upload parameters are invalid.' },
      { status: 400 },
    );
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    return NextResponse.json<CloudinarySignatureResponse>(
      { message: 'Logo uploads are not configured.' },
      { status: 503 },
    );
  }

  const signature = getCloudinary().utils.api_sign_request(body.paramsToSign, apiSecret);
  return NextResponse.json<CloudinarySignatureResponse>({ signature });
}
