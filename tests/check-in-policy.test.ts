import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateCheckInPolicy } from '@/server/reservations/checkInPolicy';

const arrival = new Date('2026-09-01T12:00:00.000Z');

test('check-in is blocked before the arrival date', () => {
  const result = evaluateCheckInPolicy(
    arrival,
    '14:00',
    'UTC',
    new Date('2026-08-31T20:00:00.000Z'),
  );
  assert.equal(result.allowed, false);
});

test('check-in is blocked before the configured time on arrival day', () => {
  const result = evaluateCheckInPolicy(
    arrival,
    '14:00',
    'UTC',
    new Date('2026-09-01T13:59:00.000Z'),
  );
  assert.equal(result.allowed, false);
  assert.match(result.message, /14:00/);
});

test('check-in opens at the configured property time', () => {
  const result = evaluateCheckInPolicy(
    arrival,
    '14:00',
    'UTC',
    new Date('2026-09-01T14:00:00.000Z'),
  );
  assert.equal(result.allowed, true);
});
