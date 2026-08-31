export const MEMBERSHIP_TIERS = ['2850', '2000', '1250', '500'] as const;
export const MEMBER_STATUSES = ['active', 'probationary', 'hiatus', 'inactive'] as const;
export const ELECTRIC_BILLING_MODES = ['flat25', 'flat15', 'kwh', 'weekly'] as const;

export type MembershipTier = (typeof MEMBERSHIP_TIERS)[number];
export type MemberStatus = (typeof MEMBER_STATUSES)[number];
export type ElectricBillingMode = (typeof ELECTRIC_BILLING_MODES)[number];
