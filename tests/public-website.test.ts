import assert from 'node:assert/strict';
import { test } from 'node:test';
import { groupedPublicFaqItems, type PublicFaqItem } from '@/lib/publicFaq';
import { groupedPublicGalleryAssets, type PublicGalleryAsset } from '@/lib/publicGallery';
import {
  groupedPublicManagedContentItems,
  type PublicManagedContentItem,
} from '@/lib/publicManagedContent';
import { publicMapStatusSummary, type PublicMapSite } from '@/lib/publicMap';
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

const faqItems: PublicFaqItem[] = [
  {
    id: 'two',
    category: 'Arrival',
    question: 'When is check-in?',
    answer: '<p>After posted check-in time.</p>',
    relatedLinks: [],
    displayOrder: 2,
    featured: false,
  },
  {
    id: 'one',
    category: 'Privacy',
    question: 'Can guests take photos?',
    answer: '<p>No photos or video.</p>',
    relatedLinks: [],
    displayOrder: 1,
    featured: true,
  },
];

test('public FAQ grouping pins featured items and preserves category groups', () => {
  const page = groupedPublicFaqItems(faqItems);

  assert.deepEqual(
    page.featuredItems.map((item) => item.id),
    ['one'],
  );
  assert.deepEqual(
    page.categories.map((category) => category.category),
    ['Privacy', 'Arrival'],
  );
});

const managedItems: PublicManagedContentItem[] = [
  {
    id: 'quiet-hours',
    category: 'During Your Stay',
    title: 'Quiet hours',
    body: '<p>Keep shared spaces restful.</p>',
    relatedLinks: [],
    displayOrder: 2,
  },
  {
    id: 'photos',
    category: 'Privacy',
    title: 'No photos or video',
    body: '<p>Photography is prohibited.</p>',
    relatedLinks: [],
    displayOrder: 1,
  },
];

test('public managed content groups published rules and policies by display order', () => {
  const page = groupedPublicManagedContentItems(managedItems);

  assert.deepEqual(
    page.categories.map((category) => category.category),
    ['Privacy', 'During Your Stay'],
  );
  assert.deepEqual(
    page.categories.flatMap((category) => category.items.map((item) => item.id)),
    ['photos', 'quiet-hours'],
  );
});

const mapSites: PublicMapSite[] = [
  { id: 'one', code: 'Cabin 1', type: 'cabin', status: 'available', x: 10, y: 20 },
  { id: 'two', code: 'RV 2', type: 'rv', status: 'occupied', x: 20, y: 30 },
  { id: 'three', code: 'Tent 3', type: 'tent', status: 'available', x: 30, y: 40 },
];

test('public map status summary counts read-only site states', () => {
  assert.deepEqual(publicMapStatusSummary(mapSites), {
    available: 2,
    occupied: 1,
    maintenance: 0,
    blocked: 0,
  });
});

const galleryAssets: PublicGalleryAsset[] = [
  {
    id: 'one',
    url: 'https://res.cloudinary.com/demo/image/upload/one.jpg',
    altText: 'Cabin',
    caption: '',
    mediaType: 'image',
    album: { id: 'cabins', path: 'Stay Types > Cabins' },
    focalPoint: { x: 50, y: 50 },
  },
  {
    id: 'two',
    url: 'https://res.cloudinary.com/demo/image/upload/two.jpg',
    altText: 'Pool',
    caption: '',
    mediaType: 'image',
    album: null,
    focalPoint: { x: 50, y: 50 },
  },
];

test('public gallery assets group by album with resort highlights fallback', () => {
  const groups = groupedPublicGalleryAssets(galleryAssets);

  assert.deepEqual(
    groups.map((group) => group.albumLabel),
    ['Resort Highlights', 'Stay Types > Cabins'],
  );
});
