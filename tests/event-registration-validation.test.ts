import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validatePublicEventRegistration } from '@/server/events/eventRegistrationValidation';

const registration = {
  name: 'Riley Hart',
  email: 'riley@example.com',
  phone: '219-555-0199',
  partySize: 2,
};

test('public event registration accepts valid guest details', () => {
  const result = validatePublicEventRegistration(registration);
  assert.equal(result.valid, true);
});

test('public event registration rejects invalid email', () => {
  const result = validatePublicEventRegistration({ ...registration, email: 'bad-email' });
  assert.equal(result.valid, false);
});

test('public event registration rejects invalid party size', () => {
  const result = validatePublicEventRegistration({ ...registration, partySize: 0 });
  assert.equal(result.valid, false);
});
