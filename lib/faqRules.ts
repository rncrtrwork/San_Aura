export const FAQ_RULE_TABS = ['faq', 'rules', 'policies'] as const;

export type FaqRuleTab = (typeof FAQ_RULE_TABS)[number];

export type FaqRuleTabCounts = Record<FaqRuleTab, number>;

export type FaqRulesOverview = {
  activeTab: FaqRuleTab;
  counts: FaqRuleTabCounts;
};

export function parseFaqRuleTab(value: string | string[] | undefined): FaqRuleTab {
  const tab = typeof value === 'string' ? value : '';
  return FAQ_RULE_TABS.find((entry) => entry === tab) ?? 'faq';
}
