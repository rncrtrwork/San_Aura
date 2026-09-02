import type { AdminSite } from '@/lib/adminSites';
import { connectToDatabase } from '@/lib/db';
import { Site } from '@/models/Site';

export async function getAdminSites(): Promise<AdminSite[]> {
  await connectToDatabase();
  const sites = await Site.find()
    .select('code type area amenities status maintenanceNote length hookups mapPosition active updatedAt')
    .sort({ active: -1, type: 1, code: 1 })
    .lean();

  return sites.map((site) => ({
    id: site._id.toString(),
    code: site.code,
    type: site.type,
    area: site.area,
    amenities: site.amenities,
    status: site.status,
    maintenanceNote: site.maintenanceNote,
    length: site.length,
    hookups: site.hookups,
    mapPosition: site.mapPosition,
    active: site.active,
    updatedAt: site.updatedAt.toISOString(),
  }));
}
