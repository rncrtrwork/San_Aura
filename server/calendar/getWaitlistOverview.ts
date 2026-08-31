import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { StayType } from '@/models/StayType';
import { Waitlist, type WaitlistStatus } from '@/models/Waitlist';

export type CalendarWaitlistItem = {
  id: string;
  contactName: string;
  requestedCheckIn: string;
  requestedCheckOut: string;
  siteCount: number;
  status: WaitlistStatus;
  stayTypeName: string;
};

export type CalendarWaitlistDetail = CalendarWaitlistItem & {
  email: string;
  phone: string;
  notes: string;
};

export type CalendarWaitlistOverview = {
  items: CalendarWaitlistItem[];
  selected: CalendarWaitlistDetail | null;
};

export async function getWaitlistOverview(
  selectedId: string | undefined,
): Promise<CalendarWaitlistOverview> {
  await connectToDatabase();
  const [entries, selected] = await Promise.all([
    Waitlist.find({ status: { $in: ['pending', 'contacted', 'offered'] } })
      .sort({ requestedCheckIn: 1, createdAt: 1 })
      .limit(6)
      .lean(),
    selectedId && Types.ObjectId.isValid(selectedId) ? Waitlist.findById(selectedId).lean() : null,
  ]);
  const stayTypeIds = entries.map((entry) => entry.stayTypeRef);
  if (selected) {
    stayTypeIds.push(selected.stayTypeRef);
  }
  const stayTypes = await StayType.find({ _id: { $in: stayTypeIds } })
    .select('_id name')
    .lean();
  const stayTypeNames = new Map(
    stayTypes.map((stayType): [string, string] => [stayType._id.toString(), stayType.name]),
  );
  const mapItem = (entry: (typeof entries)[number]): CalendarWaitlistItem => ({
    id: entry._id.toString(),
    contactName: entry.contact.name,
    requestedCheckIn: entry.requestedCheckIn.toISOString(),
    requestedCheckOut: entry.requestedCheckOut.toISOString(),
    siteCount: entry.siteCount,
    status: entry.status,
    stayTypeName: stayTypeNames.get(entry.stayTypeRef.toString()) ?? 'Stay type unavailable',
  });

  return {
    items: entries.map(mapItem),
    selected: selected
      ? {
          ...mapItem(selected),
          email: selected.contact.email,
          phone: selected.contact.phone,
          notes: selected.notes,
        }
      : null,
  };
}
