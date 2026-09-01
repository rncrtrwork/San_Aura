import type { EventStatus } from '@/models/Event';

export type EventMutationRequest = {
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  capacity: number | null;
  registrationRequired: boolean;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  featureOnHomepage: boolean;
  sendReminder: boolean;
  status: EventStatus;
};

export type EventMutationResponse = {
  id?: string;
  message?: string;
};
