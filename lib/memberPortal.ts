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

export const MEMBER_PORTAL_TABS = [
  'dashboard',
  'payments',
  'electric',
  'documents',
  'membership',
] as const;

export type MemberPortalTab = (typeof MEMBER_PORTAL_TABS)[number];

export const MEMBER_PORTAL_TAB_DEFINITIONS: Array<{ value: MemberPortalTab; label: string }> = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'payments', label: 'Payment History' },
  { value: 'electric', label: 'Electric Billing' },
  { value: 'documents', label: 'Documents' },
  { value: 'membership', label: 'Membership Info' },
];

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

export const ELECTRIC_BILLING_MODE_LABELS = {
  flat25: '$25/day flat',
  flat15: '$15/day flat',
  kwh: '$0.25/kWh',
  weekly: 'Weekly rate',
} as const;

export function parseMemberPortalTab(value: string | string[] | undefined): MemberPortalTab {
  const tab = typeof value === 'string' ? value : '';
  return MEMBER_PORTAL_TABS.find((entry) => entry === tab) ?? 'dashboard';
}

export function memberCurrencyLabel(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function memberDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function memberDocumentStatusLabel(expiresAt: string | null): string {
  if (!expiresAt) return 'On file';
  const expiration = new Date(expiresAt);
  if (Number.isNaN(expiration.getTime())) return 'Date unavailable';
  const daysRemaining = Math.ceil((expiration.getTime() - Date.now()) / 86_400_000);
  if (daysRemaining < 0) return 'Expired';
  if (daysRemaining <= 30) return 'Renews soon';
  return 'Current';
}

export function memberRenewalMonthLabel(month: number): string {
  if (!Number.isInteger(month) || month < 1 || month > 12) return 'Not set';
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2026, month - 1, 1));
}

export function memberBalanceLabel(balance: number): string {
  if (balance > 0) return `${memberCurrencyLabel(balance)} due`;
  if (balance < 0) return `${memberCurrencyLabel(Math.abs(balance))} credit`;
  return '$0.00 due';
}
