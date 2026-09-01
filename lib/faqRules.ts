export const FAQ_RULE_TABS = ['faq', 'rules', 'policies'] as const;

export type FaqRuleTab = (typeof FAQ_RULE_TABS)[number];

export type FaqRuleTabCounts = Record<FaqRuleTab, number>;

export type FaqRuleCategorySummary = {
  name: string;
  itemCount: number;
  publishedCount: number;
  draftCount: number;
};

export type FaqRulesOverview = {
  activeTab: FaqRuleTab;
  counts: FaqRuleTabCounts;
  categories: FaqRuleCategorySummary[];
};

export function parseFaqRuleTab(value: string | string[] | undefined): FaqRuleTab {
  const tab = typeof value === 'string' ? value : '';
  return FAQ_RULE_TABS.find((entry) => entry === tab) ?? 'faq';
}

export type FaqCategoryReorderRequest = {
  tab: FaqRuleTab;
  categories: string[];
};

export type FaqCategoryReorderResponse = {
  updatedCount?: number;
  message?: string;
};

export type FaqRelatedLinkInput = {
  label: string;
  url: string;
};

export type FaqItemCreateRequest = {
  category: string;
  question: string;
  slug: string;
  answer: string;
  relatedLinks: FaqRelatedLinkInput[];
  displayOrder: number;
};

export type FaqItemCreateResponse = {
  item?: {
    id: string;
    question: string;
  };
  message?: string;
};
