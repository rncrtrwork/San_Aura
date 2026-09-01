import { FAQ_RULE_TABS, type FaqCategoryReorderRequest } from '@/lib/faqRules';

export type FaqCategoryReorderValidationResult =
  | { valid: true; data: FaqCategoryReorderRequest }
  | { valid: false; message: string };

function categoryName(value: string): string {
  return value.trim().slice(0, 120);
}

export function validateFaqCategoryReorder(
  input: Partial<FaqCategoryReorderRequest> | null,
): FaqCategoryReorderValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Category order details are required.' };
  }

  const tab = input.tab;
  const categories = Array.isArray(input.categories)
    ? input.categories
        .filter((category) => typeof category === 'string')
        .map(categoryName)
        .filter(Boolean)
    : [];
  const uniqueCategories = Array.from(new Set(categories));

  if (!tab || !FAQ_RULE_TABS.includes(tab)) {
    return { valid: false, message: 'Select a valid content tab.' };
  }
  if (uniqueCategories.length === 0) {
    return { valid: false, message: 'At least one category is required.' };
  }
  if (uniqueCategories.length > 50) {
    return { valid: false, message: 'Category reordering is limited to 50 categories.' };
  }

  return {
    valid: true,
    data: {
      tab,
      categories: uniqueCategories,
    },
  };
}
