export type ReservationOwnerType = 'Member' | 'Guest';

export type ReservationOwnerSearchItem = {
  entityType: ReservationOwnerType;
  entityId: string;
  name: string;
  subtitle: string;
};

export type ReservationOwnerSearchResponse = {
  results: ReservationOwnerSearchItem[];
  message?: string;
};

export type ReservationCreateRequest = {
  ownerMode: 'existing' | 'newGuest';
  ownerType: ReservationOwnerType;
  ownerId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  stayTypeId: string;
  siteId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
};

export type ReservationCreateResponse = {
  id?: string;
  message?: string;
};

export type ReservationFormStayType = {
  id: string;
  name: string;
  siteType: 'cabin' | 'rv' | 'tent';
  minimumStay: number;
};

export type ReservationFormSite = {
  id: string;
  code: string;
  type: 'cabin' | 'rv' | 'tent';
  area: string;
};
