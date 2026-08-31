import type { MemberDocument } from '@/models/Member';

export type MemberPortalProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipTier: MemberDocument['membershipTier'];
  status: MemberDocument['status'];
  renewalMonth: number;
  joinDate: string;
};

export function serializeMemberForPortal(
  member: MemberDocument & { _id: { toString(): string } },
): MemberPortalProfile {
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
  };
}
