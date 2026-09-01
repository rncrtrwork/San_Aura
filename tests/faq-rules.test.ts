import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseFaqRuleTab } from '@/lib/faqRules';

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
