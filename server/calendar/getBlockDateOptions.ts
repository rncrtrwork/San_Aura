import { connectToDatabase } from '@/lib/db';
import { Site, type SiteType } from '@/models/Site';

export type BlockDateSiteOption = {
  id: string;
  code: string;
  type: SiteType;
};

export async function getBlockDateOptions(): Promise<BlockDateSiteOption[]> {
  await connectToDatabase();
  const sites = await Site.find({ active: true }).select('code type').sort({ code: 1 }).lean();
  return sites.map((site) => ({
    id: site._id.toString(),
    code: site.code,
    type: site.type,
  }));
}
