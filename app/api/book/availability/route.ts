import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import type { PublicBookingAvailabilityResponse } from '@/lib/publicBooking';
import { validatePublicBookingAvailability } from '@/lib/publicBooking';
import { connectToDatabase } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Site } from '@/models/Site';
import { SiteBlock } from '@/models/SiteBlock';
import { StayType } from '@/models/StayType';

export const runtime = 'nodejs';

type PublicBookingSiteLean = {
  _id: Types.ObjectId;
  code: string;
  area: string;
  type: 'cabin' | 'rv' | 'tent';
};

type UnavailableSiteLean = {
  siteRef: Types.ObjectId;
};

export async function GET(request: NextRequest) {
  const validation = validatePublicBookingAvailability({
    checkIn: request.nextUrl.searchParams.get('checkIn') ?? '',
    checkOut: request.nextUrl.searchParams.get('checkOut') ?? '',
    siteType: request.nextUrl.searchParams.get('siteType') ?? '',
  });
  if (!validation.valid) {
    return NextResponse.json<PublicBookingAvailabilityResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const stayTypeExists = await StayType.exists({
    siteType: validation.data.siteType,
    active: true,
  });
  if (!stayTypeExists) {
    return NextResponse.json<PublicBookingAvailabilityResponse>({ sites: [] });
  }

  const sites = await Site.find({
    active: true,
    type: validation.data.siteType,
    status: { $nin: ['maintenance', 'blocked'] },
  })
    .select('code area type')
    .sort({ code: 1 })
    .limit(80)
    .lean<PublicBookingSiteLean[]>();
  const siteIds = sites.map((site) => site._id);
  const [reservedSites, blockedSites] = await Promise.all([
    Reservation.find({
      siteRef: { $in: siteIds },
      checkIn: { $lt: validation.data.checkOut },
      checkOut: { $gt: validation.data.checkIn },
      status: { $in: ['pending', 'confirmed', 'checked-in'] },
    })
      .select('siteRef')
      .lean<UnavailableSiteLean[]>(),
    SiteBlock.find({
      siteRef: { $in: siteIds },
      startDate: { $lt: validation.data.checkOut },
      endDate: { $gt: validation.data.checkIn },
    })
      .select('siteRef')
      .lean<UnavailableSiteLean[]>(),
  ]);
  const unavailableIds = new Set([
    ...reservedSites.map((site) => site.siteRef.toString()),
    ...blockedSites.map((site) => site.siteRef.toString()),
  ]);

  return NextResponse.json<PublicBookingAvailabilityResponse>({
    sites: sites
      .filter((site) => !unavailableIds.has(site._id.toString()))
      .map((site) => ({
        id: site._id.toString(),
        code: site.code,
        area: site.area,
        type: site.type,
      })),
  });
}
