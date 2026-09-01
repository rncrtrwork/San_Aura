import { connectToDatabase } from '@/lib/db';
import type {
  FaqPublishStatus,
  FaqRevisionItem,
  FaqRuleCategorySummary,
  FaqRuleTab,
  FaqRulesOverview,
} from '@/lib/faqRules';
import { faqRevisionPreview, parseFaqRuleTab } from '@/lib/faqRules';
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

type FaqRevisionLean = {
  title: string;
  body: string;
  editedAt: Date;
};

type FaqRevisionItemLean = {
  _id: string;
  question: string;
  category: string;
  slug: string;
  status: FaqPublishStatus;
  revisionHistory?: FaqRevisionLean[];
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

function serializeFaqRevisionItems(items: FaqRevisionItemLean[]): FaqRevisionItem[] {
  return items.map((item) => {
    const revisions = item.revisionHistory ?? [];

    return {
      id: item._id.toString(),
      question: item.question,
      category: item.category,
      slug: item.slug,
      status: item.status,
      revisionCount: revisions.length,
      revisions: revisions
        .slice()
        .sort((left, right) => right.editedAt.getTime() - left.editedAt.getTime())
        .map((revision) => ({
          title: revision.title,
          bodyPreview: faqRevisionPreview(revision.body),
          editedAt: revision.editedAt.toISOString(),
        })),
    };
  });
}

async function getFaqRevisionItems(): Promise<FaqRevisionItem[]> {
  const items = await FAQItem.find()
    .select('question category slug status revisionHistory')
    .sort({ updatedAt: -1, displayOrder: 1, question: 1 })
    .limit(20)
    .lean<FaqRevisionItemLean[]>();

  return serializeFaqRevisionItems(items);
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
  const faqRevisionItems = activeTab === 'faq' ? await getFaqRevisionItems() : [];
  const requestedRevisionItemId = typeof params.revisions === 'string' ? params.revisions : '';
  const selectedRevisionItem =
    faqRevisionItems.find((item) => item.id === requestedRevisionItemId) ??
    faqRevisionItems[0] ??
    null;

  return {
    activeTab,
    counts: {
      faq: faqCount,
      rules: rulesCount,
      policies: policiesCount,
    },
    categories: summarizeCategories(await getCategoryItems(activeTab)),
    faqRevisionItems,
    selectedRevisionItem,
  };
}
