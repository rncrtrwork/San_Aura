export type SiteMapPositionUpdate = {
  siteId: string;
  x: number;
  y: number;
};

export type SiteMapPositionRequest = {
  positions: SiteMapPositionUpdate[];
};

export type SiteMapPositionResponse = {
  message?: string;
  updated?: number;
};
