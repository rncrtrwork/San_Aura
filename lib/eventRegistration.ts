export type PublicEventItem = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  capacity: number | null;
  registrationRequired: boolean;
  description: string;
  imageUrl: string;
};

export type PublicEventRegistrationRequest = {
  name: string;
  email: string;
  phone: string;
  partySize: number;
};

export type PublicEventRegistrationResponse = {
  id?: string;
  message?: string;
  remainingCapacity?: number | null;
};
