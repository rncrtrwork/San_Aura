import { connectToDatabase } from '@/lib/db';
import type { ReservationFormSite, ReservationFormStayType } from '@/lib/reservationForms';
import { Site } from '@/models/Site';
import { StayType } from '@/models/StayType';

export async function getReservationFormOptions(): Promise<{
  stayTypes: ReservationFormStayType[];
  sites: ReservationFormSite[];
}> {
  await connectToDatabase();
  const [stayTypes, sites] = await Promise.all([
    StayType.find({ active: true }).select('name siteType minimumStay').sort({ name: 1 }).lean(),
    Site.find({ active: true, status: { $nin: ['maintenance', 'blocked'] } })
      .select('code type area')
      .sort({ code: 1 })
      .lean(),
  ]);
  return {
    stayTypes: stayTypes.map((stayType) => ({
      id: stayType._id.toString(),
      name: stayType.name,
      siteType: stayType.siteType,
      minimumStay: stayType.minimumStay,
    })),
    sites: sites.map((site) => ({
      id: site._id.toString(),
      code: site.code,
      type: site.type,
      area: site.area,
    })),
  };
}
