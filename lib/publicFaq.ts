export type PublicFaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  relatedLinks: { label: string; url: string }[];
  displayOrder: number;
  featured: boolean;
};

export type PublicFaqCategory = {
  category: string;
  items: PublicFaqItem[];
};

export type PublicFaqPage = {
  featuredItems: PublicFaqItem[];
  categories: PublicFaqCategory[];
};

export function groupedPublicFaqItems(items: PublicFaqItem[]): PublicFaqPage {
  const sortedItems = items.slice().sort((left, right) => {
    const orderDifference = left.displayOrder - right.displayOrder;
    if (orderDifference !== 0) return orderDifference;
    return left.question.localeCompare(right.question);
  });
  const featuredItems = sortedItems.filter((item) => item.featured);
  const categoriesByName = new Map<string, PublicFaqItem[]>();

  for (const item of sortedItems) {
    const categoryItems = categoriesByName.get(item.category) ?? [];
    categoryItems.push(item);
    categoriesByName.set(item.category, categoryItems);
  }

  return {
    featuredItems,
    categories: Array.from(categoriesByName.entries()).map(([category, categoryItems]) => ({
      category,
      items: categoryItems,
    })),
  };
}
