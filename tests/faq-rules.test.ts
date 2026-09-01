import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseFaqRuleTab } from '@/lib/faqRules';
import { richTextReplacement } from '@/lib/richTextToolbar';
import { validateFaqCategoryReorder } from '@/server/faqRules/categoryValidation';
import { validateFaqItemCreate } from '@/server/faqRules/faqItemValidation';

test('faq rules tab parser accepts known tabs', () => {
  assert.equal(parseFaqRuleTab('faq'), 'faq');
  assert.equal(parseFaqRuleTab('rules'), 'rules');
  assert.equal(parseFaqRuleTab('policies'), 'policies');
});

test('faq rules tab parser defaults to faq for invalid tabs', () => {
  assert.equal(parseFaqRuleTab('settings'), 'faq');
  assert.equal(parseFaqRuleTab(['rules']), 'faq');
  assert.equal(parseFaqRuleTab(undefined), 'faq');
});

test('faq category reorder validation accepts unique category order', () => {
  const result = validateFaqCategoryReorder({
    tab: 'faq',
    categories: ['Reservations', 'Privacy', 'Reservations'],
  });

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.deepEqual(result.data.categories, ['Reservations', 'Privacy']);
  }
});

test('faq category reorder validation rejects invalid tabs', () => {
  const result = validateFaqCategoryReorder({
    tab: 'faq',
    categories: [],
  });

  assert.equal(result.valid, false);
});

test('faq item validation accepts a complete draft item', () => {
  const result = validateFaqItemCreate({
    category: 'Reservations',
    question: 'What time is check-in?',
    slug: '',
    answer: '<p>Check-in begins at 2 PM.</p>',
    relatedLinks: [{ label: 'Rates', url: 'https://sunauraresort.net/rates' }],
    displayOrder: 10,
  });

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.slug, 'what-time-is-check-in');
  }
});

test('faq item validation rejects incomplete related links', () => {
  const result = validateFaqItemCreate({
    category: 'Reservations',
    question: 'What time is check-in?',
    slug: '',
    answer: 'Check-in begins at 2 PM.',
    relatedLinks: [{ label: 'Rates', url: 'not-a-url' }],
    displayOrder: 10,
  });

  assert.equal(result.valid, false);
});

test('rich text toolbar replacement wraps selected text', () => {
  assert.equal(richTextReplacement('bold', 'check-in'), '<strong>check-in</strong>');
  assert.equal(richTextReplacement('italic', ''), '<em>italic text</em>');
  assert.equal(richTextReplacement('link', 'rates'), '<a href="https://example.com">rates</a>');
});
