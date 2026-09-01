import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { test } from 'node:test';
import {
  buildCalendarMapLoadFixtures,
  summarizeCalendarMapLoad,
} from '@/lib/calendarMapLoadProfile';

test('calendar and resort-map load profile handles 187 sites across a season', () => {
  const fixtures = buildCalendarMapLoadFixtures(187, 180);
  const start = performance.now();
  const summary = summarizeCalendarMapLoad(fixtures);
  const elapsedMilliseconds = performance.now() - start;

  assert.equal(summary.siteCount, 187);
  assert.equal(summary.activeReservationCount, 544);
  assert.equal(summary.blockedSiteCount, 54);
  assert.equal(summary.mapStatusCounts.available, 47);
  assert.equal(summary.mapStatusCounts.occupied, 47);
  assert.equal(summary.mapStatusCounts.maintenance, 47);
  assert.equal(summary.mapStatusCounts.blocked, 46);
  assert.ok(elapsedMilliseconds < 150);
});
