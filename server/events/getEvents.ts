import { Types } from 'mongoose';
import { Event, EVENT_STATUSES, type EventStatus } from '@/models/Event';
import { EventRegistration } from '@/models/EventRegistration';
import { connectToDatabase } from '@/lib/db';
import type { EventListFilters, EventListResult, EventStatusFilter } from '@/lib/eventFilters';

type EventQuery = {
  status?: EventStatus;
  startsAt?: {
    $gte?: Date;
    $lt?: Date;
  };
};

function valueOf(params: Record<string, string | string[] | undefined>, key: string): string {
  const value = params[key];
  return typeof value === 'string' ? value.trim() : '';
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));
}

function dayStart(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function nextDayStart(value: string): Date {
  const date = dayStart(value);
  date.setDate(date.getDate() + 1);
  return date;
}

export function parseEventFilters(
  params: Record<string, string | string[] | undefined>,
): EventListFilters {
  const statusValue = valueOf(params, 'status');
  const startDate = valueOf(params, 'startDate');
  const endDate = valueOf(params, 'endDate');
  const validStartDate = isIsoDate(startDate) ? startDate : '';
  const validEndDate = isIsoDate(endDate) ? endDate : '';

  return {
    status: EVENT_STATUSES.find((status) => status === statusValue) ?? 'all',
    startDate: validStartDate,
    endDate: validStartDate && validEndDate < validStartDate ? '' : validEndDate,
  };
}

function buildEventQuery(filters: EventListFilters): EventQuery {
  const query: EventQuery = {};
  if (filters.status !== 'all') {
    query.status = filters.status;
  }
  if (filters.startDate || filters.endDate) {
    query.startsAt = {};
    if (filters.startDate) {
      query.startsAt.$gte = dayStart(filters.startDate);
    }
    if (filters.endDate) {
      query.startsAt.$lt = nextDayStart(filters.endDate);
    }
  }
  return query;
}

export async function getEvents(filters: EventListFilters): Promise<EventListResult> {
  await connectToDatabase();
  const query = buildEventQuery(filters);
  const [events, statusCounts] = await Promise.all([
    Event.find(query)
      .select(
        'title startsAt endsAt location capacity registrationRequired imageUrl status featureOnHomepage sendReminder',
      )
      .sort({ startsAt: -1, createdAt: -1 })
      .limit(100)
      .lean(),
    Event.aggregate<{ _id: EventStatus; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const eventIds = events.map((event) => event._id);
  const registrationCounts =
    eventIds.length === 0
      ? []
      : await EventRegistration.aggregate<{ _id: Types.ObjectId; count: number }>([
          { $match: { eventRef: { $in: eventIds } } },
          { $group: { _id: '$eventRef', count: { $sum: '$partySize' } } },
        ]);
  const registrationCountsByEvent = new Map(
    registrationCounts.map((entry): [string, number] => [entry._id.toString(), entry.count]),
  );
  const counts = Object.fromEntries([
    ['all', statusCounts.reduce((total, entry) => total + entry.count, 0)],
    ...EVENT_STATUSES.map((eventStatus): [EventStatus, number] => [
      eventStatus,
      statusCounts.find((entry) => entry._id === eventStatus)?.count ?? 0,
    ]),
  ]) as Record<EventStatusFilter, number>;

  return {
    events: events.map((event) => ({
      id: event._id.toString(),
      title: event.title,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
      location: event.location,
      capacity: event.capacity,
      registrationRequired: event.registrationRequired,
      registrationsCount: registrationCountsByEvent.get(event._id.toString()) ?? 0,
      imageUrl: event.imageUrl,
      status: event.status,
      featureOnHomepage: event.featureOnHomepage,
      sendReminder: event.sendReminder,
    })),
    counts,
  };
}
