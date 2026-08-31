import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import type { EmergencyContact, VehicleInfo } from '@/models/Member';
import { Member, type MembershipTier, type MemberStatus } from '@/models/Member';
import { Site } from '@/models/Site';

export type MemberProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipTier: MembershipTier;
  status: MemberStatus;
  renewalMonth: number;
  joinDate: string;
  vehicles: VehicleInfo[];
  emergencyContact: EmergencyContact | null;
  assignedSite: string | null;
};

export async function getMemberProfile(memberId: string): Promise<MemberProfile | null> {
  if (!Types.ObjectId.isValid(memberId)) {
    return null;
  }

  await connectToDatabase();
  const member = await Member.findById(memberId)
    .select(
      'name email phone address membershipTier status renewalMonth joinDate vehicleInfo emergencyContact assignedSiteId',
    )
    .lean();

  if (!member) {
    return null;
  }

  const assignedSite = member.assignedSiteId
    ? await Site.findById(member.assignedSiteId).select('code').lean()
    : null;

  return {
    id: member._id.toString(),
    name: member.name,
    email: member.email,
    phone: member.phone,
    address: member.address,
    membershipTier: member.membershipTier,
    status: member.status,
    renewalMonth: member.renewalMonth,
    joinDate: member.joinDate.toISOString(),
    vehicles: member.vehicleInfo.map((vehicle) => ({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      plate: vehicle.plate,
      state: vehicle.state,
    })),
    emergencyContact: member.emergencyContact
      ? {
          name: member.emergencyContact.name,
          relationship: member.emergencyContact.relationship,
          phone: member.emergencyContact.phone,
        }
      : null,
    assignedSite: assignedSite?.code ?? null,
  };
}
