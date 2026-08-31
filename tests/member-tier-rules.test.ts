import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server';
import { GET, resolveTierRulesRequest } from '@/app/api/admin/members/tier-rules/route';

test('permanent-space tiers resolve consistently through the API resolver', () => {
  for (const tier of ['2850', '2000', '500']) {
    const resolution = resolveTierRulesRequest(tier);
    assert.equal(resolution.status, 200);
    assert.equal(resolution.body.rules?.tier, tier);
    assert.equal(resolution.body.rules?.permanentSpaceAssignment, true);
    assert.equal(resolution.body.rules?.dayFeeExempt, false);
  }
});

test('the 1250 tier resolves to the day-fee exemption', () => {
  const resolution = resolveTierRulesRequest('1250');
  assert.equal(resolution.status, 200);
  assert.deepEqual(resolution.body.rules, {
    tier: '1250',
    annualDues: 1250,
    permanentSpaceAssignment: false,
    dayFeeExempt: true,
  });
});

test('missing and unsupported tiers return a client error', () => {
  for (const tier of [null, '', '999']) {
    const resolution = resolveTierRulesRequest(tier);
    assert.equal(resolution.status, 400);
    assert.equal(resolution.body.rules, undefined);
    assert.equal(resolution.body.message, 'A valid membership tier is required.');
  }
});

test('the tier-rules API rejects unauthenticated requests', async () => {
  const request = new NextRequest('http://localhost/api/admin/members/tier-rules?tier=1250');
  const response = await GET(request);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: 'Authentication required' });
});
