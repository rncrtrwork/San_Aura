import { connectToDatabase } from '@/lib/db';
import {
  Member,
  MEMBERSHIP_TIERS,
  MEMBER_STATUSES,
  type MembershipTier,
  type MemberStatus,
} from '@/models/Member';

type MemberListQuery = {
  $or?: Array<{ name: RegExp } | { email: RegExp } | { phone: RegExp }>;
  membershipTier?: MembershipTier;
  status?: MemberStatus;
  renewalMonth?: number;
};

export type MemberListFilters = {
  search: string;
  tier: MembershipTier | '';
  status: MemberStatus | '';
  renewalMonth: number | null;
};

export type MemberListItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: MembershipTier;
  status: MemberStatus;
  renewalMonth: number;
  joinDate: string;
};

export type MemberListResult = {
  members: MemberListItem[];
  total: number;
};

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseMemberFilters(
  params: Record<string, string | string[] | undefined>,
): MemberListFilters {
  const value = (key: string) => {
    const entry = params[key];
    return typeof entry === 'string' ? entry.trim() : '';
  };
  const tierValue = value('tier');
  const statusValue = value('status');
  const renewalValue = Number(value('renewalMonth'));

  return {
    search: value('search').slice(0, 120),
    tier: MEMBERSHIP_TIERS.includes(tierValue as MembershipTier)
      ? (tierValue as MembershipTier)
      : '',
    status: MEMBER_STATUSES.includes(statusValue as MemberStatus)
      ? (statusValue as MemberStatus)
      : '',
    renewalMonth:
      Number.isInteger(renewalValue) && renewalValue >= 1 && renewalValue <= 12
        ? renewalValue
        : null,
  };
}

export async function getMembers(filters: MemberListFilters): Promise<MemberListResult> {
  await connectToDatabase();

  const query: MemberListQuery = {};
  if (filters.search) {
    const expression = new RegExp(escapeRegularExpression(filters.search), 'i');
    query.$or = [{ name: expression }, { email: expression }, { phone: expression }];
  }
  if (filters.tier) {
    query.membershipTier = filters.tier;
  }
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.renewalMonth) {
    query.renewalMonth = filters.renewalMonth;
  }

  const [members, total] = await Promise.all([
    Member.find(query)
      .select('name email phone membershipTier status renewalMonth joinDate')
      .sort({ name: 1 })
      .limit(100)
      .lean(),
    Member.countDocuments(query),
  ]);

  return {
    members: members.map((member) => ({
      id: member._id.toString(),
      name: member.name,
      email: member.email,
      phone: member.phone,
      tier: member.membershipTier,
      status: member.status,
      renewalMonth: member.renewalMonth,
      joinDate: member.joinDate.toISOString(),
    })),
    total,
  };
}
