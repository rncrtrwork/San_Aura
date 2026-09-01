import type { PublicBookingStayType } from '@/lib/publicBooking';
import { connectToDatabase } from '@/lib/db';
import { StayType } from '@/models/StayType';

type PublicBookingStayTypeLean = {
  _id: { toString(): string };
  name: string;
  siteType: 'cabin' | 'rv' | 'tent';
  minimumStay: number;
  baseRate: number;
  weekendRate: number;
  extraGuestFee: number;
  cleaningFee: number;
};

export async function getPublicBookingOptions(): Promise<PublicBookingStayType[]> {
  try {
    await connectToDatabase();
    const stayTypes = await StayType.find({ active: true })
      .select('name siteType minimumStay baseRate weekendRate extraGuestFee cleaningFee')
      .sort({ siteType: 1, name: 1 })
      .lean<PublicBookingStayTypeLean[]>();

    return stayTypes.map((stayType) => ({
      id: stayType._id.toString(),
      name: stayType.name,
      siteType: stayType.siteType,
      minimumStay: stayType.minimumStay,
      baseRate: stayType.baseRate,
      weekendRate: stayType.weekendRate,
      extraGuestFee: stayType.extraGuestFee,
      cleaningFee: stayType.cleaningFee,
    }));
  } catch {
    return [];
  }
}
