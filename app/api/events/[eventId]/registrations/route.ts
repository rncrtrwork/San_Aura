import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import type {
  PublicEventRegistrationRequest,
  PublicEventRegistrationResponse,
} from '@/lib/eventRegistration';
import { connectToDatabase } from '@/lib/db';
import { Event } from '@/models/Event';
import { EventRegistration } from '@/models/EventRegistration';
import { Guest } from '@/models/Guest';
import { validatePublicEventRegistration } from '@/server/events/eventRegistrationValidation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { eventId } = await context.params;
  if (!Types.ObjectId.isValid(eventId)) {
    return NextResponse.json<PublicEventRegistrationResponse>(
      { message: 'Event not found.' },
      { status: 404 },
    );
  }

  let body: PublicEventRegistrationRequest;
  try {
    body = (await request.json()) as PublicEventRegistrationRequest;
  } catch {
    return NextResponse.json<PublicEventRegistrationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validatePublicEventRegistration(body);
  if (!validation.valid) {
    return NextResponse.json<PublicEventRegistrationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const event = await Event.findOne({
    _id: eventId,
    status: 'published',
    registrationRequired: true,
    startsAt: { $gte: new Date() },
  }).select('capacity title');
  if (!event) {
    return NextResponse.json<PublicEventRegistrationResponse>(
      { message: 'This event is not accepting registrations.' },
      { status: 404 },
    );
  }
  if (event.capacity !== null && event.capacity < validation.data.partySize) {
    return NextResponse.json<PublicEventRegistrationResponse>(
      { message: 'This event does not have enough spots remaining.' },
      { status: 409 },
    );
  }

  let decrementedCapacity = false;
  if (event.capacity !== null) {
    const capacityUpdate = await Event.updateOne(
      { _id: event._id, capacity: { $gte: validation.data.partySize } },
      { $inc: { capacity: -validation.data.partySize } },
    );
    if (capacityUpdate.modifiedCount !== 1) {
      return NextResponse.json<PublicEventRegistrationResponse>(
        { message: 'This event does not have enough spots remaining.' },
        { status: 409 },
      );
    }
    decrementedCapacity = true;
  }

  const guest = await Guest.findOneAndUpdate(
    { email: validation.data.email },
    {
      $set: {
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  try {
    const registration = await EventRegistration.create({
      eventRef: event._id,
      registrantType: 'Guest',
      guestOrMemberRef: guest._id,
      partySize: validation.data.partySize,
    });
    const updatedEvent = decrementedCapacity
      ? await Event.findById(event._id).select('capacity').lean()
      : event;
    const remainingCapacity = updatedEvent?.capacity ?? null;

    return NextResponse.json<PublicEventRegistrationResponse>(
      {
        id: registration._id.toString(),
        message: 'Registration received.',
        remainingCapacity,
      },
      { status: 201 },
    );
  } catch {
    if (decrementedCapacity) {
      await Event.updateOne({ _id: event._id }, { $inc: { capacity: validation.data.partySize } });
    }
    return NextResponse.json<PublicEventRegistrationResponse>(
      { message: 'This guest is already registered for the event.' },
      { status: 409 },
    );
  }
}
