import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { Member } from '@/models/Member';
import { Site, type SiteType } from '@/models/Site';

export type ElectricReadingSiteOption = {
  id: string;
  code: string;
  type: SiteType;
  area: string;
};

export type ElectricReadingOptions = {
  sites: ElectricReadingSiteOption[];
  defaultSiteId: string;
};

type MemberSiteLean = {
  assignedSiteId?: Types.ObjectId | null;
};

type SiteOptionLean = {
  _id: Types.ObjectId;
  code: string;
  type: SiteType;
  area: string;
};

export async function getElectricReadingOptions(memberId: string): Promise<ElectricReadingOptions> {
  if (!Types.ObjectId.isValid(memberId)) {
    return { sites: [], defaultSiteId: '' };
  }

  await connectToDatabase();
  const [member, sites] = await Promise.all([
    Member.findById(memberId).select('assignedSiteId').lean<MemberSiteLean>(),
    Site.find({ active: true }).select('code type area').sort({ code: 1 }).lean<SiteOptionLean[]>(),
  ]);

  return {
    sites: sites.map((site) => ({
      id: site._id.toString(),
      code: site.code,
      type: site.type,
      area: site.area,
    })),
    defaultSiteId: member?.assignedSiteId?.toString() ?? '',
  };
}
