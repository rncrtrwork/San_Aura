import { connectToDatabase } from '@/lib/db';
import type { PublicEventItem } from '@/lib/eventRegistration';
import { Event } from '@/models/Event';

export async function getPublicEvents(now = new Date()): Promise<PublicEventItem[]> {
  await connectToDatabase();
  const events = await Event.find({
    status: 'published',
    startsAt: { $gte: now },
  })
    .select('title startsAt endsAt location capacity registrationRequired description imageUrl')
    .sort({ startsAt: 1 })
    .limit(24)
    .lean();

  return events.map((event) => ({
    id: event._id.toString(),
    title: event.title,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt.toISOString(),
    location: event.location,
    capacity: event.capacity,
    registrationRequired: event.registrationRequired,
    description: event.description,
    imageUrl: event.imageUrl,
  }));
}
