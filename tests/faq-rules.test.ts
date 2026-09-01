import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseFaqRuleTab } from '@/lib/faqRules';
import { validateFaqCategoryReorder } from '@/server/faqRules/categoryValidation';

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
