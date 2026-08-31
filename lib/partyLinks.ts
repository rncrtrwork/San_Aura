export type PartyEntityType = 'Member' | 'Guest';

export type PartyLinkItem = {
  entityType: PartyEntityType;
  entityId: string;
  name: string;
  subtitle: string;
};

export type PartySearchResponse = {
  results: PartyLinkItem[];
  message?: string;
};

export type PartyLinkCreateRequest = {
  entityType: PartyEntityType;
  entityId: string;
};

export type PartyLinkCreateResponse = {
  link?: PartyLinkItem;
  message?: string;
};
