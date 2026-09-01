import { connectToDatabase } from '@/lib/db';
import type { FaqRulesOverview } from '@/lib/faqRules';
import { parseFaqRuleTab } from '@/lib/faqRules';
import { FAQItem } from '@/models/FAQItem';
import { Policy } from '@/models/Policy';
import { ResortRule } from '@/models/ResortRule';

export async function getFaqRulesOverview(
  params: Record<string, string | string[] | undefined>,
): Promise<FaqRulesOverview> {
  await connectToDatabase();
  const [faqCount, rulesCount, policiesCount] = await Promise.all([
    FAQItem.countDocuments(),
    ResortRule.countDocuments(),
    Policy.countDocuments(),
  ]);

  return {
    activeTab: parseFaqRuleTab(params.tab),
    counts: {
      faq: faqCount,
      rules: rulesCount,
      policies: policiesCount,
    },
  };
}
