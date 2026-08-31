import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import type { PartyLinkItem } from '@/lib/partyLinks';
import type { EmergencyContact, VehicleInfo } from '@/models/Member';
import { Guest } from '@/models/Guest';
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
  partyLinks: PartyLinkItem[];
};

export async function getMemberProfile(memberId: string): Promise<MemberProfile | null> {
  if (!Types.ObjectId.isValid(memberId)) {
    return null;
  }

  await connectToDatabase();
  const member = await Member.findById(memberId)
    .select(
      'name email phone address membershipTier status renewalMonth joinDate vehicleInfo emergencyContact assignedSiteId partyLinks',
    )
    .lean();

  if (!member) {
    return null;
  }

  const linkedMemberIds = member.partyLinks
    .filter((link) => link.entityType === 'Member')
    .map((link) => link.entityId);
  const linkedGuestIds = member.partyLinks
    .filter((link) => link.entityType === 'Guest')
    .map((link) => link.entityId);
  const [assignedSite, linkedMembers, linkedGuests] = await Promise.all([
    member.assignedSiteId ? Site.findById(member.assignedSiteId).select('code').lean() : null,
    Member.find({ _id: { $in: linkedMemberIds } })
      .select('_id name email phone')
      .lean(),
    Guest.find({ _id: { $in: linkedGuestIds } })
      .select('_id name email phone')
      .lean(),
  ]);
  const linkedRecords = new Map<string, PartyLinkItem>([
    ...linkedMembers.map((linked): [string, PartyLinkItem] => [
      `Member:${linked._id.toString()}`,
      {
        entityType: 'Member',
        entityId: linked._id.toString(),
        name: linked.name,
        subtitle: linked.email || linked.phone || 'Member',
      },
    ]),
    ...linkedGuests.map((linked): [string, PartyLinkItem] => [
      `Guest:${linked._id.toString()}`,
      {
        entityType: 'Guest',
        entityId: linked._id.toString(),
        name: linked.name,
        subtitle: linked.email || linked.phone || 'Guest',
      },
    ]),
  ]);

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
    partyLinks: member.partyLinks.flatMap((link) => {
      const record = linkedRecords.get(`${link.entityType}:${link.entityId.toString()}`);
      return record ? [record] : [];
    }),
  };
}
