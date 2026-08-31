import type { AddonType } from '@/models/Addon';

export type AdminAddon = {
  id: string;
  name: string;
  description: string;
  type: AddonType;
  price: number;
  partnerUrl: string;
  active: boolean;
  updatedAt: string;
};

export type AddonMutationRequest = {
  name: string;
  description: string;
  type: AddonType;
  price: number;
  partnerUrl: string;
  active: boolean;
};

export type AddonStatusUpdateRequest = {
  active: boolean;
};

export type AddonMutationResponse = {
  id?: string;
  message?: string;
  active?: boolean;
};

export const addonTypeLabels: Record<AddonType, string> = {
  optional: 'Optional',
  'external-partner': 'External Partner',
};

export const addonTypeOptions: Array<{ value: AddonType; label: string }> = [
  { value: 'optional', label: addonTypeLabels.optional },
  { value: 'external-partner', label: addonTypeLabels['external-partner'] },
];
