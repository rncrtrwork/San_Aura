import type { ElectricBillingMode, MembershipTier } from '@/models/Member';
import type { SiteType } from '@/models/Site';

export type ElectricBillingMember = {
  membershipTier: MembershipTier;
  electricBillingMode: ElectricBillingMode | null;
};

export type ElectricBillingSite = {
  type: SiteType;
  hookups: string[];
} | null;

export type ElectricBillingModeSource = 'member-override' | 'membership-tier';

export type ResolvedBillingMode = {
  mode: ElectricBillingMode;
  source: ElectricBillingModeSource;
  unitRate: number | null;
  unitLabel: 'day' | 'kWh' | 'week';
  siteType: SiteType | null;
};

const defaultModeByTier: Record<MembershipTier, ElectricBillingMode> = {
  '2850': 'flat25',
  '2000': 'weekly',
  '1250': 'flat15',
  '500': 'kwh',
};

const rateByMode: Record<ElectricBillingMode, number | null> = {
  flat25: 25,
  flat15: 15,
  kwh: 0.25,
  weekly: null,
};

const unitByMode: Record<ElectricBillingMode, ResolvedBillingMode['unitLabel']> = {
  flat25: 'day',
  flat15: 'day',
  kwh: 'kWh',
  weekly: 'week',
};

export function resolveBillingMode(
  member: ElectricBillingMember,
  site: ElectricBillingSite,
): ResolvedBillingMode {
  const mode = member.electricBillingMode ?? defaultModeByTier[member.membershipTier];

  return {
    mode,
    source: member.electricBillingMode ? 'member-override' : 'membership-tier',
    unitRate: rateByMode[mode],
    unitLabel: unitByMode[mode],
    siteType: site?.type ?? null,
  };
}
