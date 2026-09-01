import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
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
