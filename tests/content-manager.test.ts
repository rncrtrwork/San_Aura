import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CONTENT_PAGE_DEFAULTS,
  CONTENT_PAGE_SLUGS,
  isContentPageSlug,
  parseContentPageSlug,
} from '@/lib/contentManager';
import {
  validateContentSectionOrder,
  validateContentSectionStatus,
} from '@/server/content/sectionValidation';
import { validateHeroSection } from '@/server/content/heroSectionValidation';
import { validateRichTextSection } from '@/server/content/richTextSectionValidation';
import { validateTimelineSection } from '@/server/content/timelineSectionValidation';

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

test('content page slug guard narrows valid page slugs', () => {
  assert.equal(isContentPageSlug('contact'), true);
  assert.equal(isContentPageSlug('book-online'), false);
});

test('content section order validation accepts unique keys', () => {
  const result = validateContentSectionOrder({
    sectionKeys: ['hero-main', 'history-timeline', 'footer-cta'],
  });

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.deepEqual(result.data.sectionKeys, ['hero-main', 'history-timeline', 'footer-cta']);
  }
});

test('content section order validation rejects duplicate keys', () => {
  const result = validateContentSectionOrder({
    sectionKeys: ['hero-main', 'hero-main'],
  });

  assert.equal(result.valid, false);
});

test('content section status validation requires a boolean active state', () => {
  assert.equal(validateContentSectionStatus({ active: true }).valid, true);
  assert.equal(validateContentSectionStatus({}).valid, false);
});

test('hero section validation accepts H1 copy and optional media id', () => {
  const result = validateHeroSection({
    sectionKey: 'Hero Main',
    imageId: '',
    eyebrow: 'Welcome',
    heading: 'A quiet resort getaway',
    body: 'Relax under the trees.',
    active: true,
  });

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.sectionKey, 'hero-main');
  }
});

test('hero section validation rejects missing H1 copy and invalid image ids', () => {
  assert.equal(
    validateHeroSection({
      sectionKey: '',
      imageId: '',
      eyebrow: '',
      heading: '',
      body: '',
      active: true,
    }).valid,
    false,
  );
  assert.equal(
    validateHeroSection({
      sectionKey: '',
      imageId: 'not-an-object-id',
      eyebrow: '',
      heading: 'Valid heading',
      body: '',
      active: true,
    }).valid,
    false,
  );
});

test('rich text section validation accepts formatted body copy', () => {
  const result = validateRichTextSection({
    sectionKey: 'Intro Copy',
    body: '<p>Plan your first quiet weekend at Sun Aura.</p>',
    active: true,
  });

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.sectionKey, 'intro-copy');
  }
});

test('rich text section validation rejects empty body copy', () => {
  assert.equal(
    validateRichTextSection({
      sectionKey: '',
      body: '',
      active: true,
    }).valid,
    false,
  );
});

test('timeline section validation accepts complete timeline items', () => {
  const result = validateTimelineSection({
    sectionKey: 'History Timeline',
    sectionLabel: 'Resort History',
    backgroundColor: 'ivory',
    layout: 'alternating',
    showOnNavigation: true,
    active: true,
    items: [
      {
        year: '1998',
        title: 'The resort opens',
        description: 'Sun Aura welcomes its first seasonal guests.',
      },
    ],
  });

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.sectionKey, 'history-timeline');
  }
});

test('timeline section validation rejects incomplete timeline items', () => {
  const result = validateTimelineSection({
    sectionKey: '',
    sectionLabel: 'History',
    backgroundColor: 'ivory',
    layout: 'alternating',
    showOnNavigation: true,
    active: true,
    items: [{ year: '1998', title: '', description: 'Missing title.' }],
  });

  assert.equal(result.valid, false);
});

test('timeline section validation preserves layout controls', () => {
  const result = validateTimelineSection({
    sectionKey: 'Stacked Timeline',
    sectionLabel: 'Milestones',
    backgroundColor: 'forest',
    layout: 'stacked',
    showOnNavigation: false,
    active: true,
    items: [
      {
        year: '2026',
        title: 'New website rebuild',
        description: 'The content system begins powering public pages.',
      },
    ],
  });

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.backgroundColor, 'forest');
    assert.equal(result.data.layout, 'stacked');
    assert.equal(result.data.showOnNavigation, false);
  }
});
