import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { SiteMutationRequest } from '@/lib/adminSites';
import { validateSiteMutation } from '@/server/sites/siteValidation';

function validSite(overrides: Partial<SiteMutationRequest> = {}): SiteMutationRequest {
  return {
    code: '42',
    type: 'rv',
    area: 'Central Park',
    amenities: ['Picnic table', 'Shade'],
    status: 'available',
    maintenanceNote: '',
    length: 35,
    hookups: ['Electric', 'Water'],
    mapPosition: { x: 52.12, y: 43.88 },
    active: true,
    ...overrides,
  };
}

test('site validation accepts a complete map site', () => {
  const result = validateSiteMutation(validSite());

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.code, '42');
    assert.equal(result.data.mapPosition?.x, 52.12);
    assert.deepEqual(result.data.hookups, ['Electric', 'Water']);
  }
});

test('site validation allows blank optional length and map position', () => {
  const result = validateSiteMutation(validSite({ length: null, mapPosition: null }));

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.length, null);
    assert.equal(result.data.mapPosition, null);
  }
});

test('site validation rejects invalid marker coordinates', () => {
  const result = validateSiteMutation(validSite({ mapPosition: { x: 120, y: 50 } }));

  assert.equal(result.valid, false);
});

test('site validation rejects missing required site details', () => {
  const result = validateSiteMutation(validSite({ code: '', area: '' }));

  assert.equal(result.valid, false);
});
