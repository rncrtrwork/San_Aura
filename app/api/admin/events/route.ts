import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { EventMutationRequest, EventMutationResponse } from '@/lib/eventForms';
import { Event } from '@/models/Event';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';
import { validateEventMutation } from '@/server/events/eventValidation';

export const runtime = 'nodejs';

export const POST = requirePermission('events.write', async (request, staff) => {
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
  const event = await Event.create(validation.data);
  await logActivity({
    actorId: staff.userId,
    action: 'create',
    entityType: 'Event',
    entityId: event._id,
    afterSnapshot: {
      title: event.title,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      status: event.status,
    },
  });

  return NextResponse.json<EventMutationResponse>(
    { id: event._id.toString(), message: 'Event created.' },
    { status: 201 },
  );
});
