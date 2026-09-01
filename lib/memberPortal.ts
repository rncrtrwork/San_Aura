import type { MembershipTier, MemberStatus } from '@/models/Member';

export type MemberPortalDashboard = {
  profile: {
    id: string;
    name: string;
    email: string;
    membershipTier: MembershipTier;
    status: MemberStatus;
    renewalMonth: number;
    joinDate: string;
  };
  balance: number;
};

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: 'Active',
  probationary: 'Probationary',
  hiatus: 'Hiatus',
  inactive: 'Inactive',
};

export const MEMBER_TIER_LABELS: Record<MembershipTier, string> = {
  '2850': '$2,850 Membership',
  '2000': '$2,000 Membership',
  '1250': '$1,250 Membership',
  '500': '$500 Membership',
};

export function memberRenewalMonthLabel(month: number): string {
  if (!Number.isInteger(month) || month < 1 || month > 12) return 'Not set';
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2026, month - 1, 1));
}

export function memberBalanceLabel(balance: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  if (balance > 0) return `${formatter.format(balance)} due`;
  if (balance < 0) return `${formatter.format(Math.abs(balance))} credit`;
  return '$0.00 due';
}
