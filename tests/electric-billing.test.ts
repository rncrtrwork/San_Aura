import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeKwhDelta, validateElectricReadingRequest } from '@/lib/electricReadingForms';
import {
  calculateElectricCharge,
  electricBillingPeriodDays,
  resolveBillingMode,
  type ElectricBillingMember,
  type ElectricBillingSite,
} from '@/lib/electricBilling';

const site: ElectricBillingSite = {
  type: 'rv',
  hookups: ['electric'],
};

function member(input: ElectricBillingMember): ElectricBillingMember {
  return input;
}

test('billing mode resolver maps every membership tier to its default electric mode', () => {
  assert.deepEqual(
    resolveBillingMode(member({ membershipTier: '2850', electricBillingMode: null }), site),
    {
      mode: 'flat25',
      source: 'membership-tier',
      unitRate: 25,
      unitLabel: 'day',
      siteType: 'rv',
    },
  );
  assert.deepEqual(
    resolveBillingMode(member({ membershipTier: '2000', electricBillingMode: null }), site),
    {
      mode: 'weekly',
      source: 'membership-tier',
      unitRate: null,
      unitLabel: 'week',
      siteType: 'rv',
    },
  );
  assert.deepEqual(
    resolveBillingMode(member({ membershipTier: '1250', electricBillingMode: null }), site),
    {
      mode: 'flat15',
      source: 'membership-tier',
      unitRate: 15,
      unitLabel: 'day',
      siteType: 'rv',
    },
  );
  assert.deepEqual(
    resolveBillingMode(member({ membershipTier: '500', electricBillingMode: null }), site),
    {
      mode: 'kwh',
      source: 'membership-tier',
      unitRate: 0.25,
      unitLabel: 'kWh',
      siteType: 'rv',
    },
  );
});

test('billing mode resolver honors stated per-member exceptions', () => {
  assert.deepEqual(
    resolveBillingMode(member({ membershipTier: '2000', electricBillingMode: 'flat25' }), site),
    {
      mode: 'flat25',
      source: 'member-override',
      unitRate: 25,
      unitLabel: 'day',
      siteType: 'rv',
    },
  );
  assert.deepEqual(
    resolveBillingMode(member({ membershipTier: '500', electricBillingMode: 'flat15' }), null),
    {
      mode: 'flat15',
      source: 'member-override',
      unitRate: 15,
      unitLabel: 'day',
      siteType: null,
    },
  );
});

test('electric reading helpers validate input and compute kWh deltas', () => {
  assert.deepEqual(
    validateElectricReadingRequest({
      siteId: ' site-1 ',
      meterValue: 1542.75,
      readingDate: '2026-09-01',
    }),
    {
      siteId: 'site-1',
      meterValue: 1542.75,
      readingDate: '2026-09-01',
    },
  );
  assert.equal(computeKwhDelta(1542.75, 1500.25), 42.5);
  assert.equal(computeKwhDelta(1542.75, null), 0);
});

test('electric reading validation rejects malformed meter entries', () => {
  assert.equal(
    validateElectricReadingRequest({ siteId: '', meterValue: -1, readingDate: '2026-09-01' }),
    'Enter a valid meter value.',
  );
  assert.equal(
    validateElectricReadingRequest({ siteId: '', meterValue: 10, readingDate: 'not-a-date' }),
    'Enter a valid reading date.',
  );
});

test('electric charge calculation supports kWh and flat daily modes', () => {
  const start = new Date('2026-09-01T12:00:00.000Z');
  const end = new Date('2026-09-04T12:00:00.000Z');

  assert.equal(electricBillingPeriodDays(start, end), 3);
  assert.equal(
    calculateElectricCharge({ mode: 'kwh', kwhUsed: 42.5, periodStart: start, periodEnd: end }),
    10.63,
  );
  assert.equal(
    calculateElectricCharge({ mode: 'flat25', kwhUsed: 42.5, periodStart: start, periodEnd: end }),
    75,
  );
  assert.equal(
    calculateElectricCharge({ mode: 'flat15', kwhUsed: 42.5, periodStart: start, periodEnd: end }),
    45,
  );
});

test('electric charge calculation leaves baseline and weekly readings uncharged', () => {
  const end = new Date('2026-09-04T12:00:00.000Z');

  assert.equal(
    calculateElectricCharge({ mode: 'flat25', kwhUsed: 0, periodStart: null, periodEnd: end }),
    0,
  );
  assert.equal(
    calculateElectricCharge({
      mode: 'weekly',
      kwhUsed: 42.5,
      periodStart: new Date('2026-09-01T12:00:00.000Z'),
      periodEnd: end,
    }),
    0,
  );
});
