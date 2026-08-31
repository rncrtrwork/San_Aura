import type { MembershipTier } from '@/lib/memberOptions';

export type MembershipTierRules = {
  tier: MembershipTier;
  annualDues: number;
  permanentSpaceAssignment: boolean;
  dayFeeExempt: boolean;
};

const rulesByTier: Record<MembershipTier, MembershipTierRules> = {
  '2850': {
    tier: '2850',
    annualDues: 2850,
    permanentSpaceAssignment: true,
    dayFeeExempt: false,
  },
  '2000': {
    tier: '2000',
    annualDues: 2000,
    permanentSpaceAssignment: true,
    dayFeeExempt: false,
  },
  '1250': {
    tier: '1250',
    annualDues: 1250,
    permanentSpaceAssignment: false,
    dayFeeExempt: true,
  },
  '500': {
    tier: '500',
    annualDues: 500,
    permanentSpaceAssignment: true,
    dayFeeExempt: false,
  },
};

export function getTierRules(tier: MembershipTier): MembershipTierRules {
  return { ...rulesByTier[tier] };
}
