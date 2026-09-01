import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CONTENT_PAGE_DEFAULTS,
  CONTENT_PAGE_SLUGS,
  parseContentPageSlug,
} from '@/lib/contentManager';

test('content page parser accepts known CMS pages', () => {
  assert.equal(parseContentPageSlug('history'), 'history');
  assert.equal(parseContentPageSlug('first-visit'), 'first-visit');
});

test('content page parser defaults to home for invalid input', () => {
  assert.equal(parseContentPageSlug('rates'), 'home');
  assert.equal(parseContentPageSlug(['history']), 'home');
  assert.equal(parseContentPageSlug(undefined), 'home');
});

test('content page defaults include the required shell pages', () => {
  assert.deepEqual(CONTENT_PAGE_SLUGS, [
    'home',
    'our-story',
    'history',
    'first-visit',
    'contact',
    'footer',
  ]);
  assert.equal(CONTENT_PAGE_DEFAULTS.history.title, 'History');
});
