import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildEventDateTimeRange } from '@/lib/eventDateTime';

test('event datetime range keeps same-day events on the selected date', () => {
  assert.deepEqual(buildEventDateTimeRange('2026-09-11', '18:00', '20:00'), {
    startsAt: '2026-09-11T18:00:00',
    endsAt: '2026-09-11T20:00:00',
  });
});

test('event datetime range rolls midnight end times to the next day', () => {
  assert.deepEqual(buildEventDateTimeRange('2026-09-11', '20:00', '00:00'), {
    startsAt: '2026-09-11T20:00:00',
    endsAt: '2026-09-12T00:00:00',
  });
});
