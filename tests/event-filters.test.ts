import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseEventFilters } from '@/server/events/getEvents';

test('event filters accept status and date range values', () => {
  assert.deepEqual(
    parseEventFilters({
      status: 'published',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    }),
    {
      status: 'published',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    },
  );
});

test('event filters discard invalid status and dates', () => {
  assert.deepEqual(
    parseEventFilters({
      status: 'archived',
      startDate: 'September 1',
      endDate: '2026-13-01',
    }),
    {
      status: 'all',
      startDate: '',
      endDate: '',
    },
  );
});

test('event filters clear an end date before the start date', () => {
  assert.deepEqual(
    parseEventFilters({
      startDate: '2026-09-30',
      endDate: '2026-09-01',
    }),
    {
      status: 'all',
      startDate: '2026-09-30',
      endDate: '',
    },
  );
});
