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

export type ElectricChargeInput = {
  mode: ElectricBillingMode;
  kwhUsed: number;
  periodStart: Date | null;
  periodEnd: Date;
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

export function electricBillingPeriodDays(periodStart: Date | null, periodEnd: Date): number {
  if (!periodStart) return 0;
  const milliseconds = periodEnd.getTime() - periodStart.getTime();
  if (milliseconds <= 0) return 0;
  return Math.ceil(milliseconds / 86_400_000);
}

export function calculateElectricCharge(input: ElectricChargeInput): number {
  if (input.mode === 'kwh') {
    return Number(Math.max(0, input.kwhUsed * 0.25).toFixed(2));
  }

  const days = electricBillingPeriodDays(input.periodStart, input.periodEnd);
  if (input.mode === 'flat25') return days * 25;
  if (input.mode === 'flat15') return days * 15;
  return 0;
}
