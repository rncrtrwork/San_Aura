export type PublicManagedContentItem = {
  id: string;
  category: string;
  title: string;
  body: string;
  relatedLinks: { label: string; url: string }[];
  displayOrder: number;
};

export type PublicManagedContentCategory = {
  category: string;
  items: PublicManagedContentItem[];
};

export type PublicManagedContentPage = {
  categories: PublicManagedContentCategory[];
};

export function groupedPublicManagedContentItems(
  items: PublicManagedContentItem[],
): PublicManagedContentPage {
  const sortedItems = items.slice().sort((left, right) => {
    const orderDifference = left.displayOrder - right.displayOrder;
    if (orderDifference !== 0) return orderDifference;
    return left.title.localeCompare(right.title);
  });
  const categoriesByName = new Map<string, PublicManagedContentItem[]>();

  for (const item of sortedItems) {
    const categoryItems = categoriesByName.get(item.category) ?? [];
    categoryItems.push(item);
    categoriesByName.set(item.category, categoryItems);
  }

  return {
    categories: Array.from(categoriesByName.entries()).map(([category, categoryItems]) => ({
      category,
      items: categoryItems,
    })),
  };
}
