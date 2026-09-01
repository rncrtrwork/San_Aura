import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { EventMutationRequest, EventMutationResponse } from '@/lib/eventForms';
import { Event } from '@/models/Event';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';
import { validateEventMutation } from '@/server/events/eventValidation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'events.write');
  if (!authorization.authorized) return authorization.response;

  const { eventId } = await context.params;
  if (!Types.ObjectId.isValid(eventId)) {
    return NextResponse.json<EventMutationResponse>(
      { message: 'Event not found.' },
      { status: 404 },
    );
  }

  let body: EventMutationRequest;
  try {
    body = (await request.json()) as EventMutationRequest;
  } catch {
    return NextResponse.json<EventMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateEventMutation(body);
  if (!validation.valid) {
    return NextResponse.json<EventMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const event = await Event.findById(eventId).select(
    'title startsAt endsAt location capacity registrationRequired imageUrl imagePublicId status featureOnHomepage sendReminder',
  );
  if (!event) {
    return NextResponse.json<EventMutationResponse>(
      { message: 'Event not found.' },
      { status: 404 },
    );
  }

  const beforeSnapshot = {
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    location: event.location,
    capacity: event.capacity,
    registrationRequired: event.registrationRequired,
    imageUrl: event.imageUrl,
    status: event.status,
    featureOnHomepage: event.featureOnHomepage,
    sendReminder: event.sendReminder,
  };
  event.set(validation.data);
  await event.save();
  await logActivity({
    actorId: authorization.staff.userId,
    action: beforeSnapshot.status !== event.status ? 'status-change' : 'update',
    entityType: 'Event',
    entityId: event._id,
    beforeSnapshot,
    afterSnapshot: {
      title: event.title,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      location: event.location,
      capacity: event.capacity,
      registrationRequired: event.registrationRequired,
      imageUrl: event.imageUrl,
      status: event.status,
      featureOnHomepage: event.featureOnHomepage,
      sendReminder: event.sendReminder,
    },
  });

  return NextResponse.json<EventMutationResponse>({ message: 'Event saved.' });
}
