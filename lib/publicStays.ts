import type { SiteType } from '@/models/Site';

export type PublicStayType = {
  id: string;
  name: string;
  slug: string;
  siteType: SiteType;
  description: string;
  amenities: string[];
  startingRate: number;
  weekendRate: number;
  minimumStay: number;
  cleaningFee: number;
  unitCount: number;
};

export function publicStartingRateLabel(amount: number): string {
  return amount > 0 ? `From $${amount.toFixed(0)} / night` : 'Rate available on request';
}
