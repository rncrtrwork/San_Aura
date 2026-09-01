import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  SETTINGS_TAB_DEFINITIONS,
  SETTINGS_TABS,
  parseSettingsTab,
  settingsTabHref,
} from '@/lib/settingsManager';
import { validateOperatingSettings } from '@/server/settings/operatingValidation';
import { validatePropertySettings } from '@/server/settings/propertyValidation';

test('settings tabs include the required administration sections', () => {
  assert.deepEqual(SETTINGS_TABS, [
    'property',
    'booking',
    'payments',
    'notifications',
    'staff-roles',
    'integrations',
  ]);
  assert.equal(SETTINGS_TAB_DEFINITIONS.length, SETTINGS_TABS.length);
});

test('settings tab parser falls back to property', () => {
  assert.equal(parseSettingsTab('booking'), 'booking');
  assert.equal(parseSettingsTab('staff-roles'), 'staff-roles');
  assert.equal(parseSettingsTab('bad-tab'), 'property');
  assert.equal(parseSettingsTab(['booking']), 'property');
  assert.equal(parseSettingsTab(undefined), 'property');
});

test('settings tab hrefs keep property as the canonical base route', () => {
  assert.equal(settingsTabHref('property'), '/admin/settings');
  assert.equal(settingsTabHref('notifications'), '/admin/settings?tab=notifications');
});

test('property settings validation accepts complete property details', () => {
  const result = validatePropertySettings({
    resortName: 'Sun Aura Resort',
    logoUrl: 'https://res.cloudinary.com/demo/image/upload/sun-aura/settings/logo.png',
    logoPublicId: 'sun-aura/settings/logo',
    address: {
      street: '3449 East State Road 10',
      city: 'Lake Village',
      state: 'Indiana',
      postalCode: '46349',
      country: 'United States',
    },
    phone: '219-345-2000',
    email: 'SUN@EXAMPLE.COM',
    timezone: 'America/Chicago',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    keyReturnTime: '11:00',
  });

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.email, 'sun@example.com');
  }
});

test('property settings validation rejects invalid uploads and times', () => {
  assert.equal(
    validatePropertySettings({
      resortName: 'Sun Aura Resort',
      logoUrl: 'javascript:alert(1)',
      logoPublicId: 'sun-aura/settings/logo',
      address: {
        street: '3449 East State Road 10',
        city: 'Lake Village',
        state: 'Indiana',
        postalCode: '46349',
        country: 'United States',
      },
      phone: '219-345-2000',
      email: 'sun@example.com',
      timezone: 'America/Chicago',
      checkInTime: '14:00',
      checkOutTime: 'bad',
      keyReturnTime: '11:00',
    }).valid,
    false,
  );
});

test('operating settings validation accepts season display details', () => {
  const result = validateOperatingSettings({
    openYearRound: true,
    taxRatePercent: 7.125,
    currency: 'usd',
    dateFormat: 'MM/DD/YYYY',
  });

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.taxRatePercent, 7.13);
    assert.equal(result.data.currency, 'USD');
  }
});

test('operating settings validation rejects invalid tax and currency values', () => {
  assert.equal(
    validateOperatingSettings({
      openYearRound: true,
      taxRatePercent: 120,
      currency: 'US',
      dateFormat: '',
    }).valid,
    false,
  );
});
