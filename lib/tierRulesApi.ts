import type { MembershipTier } from '@/lib/memberOptions';
import type { MembershipTierRules } from '@/lib/memberTierRules';

export type TierRulesApiResponse = {
  rules?: MembershipTierRules;
  message?: string;
};

export type TierRulesResolution = {
  status: 200 | 400;
  body: TierRulesApiResponse;
};

export type TierRulesRequest = {
  tier: MembershipTier;
};
