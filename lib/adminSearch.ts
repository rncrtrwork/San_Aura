export type AdminSearchResult = {
  id: string;
  label: string;
  subtitle: string;
  href: string;
};

export type AdminSearchResponse = {
  members: AdminSearchResult[];
  reservations: AdminSearchResult[];
  sites: AdminSearchResult[];
};

export const EMPTY_ADMIN_SEARCH_RESPONSE: AdminSearchResponse = {
  members: [],
  reservations: [],
  sites: [],
};
