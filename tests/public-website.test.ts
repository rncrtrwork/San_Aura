import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isValidMemberEmail, normalizeMemberEmail } from '@/lib/memberAuth';
import { publicAddressLines, publicMailtoHref, publicTelHref } from '@/lib/publicContact';
import {
  calculatePublicReservationTotal,
  validatePublicBookingAvailability,
  validatePublicBookingRequest,
} from '@/lib/publicBooking';
import { groupedPublicFaqItems, type PublicFaqItem } from '@/lib/publicFaq';
import { groupedPublicGalleryAssets, type PublicGalleryAsset } from '@/lib/publicGallery';
import {
  groupedPublicManagedContentItems,
  type PublicManagedContentItem,
} from '@/lib/publicManagedContent';
import { publicMapStatusSummary, type PublicMapSite } from '@/lib/publicMap';
import { publicSeoFields } from '@/lib/publicSeo';
import { PUBLIC_WEBSITE_REDIRECTS } from '@/lib/publicRedirects';
import { publicStartingRateLabel } from '@/lib/publicStays';
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

test('public stay starting rates render guest-friendly labels', () => {
  assert.equal(publicStartingRateLabel(125), 'From $125 / night');
  assert.equal(publicStartingRateLabel(0), 'Rate available on request');
});

test('public contact helpers render address and contact links', () => {
  const contact = {
    resortName: 'Sun Aura Resort',
    address: {
      street: '3449 East State Road 10',
      city: 'Lake Village',
      state: 'Indiana',
      postalCode: '46349',
      country: 'United States',
    },
    phone: '(219) 345-2000',
    email: 'hello@example.com',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    keyReturnTime: '11:00',
  };

  assert.deepEqual(publicAddressLines(contact), [
    '3449 East State Road 10',
    'Lake Village, Indiana 46349',
    'United States',
  ]);
  assert.equal(publicTelHref(contact.phone), 'tel:2193452000');
  assert.equal(publicMailtoHref(contact.email), 'mailto:hello@example.com');
});

test('public booking availability validation accepts date range and site type', () => {
  const result = validatePublicBookingAvailability({
    checkIn: '2026-10-02',
    checkOut: '2026-10-04',
    siteType: 'rv',
  });

  assert.equal(result.valid, true);
});

test('public booking validation rejects invalid dates and contact fields', () => {
  const result = validatePublicBookingRequest({
    guestName: '',
    guestEmail: 'guest',
    guestPhone: '',
    stayTypeId: 'stay',
    siteId: 'site',
    checkIn: '2026-10-04',
    checkOut: '2026-10-02',
    guestsCount: 2,
  });

  assert.equal(result.valid, false);
});

test('public reservation total applies weekend and extra guest rates', () => {
  const total = calculatePublicReservationTotal(
    new Date('2026-10-02T12:00:00'),
    new Date('2026-10-05T12:00:00'),
    4,
    { baseRate: 100, weekendRate: 150, extraGuestFee: 10, cleaningFee: 25 },
  );

  assert.equal(total, 485);
});

test('public SEO fields prefer CMS seo fields over fallbacks', () => {
  assert.deepEqual(
    publicSeoFields(
      {
        title: 'Home',
        seoTitle: 'Modern Resort Website',
        metaDescription: 'CMS-powered resort website description.',
      },
      { title: 'Fallback title', description: 'Fallback description' },
    ),
    {
      title: 'Modern Resort Website',
      description: 'CMS-powered resort website description.',
    },
  );
});

test('public redirect map preserves legacy Weebly URLs as 301s', () => {
  assert.equal(
    PUBLIC_WEBSITE_REDIRECTS.every((redirect) => redirect.statusCode === 301),
    true,
  );
  assert.deepEqual(
    PUBLIC_WEBSITE_REDIRECTS.filter((redirect) =>
      [
        '/index.html',
        '/book-your-reservations-online.html',
        '/frequently-asked-questions.html',
        '/rules-and-safety-information.html',
        '/map-of-sun-aura-resort.html',
        '/images-of-sun-aura.html',
        '/camping-fees-and-rental-prices.html',
        '/about-sun-aura.html',
      ].includes(redirect.source),
    ).map((redirect) => redirect.destination),
    ['/', '/book', '/faq', '/rules', '/resort-map', '/gallery', '/stays-and-rates', '/our-story'],
  );
});

test('member auth normalizes and validates member email input', () => {
  assert.equal(normalizeMemberEmail(' Member@Example.COM '), 'member@example.com');
  assert.equal(isValidMemberEmail('member@example.com'), true);
  assert.equal(isValidMemberEmail('member'), false);
});
