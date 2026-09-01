import { Types } from 'mongoose';
import type { MemberPortalDashboard } from '@/lib/memberPortal';
import { connectToDatabase } from '@/lib/db';
import { Member } from '@/models/Member';
import { getMemberPayments } from '@/server/members/getMemberPayments';

type MemberDashboardLean = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  membershipTier: '2850' | '2000' | '1250' | '500';
  status: 'active' | 'probationary' | 'hiatus' | 'inactive';
  renewalMonth: number;
  joinDate: Date;
};

export async function getMemberDashboard(memberId: string): Promise<MemberPortalDashboard | null> {
  if (!Types.ObjectId.isValid(memberId)) return null;

  await connectToDatabase();
  const [member, payments] = await Promise.all([
    Member.findOne({ _id: memberId, status: { $ne: 'inactive' } })
      .select('name email membershipTier status renewalMonth joinDate')
      .lean<MemberDashboardLean | null>(),
    getMemberPayments(memberId),
  ]);
  if (!member) return null;

  return {
    profile: {
      id: member._id.toString(),
      name: member.name,
      email: member.email,
      membershipTier: member.membershipTier,
      status: member.status,
      renewalMonth: member.renewalMonth,
      joinDate: member.joinDate.toISOString(),
    },
    balance: payments.balance,
  };
}
