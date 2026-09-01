export const FAQ_RULE_TABS = ['faq', 'rules', 'policies'] as const;
export const FAQ_PUBLISH_STATUSES = ['draft', 'published'] as const;

export type FaqRuleTab = (typeof FAQ_RULE_TABS)[number];
export type FaqPublishStatus = (typeof FAQ_PUBLISH_STATUSES)[number];

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
  faqRevisionItems: FaqRevisionItem[];
  selectedRevisionItem: FaqRevisionItem | null;
  managedContentItems: ManagedContentItemSummary[];
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
  status: FaqPublishStatus;
  seoTitle: string;
  metaDescription: string;
  featured: boolean;
};

export type FaqItemCreateResponse = {
  item?: {
    id: string;
    question: string;
  };
  message?: string;
};

export type FaqRevisionSummary = {
  title: string;
  bodyPreview: string;
  editedAt: string;
};

export type FaqRevisionItem = {
  id: string;
  question: string;
  category: string;
  slug: string;
  status: FaqPublishStatus;
  revisionCount: number;
  revisions: FaqRevisionSummary[];
};

export type ManagedContentRuleTab = Exclude<FaqRuleTab, 'faq'>;

export type ManagedContentItemRequest = {
  category: string;
  title: string;
  slug: string;
  body: string;
  relatedLinks: FaqRelatedLinkInput[];
  displayOrder: number;
  status: FaqPublishStatus;
  seoTitle: string;
  metaDescription: string;
};

export type ManagedContentItemSummary = ManagedContentItemRequest & {
  id: string;
  revisionCount: number;
};

export type ManagedContentItemResponse = {
  item?: {
    id: string;
    title: string;
  };
  message?: string;
};

export function faqRevisionPreview(value: string): string {
  const plainText = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return plainText.length > 120 ? `${plainText.slice(0, 117)}...` : plainText;
}
