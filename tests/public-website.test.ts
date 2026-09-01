import assert from 'node:assert/strict';
import { test } from 'node:test';
import { publicNavigationItems, publicPageHref } from '@/lib/publicWebsite';

test('public page href keeps home at the root path', () => {
  assert.equal(publicPageHref('home'), '/');
  assert.equal(publicPageHref('first-visit'), '/first-visit');
});

test('public navigation falls back when CMS has no visible pages', () => {
  const items = publicNavigationItems([]);

  assert.equal(items[0]?.href, '/');
  assert.equal(
    items.some((item) => item.href === '/events'),
    true,
  );
});

test('public navigation only includes published CMS pages marked visible', () => {
  const items = publicNavigationItems([
    {
      slug: 'contact',
      title: 'Contact',
      navLabel: 'Talk to us',
      navVisibility: true,
      publishStatus: 'published',
    },
    {
      slug: 'history',
      title: 'History',
      navLabel: '',
      navVisibility: true,
      publishStatus: 'draft',
    },
    {
      slug: 'first-visit',
      title: 'First Visit',
      navLabel: 'Start Here',
      navVisibility: false,
      publishStatus: 'published',
    },
    {
      slug: 'home',
      title: 'Home',
      navLabel: '',
      navVisibility: true,
      publishStatus: 'published',
    },
  ]);

  assert.deepEqual(items, [
    { slug: 'home', label: 'Home', href: '/' },
    { slug: 'contact', label: 'Talk to us', href: '/contact' },
  ]);
});
