import type { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import {
  isAutomatedVisitor,
  parseVisitorUserAgent,
  visitorIpAddressFromHeaders,
  visitorLocationFromHeaders,
} from '@/lib/visitorTracking';
import { VisitorVisit } from '@/models/VisitorVisit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<Response> {
  const userAgent = request.headers.get('user-agent') ?? '';
  if (isAutomatedVisitor(userAgent)) return new Response(null, { status: 204 });

  const device = parseVisitorUserAgent(userAgent);
  const location = visitorLocationFromHeaders(request.headers);
  const ipAddress = visitorIpAddressFromHeaders(request.headers);

  try {
    await connectToDatabase();
    await VisitorVisit.create({
      browserName: device.browserName,
      browserVersion: device.browserVersion,
      operatingSystem: device.operatingSystem,
      country: location.country,
      region: location.region,
      city: location.city,
      ipAddress,
    });
  } catch {
    return new Response(null, { status: 204 });
  }

  return new Response(null, { status: 204 });
}
