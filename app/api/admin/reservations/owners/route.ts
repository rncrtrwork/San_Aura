import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { ReservationOwnerSearchResponse } from '@/lib/reservationForms';
import { Guest } from '@/models/Guest';
import { Member } from '@/models/Member';
import { requirePermission } from '@/server/auth/authorization';

export const runtime = 'nodejs';

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const GET = requirePermission('reservations.read', async (request) => {
  const query = request.nextUrl.searchParams.get('q')?.trim().slice(0, 80) ?? '';
  if (query.length < 2) {
    return NextResponse.json<ReservationOwnerSearchResponse>({ results: [] });
  }
  await connectToDatabase();
  const expression = new RegExp(escapeRegularExpression(query), 'i');
  const [members, guests] = await Promise.all([
    Member.find({ $or: [{ name: expression }, { email: expression }, { phone: expression }] })
      .select('_id name email phone')
      .limit(8)
      .lean(),
    Guest.find({ $or: [{ name: expression }, { email: expression }, { phone: expression }] })
      .select('_id name email phone')
      .limit(8)
      .lean(),
  ]);
  return NextResponse.json<ReservationOwnerSearchResponse>({
    results: [
      ...members.map((record) => ({
        entityType: 'Member' as const,
        entityId: record._id.toString(),
        name: record.name,
        subtitle: record.email || record.phone || 'Member',
      })),
      ...guests.map((record) => ({
        entityType: 'Guest' as const,
        entityId: record._id.toString(),
        name: record.name,
        subtitle: record.email || record.phone || 'Guest',
      })),
    ],
  });
});
