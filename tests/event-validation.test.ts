import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateEventMutation } from '@/server/events/eventValidation';

const validEvent = {
  title: 'Sunset Social',
  startsAt: '2026-09-12T18:00:00',
  endsAt: '2026-09-12T20:00:00',
  location: 'Pool Deck',
  capacity: 50,
  registrationRequired: true,
  description: 'An evening resort social.',
  imageUrl: 'https://example.com/event.jpg',
  imagePublicId: '',
  featureOnHomepage: false,
  sendReminder: false,
  status: 'draft',
} as const;

test('event validation accepts a complete event draft', () => {
  const result = validateEventMutation(validEvent);
  assert.equal(result.valid, true);
});

test('event validation rejects an end time before the start time', () => {
  const result = validateEventMutation({
    ...validEvent,
    endsAt: '2026-09-12T17:00:00',
  });
  assert.equal(result.valid, false);
});

test('event validation rejects malformed image urls', () => {
  const result = validateEventMutation({
    ...validEvent,
    imageUrl: 'not-a-url',
  });
  assert.equal(result.valid, false);
});
