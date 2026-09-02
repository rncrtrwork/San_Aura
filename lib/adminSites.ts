import type { MapPosition, SiteStatus, SiteType } from '@/models/Site';

export type AdminSite = {
  id: string;
  code: string;
  type: SiteType;
  area: string;
  amenities: string[];
  status: SiteStatus;
  maintenanceNote: string;
  length: number | null;
  hookups: string[];
  mapPosition: MapPosition | null;
  active: boolean;
  updatedAt: string;
};

export type SiteMutationRequest = {
  code: string;
  type: SiteType;
  area: string;
  amenities: string[];
  status: SiteStatus;
  maintenanceNote: string;
  length: number | null;
  hookups: string[];
  mapPosition: MapPosition | null;
  active: boolean;
};

export type SiteStatusUpdateRequest = {
  active: boolean;
};

export type SiteMutationResponse = {
  id?: string;
  message?: string;
  active?: boolean;
};

export const siteTypeLabels: Record<SiteType, string> = {
  cabin: 'Cabin',
  rv: 'RV Site',
  tent: 'Tent Site',
};

export const siteStatusLabels: Record<SiteStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  blocked: 'Blocked',
};

export const siteTypeOptions: Array<{ value: SiteType; label: string }> = [
  { value: 'cabin', label: siteTypeLabels.cabin },
  { value: 'rv', label: siteTypeLabels.rv },
  { value: 'tent', label: siteTypeLabels.tent },
];

export const siteStatusOptions: Array<{ value: SiteStatus; label: string }> = [
  { value: 'available', label: siteStatusLabels.available },
  { value: 'occupied', label: siteStatusLabels.occupied },
  { value: 'maintenance', label: siteStatusLabels.maintenance },
  { value: 'blocked', label: siteStatusLabels.blocked },
];
