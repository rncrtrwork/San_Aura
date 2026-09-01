import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  SETTINGS_TAB_DEFINITIONS,
  SETTINGS_TABS,
  parseSettingsTab,
  settingsTabHref,
} from '@/lib/settingsManager';

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
