'use client';

import { LoaderCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import type {
  FaqItemCreateRequest,
  FaqItemCreateResponse,
  FaqPublishStatus,
  FaqRelatedLinkInput,
  FaqRuleCategorySummary,
} from '@/lib/faqRules';
import { FAQ_PUBLISH_STATUSES } from '@/lib/faqRules';
import { richTextReplacement, type RichTextAction } from '@/lib/richTextToolbar';
import { RichTextToolbar } from '@/components/admin/RichTextToolbar';

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
  const answerRef = useRef<HTMLTextAreaElement | null>(null);
  const [category, setCategory] = useState(categories[0]?.name ?? '');
  const [customCategory, setCustomCategory] = useState('');
  const [question, setQuestion] = useState('');
  const [slug, setSlug] = useState('');
  const [answer, setAnswer] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [status, setStatus] = useState<FaqPublishStatus>('draft');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [featured, setFeatured] = useState(false);
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

  function formatAnswer(action: RichTextAction) {
    const textarea = answerRef.current;
    const start = textarea?.selectionStart ?? answer.length;
    const end = textarea?.selectionEnd ?? answer.length;
    const selectedText = answer.slice(start, end);
    const replacement = richTextReplacement(action, selectedText);
    setAnswer(`${answer.slice(0, start)}${replacement}${answer.slice(end)}`);
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
      status,
      seoTitle,
      metaDescription,
      featured,
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
      setStatus('draft');
      setSeoTitle('');
      setMetaDescription('');
      setFeatured(false);
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

      <div className="mt-4 rounded-lg border border-admin-border bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">Publishing</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
              Status
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as FaqPublishStatus)}
              className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
            >
              {FAQ_PUBLISH_STATUSES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry.charAt(0).toUpperCase()}
                  {entry.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-start gap-3 rounded-lg bg-cream-alt p-3 text-sm text-forest-900">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
              className="mt-1 size-4 rounded border-admin-border text-admin-accent"
            />
            <span>
              <span className="font-bold">Featured FAQ</span>
              <span className="mt-1 block text-xs leading-relaxed text-admin-muted">
                Pin this answer near the top of the public FAQ once published.
              </span>
            </span>
          </label>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label>
            <span className="flex justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
              SEO title
              <span>{seoTitle.length}/60</span>
            </span>
            <input
              value={seoTitle}
              onChange={(event) => setSeoTitle(event.target.value.slice(0, 60))}
              maxLength={60}
              className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
            />
          </label>
          <label>
            <span className="flex justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
              Meta description
              <span>{metaDescription.length}/160</span>
            </span>
            <textarea
              value={metaDescription}
              onChange={(event) => setMetaDescription(event.target.value.slice(0, 160))}
              maxLength={160}
              className="mt-2 min-h-20 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900"
            />
          </label>
        </div>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
          Rich-text answer
        </span>
        <div className="mt-2">
          <RichTextToolbar onFormat={formatAnswer} />
        </div>
        <textarea
          ref={answerRef}
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Write the answer guests should see..."
          maxLength={50000}
          className="min-h-36 w-full rounded-b-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900"
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
