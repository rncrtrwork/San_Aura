import { Types } from 'mongoose';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { AdminSearchResponse } from '@/lib/adminSearch';
import { Member } from '@/models/Member';
import { Reservation } from '@/models/Reservation';
import { Site } from '@/models/Site';
import { requirePermission } from '@/server/auth/authorization';

export const runtime = 'nodejs';

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const GET = requirePermission('dashboard.read', async (request) => {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (query.length < 2) {
    return NextResponse.json<AdminSearchResponse>({ members: [], reservations: [], sites: [] });
  }

  await connectToDatabase();
  const expression = new RegExp(escapeRegularExpression(query), 'i');
  const reservationFilter = Types.ObjectId.isValid(query)
    ? { $or: [{ _id: new Types.ObjectId(query) }, { source: expression }] }
    : { source: expression };

  const [members, reservations, sites] = await Promise.all([
    Member.find({ $or: [{ name: expression }, { email: expression }, { phone: expression }] })
      .select('name email phone membershipTier status')
      .limit(5)
      .lean(),
    Reservation.find(reservationFilter)
      .select('siteRef checkIn checkOut status')
      .sort({ checkIn: -1 })
      .limit(5)
      .lean(),
    Site.find({ $or: [{ code: expression }, { area: expression }] })
      .select('code area type status')
      .limit(5)
      .lean(),
  ]);

  return NextResponse.json<AdminSearchResponse>({
    members: members.map((member) => ({
      id: member._id.toString(),
      label: member.name,
      subtitle: `${member.membershipTier} member · ${member.status}`,
      href: `/admin/members/${member._id.toString()}`,
    })),
    reservations: reservations.map((reservation) => ({
      id: reservation._id.toString(),
      label: `Reservation ${reservation._id.toString().slice(-6).toUpperCase()}`,
      subtitle: `${reservation.status} · ${reservation.checkIn.toLocaleDateString()}`,
      href: `/admin/reservations/${reservation._id.toString()}`,
    })),
    sites: sites.map((site) => ({
      id: site._id.toString(),
      label: site.code,
      subtitle: `${site.area} · ${site.status}`,
      href: `/admin/resort-map?site=${site._id.toString()}`,
    })),
  });
});
