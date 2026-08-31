import { NextResponse } from 'next/server';
import { MEMBERSHIP_TIERS, type MembershipTier } from '@/lib/memberOptions';
import { getTierRules } from '@/lib/memberTierRules';
import type { TierRulesResolution } from '@/lib/tierRulesApi';
import { requirePermission } from '@/server/auth/authorization';

export const runtime = 'nodejs';

function isMembershipTier(value: string): value is MembershipTier {
  return MEMBERSHIP_TIERS.some((tier) => tier === value);
}

export function resolveTierRulesRequest(tierValue: string | null): TierRulesResolution {
  if (!tierValue || !isMembershipTier(tierValue)) {
    return {
      status: 400,
      body: { message: 'A valid membership tier is required.' },
    };
  }
  return {
    status: 200,
    body: { rules: getTierRules(tierValue) },
  };
}

export const GET = requirePermission('members.read', async (request) => {
  const resolution = resolveTierRulesRequest(request.nextUrl.searchParams.get('tier'));
  return NextResponse.json(resolution.body, { status: resolution.status });
});
