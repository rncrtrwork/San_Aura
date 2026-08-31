import { connectToDatabase } from '@/lib/db';
import { type AdminStayType } from '@/lib/stayTypes';
import { SITE_TYPES, Site, type SiteType } from '@/models/Site';
import { StayType } from '@/models/StayType';

type SiteTypeCount = {
  _id: SiteType;
  total: number;
};

const siteTypeOrder = new Map<SiteType, number>(SITE_TYPES.map((type, index) => [type, index]));

export async function getStayTypes(): Promise<AdminStayType[]> {
  await connectToDatabase();
  const [stayTypes, siteCounts] = await Promise.all([
    StayType.find()
      .select(
        'name slug siteType description amenities baseRate weekendRate extraGuestFee minimumStay cleaningFee active updatedAt',
      )
      .sort({ siteType: 1, name: 1 })
      .lean(),
    Site.aggregate<SiteTypeCount>([
      { $match: { active: true } },
      { $group: { _id: '$type', total: { $sum: 1 } } },
    ]),
  ]);
  const countsByType = new Map(siteCounts.map((count) => [count._id, count.total]));

  return stayTypes
    .map((stayType) => ({
      id: stayType._id.toString(),
      name: stayType.name,
      slug: stayType.slug,
      siteType: stayType.siteType,
      description: stayType.description,
      amenities: stayType.amenities,
      baseRate: stayType.baseRate,
      weekendRate: stayType.weekendRate,
      extraGuestFee: stayType.extraGuestFee,
      minimumStay: stayType.minimumStay,
      cleaningFee: stayType.cleaningFee,
      active: stayType.active,
      unitCount: countsByType.get(stayType.siteType) ?? 0,
      updatedAt: stayType.updatedAt.toISOString(),
    }))
    .sort(
      (left, right) =>
        (siteTypeOrder.get(left.siteType) ?? 99) - (siteTypeOrder.get(right.siteType) ?? 99) ||
        left.name.localeCompare(right.name),
    );
}
