'use client';

import { LoaderCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type {
  FaqItemCreateRequest,
  FaqItemCreateResponse,
  FaqRelatedLinkInput,
  FaqRuleCategorySummary,
} from '@/lib/faqRules';

type FaqItemCreateFormProps = {
  categories: FaqRuleCategorySummary[];
};

const emptyRelatedLinks: FaqRelatedLinkInput[] = [
  { label: '', url: '' },
  { label: '', url: '' },
  { label: '', url: '' },
];

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);
}

export function FaqItemCreateForm({ categories }: FaqItemCreateFormProps) {
  const router = useRouter();
  const [category, setCategory] = useState(categories[0]?.name ?? '');
  const [customCategory, setCustomCategory] = useState('');
  const [question, setQuestion] = useState('');
  const [slug, setSlug] = useState('');
  const [answer, setAnswer] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [relatedLinks, setRelatedLinks] = useState<FaqRelatedLinkInput[]>(emptyRelatedLinks);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const resolvedCategory = customCategory.trim() || category;
  const resolvedSlug = useMemo(() => slug || slugify(question), [question, slug]);

  function updateRelatedLink(index: number, field: keyof FaqRelatedLinkInput, value: string) {
    setRelatedLinks((current) =>
      current.map((link, linkIndex) =>
        linkIndex === index
          ? {
              ...link,
              [field]: value,
            }
          : link,
      ),
    );
  }

  async function createFaqItem() {
    setSaving(true);
    setError('');
    setNotice('');
    const payload: FaqItemCreateRequest = {
      category: resolvedCategory,
      question,
      slug: resolvedSlug,
      answer,
      relatedLinks,
      displayOrder,
    };

    try {
      const response = await fetch('/api/admin/faq-rules/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as FaqItemCreateResponse;
      if (!response.ok || !result.item) {
        throw new Error(result.message ?? 'Unable to create FAQ item.');
      }
      setQuestion('');
      setSlug('');
      setAnswer('');
      setDisplayOrder(0);
      setRelatedLinks(emptyRelatedLinks);
      setNotice(`Created FAQ item: ${result.item.question}`);
      router.refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create FAQ item.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-admin-border bg-cream-alt/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            New FAQ
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">Add FAQ Item</h3>
          <p className="mt-2 text-sm text-admin-muted">
            Create a draft FAQ with category, slug, answer, related links, and display order.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-admin-muted">
          Draft
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Existing category
          </span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          >
            <option value="">Choose category</option>
            {categories.map((entry) => (
              <option key={entry.name} value={entry.name}>
                {entry.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            New category
          </span>
          <input
            value={customCategory}
            onChange={(event) => setCustomCategory(event.target.value)}
            placeholder="Reservations"
            maxLength={120}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          />
        </label>
        <label>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Question
          </span>
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What time is check-in?"
            maxLength={300}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          />
        </label>
        <label>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Slug
          </span>
          <input
            value={resolvedSlug}
            onChange={(event) => setSlug(slugify(event.target.value))}
            maxLength={160}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
          Rich-text answer
        </span>
        <textarea
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Write the answer guests should see..."
          maxLength={50000}
          className="mt-2 min-h-36 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900"
        />
      </label>

      <div className="mt-4 grid gap-4 lg:grid-cols-[10rem_minmax(0,1fr)]">
        <label>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Display order
          </span>
          <input
            type="number"
            min="0"
            max="100000"
            value={displayOrder}
            onChange={(event) => setDisplayOrder(Number(event.target.value))}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          />
        </label>

        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Related links
          </legend>
          <div className="mt-2 grid gap-2">
            {relatedLinks.map((link, index) => (
              <div key={index} className="grid gap-2 md:grid-cols-[minmax(10rem,0.8fr)_1fr]">
                <input
                  value={link.label}
                  onChange={(event) => updateRelatedLink(index, 'label', event.target.value)}
                  placeholder="Link label"
                  maxLength={120}
                  className="h-10 rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
                />
                <input
                  value={link.url}
                  onChange={(event) => updateRelatedLink(index, 'url', event.target.value)}
                  placeholder="https://..."
                  maxLength={2000}
                  className="h-10 rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
                />
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      {error ? <p className="mt-3 text-sm font-semibold text-admin-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm font-semibold text-admin-success">{notice}</p> : null}

      <button
        type="button"
        onClick={createFaqItem}
        disabled={saving || !resolvedCategory || !question.trim() || !answer.trim()}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Plus aria-hidden="true" className="size-4" />
        )}
        Add FAQ Item
      </button>
    </section>
  );
}
