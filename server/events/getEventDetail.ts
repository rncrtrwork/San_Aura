import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import type { EventListItem } from '@/lib/eventFilters';
import { Event } from '@/models/Event';
import { EventRegistration } from '@/models/EventRegistration';

export async function getEventDetail(eventId: string): Promise<EventListItem | null> {
  if (!Types.ObjectId.isValid(eventId)) return null;

  await connectToDatabase();
  const event = await Event.findById(eventId)
    .select(
      'title startsAt endsAt location capacity registrationRequired description imageUrl imagePublicId status featureOnHomepage sendReminder',
    )
    .lean();
  if (!event) return null;

  const registrations = await EventRegistration.aggregate<{ total: number }>([
    { $match: { eventRef: event._id } },
    { $group: { _id: null, total: { $sum: '$partySize' } } },
  ]);

  return {
    id: event._id.toString(),
    title: event.title,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt.toISOString(),
    location: event.location,
    capacity: event.capacity,
    registrationRequired: event.registrationRequired,
    description: event.description,
    registrationsCount: registrations[0]?.total ?? 0,
    imageUrl: event.imageUrl,
    imagePublicId: event.imagePublicId,
    status: event.status,
    featureOnHomepage: event.featureOnHomepage,
    sendReminder: event.sendReminder,
  };
}
