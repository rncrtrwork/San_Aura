import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  SETTINGS_TAB_DEFINITIONS,
  SETTINGS_TABS,
  enabledNotificationCount,
  NOTIFICATION_SETTING_DEFINITIONS,
  parseSettingsTab,
  privacyPolicySummaryText,
  settingsTabHref,
} from '@/lib/settingsManager';
import { validateBookingSettings } from '@/server/settings/bookingValidation';
import { validateNotificationSettings } from '@/server/settings/notificationValidation';
import { validateOperatingSettings } from '@/server/settings/operatingValidation';
import { validatePropertySettings } from '@/server/settings/propertyValidation';
import { validatePrivacySettings } from '@/server/settings/privacyValidation';

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

test('booking settings validation accepts reservation defaults', () => {
  const result = validateBookingSettings({
    cancellationWindowDays: 7,
    depositRequirementPercent: 25,
    minimumAge: 21,
    defaultMinimumStay: 2,
  });

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.minimumAge, 21);
  }
});

test('booking settings validation rejects out-of-range defaults', () => {
  assert.equal(
    validateBookingSettings({
      cancellationWindowDays: -1,
      depositRequirementPercent: 101,
      minimumAge: 17,
      defaultMinimumStay: 0,
    }).valid,
    false,
  );
});

test('privacy settings validation accepts explicit boolean toggles', () => {
  const result = validatePrivacySettings({
    photographyProhibited: true,
    videoProhibited: true,
    showPrivacyNoticeAtBooking: false,
  });

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.showPrivacyNoticeAtBooking, false);
  }
});

test('privacy settings validation rejects missing toggles', () => {
  assert.equal(validatePrivacySettings({ photographyProhibited: true }).valid, false);
});

test('privacy policy summary reflects booking visibility', () => {
  assert.equal(
    privacyPolicySummaryText({
      photographyProhibited: true,
      videoProhibited: true,
      showPrivacyNoticeAtBooking: true,
    }),
    'Photography is not permitted on the property and video recording is not permitted on the property. Guests will see this privacy notice during booking.',
  );
});

test('notification settings validation accepts MVP alert toggles', () => {
  const result = validateNotificationSettings({
    newReservation: true,
    cancellation: false,
    paymentRecorded: true,
    arrivalReminder: true,
  });

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(enabledNotificationCount(result.data), 3);
  }
});

test('notification settings validation rejects missing boolean toggles', () => {
  assert.equal(validateNotificationSettings({ newReservation: true }).valid, false);
});

test('notification labels use payment recorded wording for MVP', () => {
  const paymentDefinition = NOTIFICATION_SETTING_DEFINITIONS.find(
    (definition) => definition.key === 'paymentRecorded',
  );

  assert.equal(paymentDefinition?.label, 'Payment Recorded');
});

test('settings staff summaries can carry role permission counts', () => {
  const roles = [
    { id: 'role-admin', name: 'Admin', permissionCount: 20 },
    { id: 'role-editor', name: 'Content Editor', permissionCount: 7 },
  ];

  assert.equal(
    roles.reduce((total, role) => total + role.permissionCount, 0),
    27,
  );
});
