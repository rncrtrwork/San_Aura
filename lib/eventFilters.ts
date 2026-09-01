import type { EventStatus } from '@/models/Event';

export type EventStatusFilter = EventStatus | 'all';

export type EventListFilters = {
  status: EventStatusFilter;
  startDate: string;
  endDate: string;
};

export type EventListItem = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  capacity: number | null;
  registrationRequired: boolean;
  description: string;
  registrationsCount: number;
  imageUrl: string;
  imagePublicId: string;
  status: EventStatus;
  featureOnHomepage: boolean;
  sendReminder: boolean;
};

export type EventListResult = {
  events: EventListItem[];
  counts: Record<EventStatusFilter, number>;
};
