import type { EventMutationRequest } from '@/lib/eventForms';
import { EVENT_STATUSES, type EventStatus } from '@/models/Event';

export type ValidEventInput = {
  title: string;
  startsAt: Date;
  endsAt: Date;
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

type ValidationResult = { valid: true; data: ValidEventInput } | { valid: false; message: string };

function isEventStatus(value: string): value is EventStatus {
  return EVENT_STATUSES.some((status) => status === value);
}

function parseDateTime(value: string): Date | null {
  if (!value || Number.isNaN(Date.parse(value))) return null;
  return new Date(value);
}

function validUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function validCapacity(value: number | null): number | null | false {
  if (value === null) return null;
  if (!Number.isInteger(value) || value < 1 || value > 10000) return false;
  return value;
}

export function validateEventMutation(body: EventMutationRequest): ValidationResult {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const startsAt = typeof body.startsAt === 'string' ? parseDateTime(body.startsAt) : null;
  const endsAt = typeof body.endsAt === 'string' ? parseDateTime(body.endsAt) : null;
  const location = typeof body.location === 'string' ? body.location.trim() : '';
  const capacity = validCapacity(body.capacity);
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
  const imagePublicId = typeof body.imagePublicId === 'string' ? body.imagePublicId.trim() : '';
  const status = typeof body.status === 'string' && isEventStatus(body.status) ? body.status : null;

  if (!title || title.length > 160) {
    return { valid: false, message: 'Enter an event title under 160 characters.' };
  }
  if (!startsAt || !endsAt || endsAt < startsAt) {
    return { valid: false, message: 'Choose a valid event start and end time.' };
  }
  if (!location || location.length > 200) {
    return { valid: false, message: 'Enter an event location under 200 characters.' };
  }
  if (capacity === false) {
    return { valid: false, message: 'Capacity must be a whole number above zero.' };
  }
  if (typeof body.registrationRequired !== 'boolean') {
    return { valid: false, message: 'Choose whether registration is required.' };
  }
  if (!description || description.length > 10000) {
    return { valid: false, message: 'Enter an event description under 10,000 characters.' };
  }
  if (!validUrl(imageUrl)) {
    return { valid: false, message: 'Enter a valid event image URL.' };
  }
  if (imagePublicId.length > 500) {
    return { valid: false, message: 'Image public ID is too long.' };
  }
  if (
    typeof body.featureOnHomepage !== 'boolean' ||
    typeof body.sendReminder !== 'boolean' ||
    !status
  ) {
    return { valid: false, message: 'Event publishing options are incomplete.' };
  }

  return {
    valid: true,
    data: {
      title,
      startsAt,
      endsAt,
      location,
      capacity,
      registrationRequired: body.registrationRequired,
      description,
      imageUrl,
      imagePublicId,
      featureOnHomepage: body.featureOnHomepage,
      sendReminder: body.sendReminder,
      status,
    },
  };
}
