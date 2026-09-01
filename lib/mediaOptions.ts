export const MEDIA_USAGE_TYPES = ['homepage', 'stayType', 'event', 'mapAsset'] as const;
export const MEDIA_APPROVAL_STATUSES = ['draft', 'approved', 'rejected'] as const;

export type MediaUsage = (typeof MEDIA_USAGE_TYPES)[number];
export type MediaApprovalStatus = (typeof MEDIA_APPROVAL_STATUSES)[number];

export type FocalPoint = {
  x: number;
  y: number;
};

export type MediaDimensions = {
  width: number;
  height: number;
};
