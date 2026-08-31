import type { SiteType } from '@/models/Site';

export type AdminStayType = {
  id: string;
  name: string;
  slug: string;
  siteType: SiteType;
  description: string;
  amenities: string[];
  baseRate: number;
  weekendRate: number;
  extraGuestFee: number;
  minimumStay: number;
  cleaningFee: number;
  active: boolean;
  unitCount: number;
  updatedAt: string;
};

export type StayTypeStatusUpdateRequest = {
  active: boolean;
};

export type StayTypeStatusUpdateResponse = {
  message?: string;
  active?: boolean;
};

export type StayTypeMutationRequest = {
  name: string;
  slug: string;
  siteType: SiteType;
  description: string;
  amenities: string[];
  baseRate: number;
  weekendRate: number;
  extraGuestFee: number;
  minimumStay: number;
  cleaningFee: number;
  active: boolean;
};

export type StayTypeMutationResponse = {
  id?: string;
  message?: string;
};

export const stayTypeLabels: Record<SiteType, string> = {
  cabin: 'Cabin',
  rv: 'RV Site',
  tent: 'Tent Site',
};

export const stayTypeOptions: Array<{ value: SiteType; label: string }> = [
  { value: 'cabin', label: stayTypeLabels.cabin },
  { value: 'rv', label: stayTypeLabels.rv },
  { value: 'tent', label: stayTypeLabels.tent },
];
