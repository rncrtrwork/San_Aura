export const SITE_BLOCK_KINDS = ['maintenance', 'blocked'] as const;

export type SiteBlockKind = (typeof SITE_BLOCK_KINDS)[number];

export type SiteBlockCreateRequest = {
  siteId: string;
  startDate: string;
  endDate: string;
  kind: SiteBlockKind;
  note: string;
};

export type SiteBlockCreateResponse = {
  id?: string;
  message?: string;
};
