import { type PublicStayType } from '@/lib/publicStays';
import { getStayTypes } from '@/server/stays/getStayTypes';

export async function getPublicStayTypes(): Promise<PublicStayType[]> {
  try {
    const stayTypes = await getStayTypes();
    return stayTypes
      .filter((stayType) => stayType.active)
      .map((stayType) => ({
        id: stayType.id,
        name: stayType.name,
        slug: stayType.slug,
        siteType: stayType.siteType,
        description: stayType.description,
        amenities: stayType.amenities,
        startingRate: stayType.baseRate,
        weekendRate: stayType.weekendRate,
        minimumStay: stayType.minimumStay,
        cleaningFee: stayType.cleaningFee,
        unitCount: stayType.unitCount,
      }));
  } catch {
    return [];
  }
}
