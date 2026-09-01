import { connectToDatabase } from '@/lib/db';
import type { FaqRuleCategorySummary, FaqRuleTab, FaqRulesOverview } from '@/lib/faqRules';
import { parseFaqRuleTab } from '@/lib/faqRules';
import type { ManagedContentStatus } from '@/models/managedContentFields';
import { FAQItem } from '@/models/FAQItem';
import { Policy } from '@/models/Policy';
import { ResortRule } from '@/models/ResortRule';

type CategorySourceItem = {
  category: string;
  displayOrder: number;
  status: ManagedContentStatus;
};

type CategoryAccumulator = {
  itemCount: number;
  publishedCount: number;
  draftCount: number;
  minDisplayOrder: number;
};

function summarizeCategories(items: CategorySourceItem[]): FaqRuleCategorySummary[] {
  const categories = new Map<string, CategoryAccumulator>();

  for (const item of items) {
    const current = categories.get(item.category) ?? {
      itemCount: 0,
      publishedCount: 0,
      draftCount: 0,
      minDisplayOrder: item.displayOrder,
    };
    categories.set(item.category, {
      itemCount: current.itemCount + 1,
      publishedCount: current.publishedCount + (item.status === 'published' ? 1 : 0),
      draftCount: current.draftCount + (item.status === 'draft' ? 1 : 0),
      minDisplayOrder: Math.min(current.minDisplayOrder, item.displayOrder),
    });
  }

  return Array.from(categories.entries())
    .sort((left, right) => {
      const orderDifference = left[1].minDisplayOrder - right[1].minDisplayOrder;
      return orderDifference === 0 ? left[0].localeCompare(right[0]) : orderDifference;
    })
    .map(([name, counts]) => ({
      name,
      itemCount: counts.itemCount,
      publishedCount: counts.publishedCount,
      draftCount: counts.draftCount,
    }));
}

async function getCategoryItems(tab: FaqRuleTab): Promise<CategorySourceItem[]> {
  if (tab === 'rules') {
    return ResortRule.find()
      .select('category displayOrder status')
      .sort({ displayOrder: 1, category: 1 })
      .lean<CategorySourceItem[]>();
  }
  if (tab === 'policies') {
    return Policy.find()
      .select('category displayOrder status')
      .sort({ displayOrder: 1, category: 1 })
      .lean<CategorySourceItem[]>();
  }
  return FAQItem.find()
    .select('category displayOrder status')
    .sort({ displayOrder: 1, category: 1 })
    .lean<CategorySourceItem[]>();
}

export async function getFaqRulesOverview(
  params: Record<string, string | string[] | undefined>,
): Promise<FaqRulesOverview> {
  await connectToDatabase();
  const activeTab = parseFaqRuleTab(params.tab);
  const [faqCount, rulesCount, policiesCount] = await Promise.all([
    FAQItem.countDocuments(),
    ResortRule.countDocuments(),
    Policy.countDocuments(),
  ]);

  return {
    activeTab,
    counts: {
      faq: faqCount,
      rules: rulesCount,
      policies: policiesCount,
    },
    categories: summarizeCategories(await getCategoryItems(activeTab)),
  };
}
