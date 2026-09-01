'use client';

import { GripVertical, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type {
  FaqCategoryReorderRequest,
  FaqCategoryReorderResponse,
  FaqRuleCategorySummary,
  FaqRuleTab,
} from '@/lib/faqRules';

type FaqCategoryTreeProps = {
  tab: FaqRuleTab;
  categories: FaqRuleCategorySummary[];
};

export function FaqCategoryTree({ tab, categories }: FaqCategoryTreeProps) {
  const router = useRouter();
  const [orderedCategories, setOrderedCategories] = useState(categories);
  const [draggedCategory, setDraggedCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  function moveCategory(sourceName: string, targetName: string) {
    if (!sourceName || sourceName === targetName) return;
    const sourceIndex = orderedCategories.findIndex((category) => category.name === sourceName);
    const targetIndex = orderedCategories.findIndex((category) => category.name === targetName);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const nextCategories = [...orderedCategories];
    const [movedCategory] = nextCategories.splice(sourceIndex, 1);
    nextCategories.splice(targetIndex, 0, movedCategory);
    setOrderedCategories(nextCategories);
  }

  async function saveOrder() {
    setSaving(true);
    setError('');
    setNotice('');
    const payload: FaqCategoryReorderRequest = {
      tab,
      categories: orderedCategories.map((category) => category.name),
    };

    try {
      const response = await fetch('/api/admin/faq-rules/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as FaqCategoryReorderResponse;
      if (!response.ok || typeof result.updatedCount !== 'number') {
        throw new Error(result.message ?? 'Unable to save category order.');
      }
      setNotice(`Saved order for ${orderedCategories.length} categories.`);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save category order.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="admin-card p-5" aria-labelledby="category-tree-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            Categories
          </p>
          <h2 id="category-tree-heading" className="mt-1 font-serif text-2xl text-forest-900">
            Content tree
          </h2>
          <p className="mt-2 text-sm text-admin-muted">
            Drag categories to reorder their display grouping.
          </p>
        </div>
        <button
          type="button"
          onClick={saveOrder}
          disabled={saving || orderedCategories.length === 0}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-admin-sidebar px-3 text-xs font-bold text-admin-sidebar hover:bg-admin-sidebar hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <LoaderCircle aria-hidden="true" className="size-3 animate-spin" /> : null}
          Save Order
        </button>
      </div>

      {orderedCategories.length === 0 ? (
        <div className="mt-5 rounded-lg bg-cream-alt p-4 text-sm text-admin-muted">
          No categories yet. Add content to start building the tree.
        </div>
      ) : (
        <ol className="mt-5 space-y-2">
          {orderedCategories.map((category) => (
            <li
              key={category.name}
              draggable
              onDragStart={() => setDraggedCategory(category.name)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => moveCategory(draggedCategory, category.name)}
              className="flex cursor-grab items-center gap-3 rounded-lg border border-admin-border bg-white p-3 active:cursor-grabbing"
            >
              <GripVertical aria-hidden="true" className="size-4 shrink-0 text-admin-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-forest-900">{category.name}</p>
                <p className="mt-0.5 text-xs text-admin-muted">
                  {category.itemCount} item{category.itemCount === 1 ? '' : 's'} ·{' '}
                  {category.publishedCount} published · {category.draftCount} draft
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {error ? <p className="mt-3 text-sm font-semibold text-admin-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm font-semibold text-admin-success">{notice}</p> : null}
    </aside>
  );
}
