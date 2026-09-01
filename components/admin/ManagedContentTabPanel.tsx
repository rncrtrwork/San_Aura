'use client';

import { LoaderCircle, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import type {
  FaqPublishStatus,
  FaqRelatedLinkInput,
  FaqRuleCategorySummary,
  ManagedContentItemRequest,
  ManagedContentItemResponse,
  ManagedContentItemSummary,
  ManagedContentRuleTab,
} from '@/lib/faqRules';
import { FAQ_PUBLISH_STATUSES } from '@/lib/faqRules';
import { richTextReplacement, type RichTextAction } from '@/lib/richTextToolbar';
import { RichTextToolbar } from '@/components/admin/RichTextToolbar';

type ManagedContentTabPanelProps = {
  tab: ManagedContentRuleTab;
  label: string;
  singularLabel: string;
  categories: FaqRuleCategorySummary[];
  items: ManagedContentItemSummary[];
};

type FormState = ManagedContentItemRequest;

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

function emptyForm(category: string): FormState {
  return {
    category,
    title: '',
    slug: '',
    body: '',
    relatedLinks: emptyRelatedLinks,
    displayOrder: 0,
    status: 'draft',
    seoTitle: '',
    metaDescription: '',
  };
}

function formFromItem(item: ManagedContentItemSummary): FormState {
  return {
    category: item.category,
    title: item.title,
    slug: item.slug,
    body: item.body,
    relatedLinks:
      item.relatedLinks.length > 0
        ? [...item.relatedLinks, ...emptyRelatedLinks].slice(0, 5)
        : emptyRelatedLinks,
    displayOrder: item.displayOrder,
    status: item.status,
    seoTitle: item.seoTitle,
    metaDescription: item.metaDescription,
  };
}

function resolvedForm(form: FormState): FormState {
  return {
    ...form,
    slug: form.slug || slugify(form.title),
  };
}

function bodyPreview(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function ManagedContentTabPanel({
  tab,
  label,
  singularLabel,
  categories,
  items,
}: ManagedContentTabPanelProps) {
  const router = useRouter();
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm(categories[0]?.name ?? ''));
  const [editingId, setEditingId] = useState('');
  const [editingForm, setEditingForm] = useState<FormState>(() =>
    emptyForm(categories[0]?.name ?? ''),
  );
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const resolvedCreateForm = useMemo(() => resolvedForm(form), [form]);
  const resolvedEditingForm = useMemo(() => resolvedForm(editingForm), [editingForm]);
  const endpoint = `/api/admin/faq-rules/${tab}`;

  function patchForm(update: Partial<FormState>) {
    setForm((current) => ({ ...current, ...update }));
  }

  function patchEditingForm(update: Partial<FormState>) {
    setEditingForm((current) => ({ ...current, ...update }));
  }

  function updateRelatedLink(
    mode: 'create' | 'edit',
    index: number,
    field: keyof FaqRelatedLinkInput,
    value: string,
  ) {
    const updater = mode === 'create' ? setForm : setEditingForm;
    updater((current) => ({
      ...current,
      relatedLinks: current.relatedLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [field]: value } : link,
      ),
    }));
  }

  function formatBody(mode: 'create' | 'edit', action: RichTextAction) {
    const source = mode === 'create' ? form : editingForm;
    const textarea = bodyRef.current;
    const start = textarea?.selectionStart ?? source.body.length;
    const end = textarea?.selectionEnd ?? source.body.length;
    const selectedText = source.body.slice(start, end);
    const replacement = richTextReplacement(action, selectedText);
    const body = `${source.body.slice(0, start)}${replacement}${source.body.slice(end)}`;

    if (mode === 'create') {
      patchForm({ body });
    } else {
      patchEditingForm({ body });
    }
  }

  function beginEdit(item: ManagedContentItemSummary) {
    setEditingId(item.id);
    setEditingForm(formFromItem(item));
    setError('');
    setNotice('');
  }

  async function submitItem(mode: 'create' | 'edit') {
    setSaving(true);
    setError('');
    setNotice('');
    const payload = mode === 'create' ? resolvedCreateForm : resolvedEditingForm;
    const url = mode === 'create' ? endpoint : `${endpoint}/${editingId}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ManagedContentItemResponse;
      if (!response.ok) {
        throw new Error(result.message ?? `Unable to save ${singularLabel.toLowerCase()}.`);
      }
      setNotice(result.message ?? `Saved ${result.item?.title ?? singularLabel.toLowerCase()}.`);
      if (mode === 'create') {
        setForm(emptyForm(categories[0]?.name ?? ''));
      } else {
        setEditingId('');
      }
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : `Unable to save ${singularLabel.toLowerCase()}.`,
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(item: ManagedContentItemSummary) {
    setSaving(true);
    setError('');
    setNotice('');

    try {
      const response = await fetch(`${endpoint}/${item.id}`, { method: 'DELETE' });
      const result = (await response.json()) as ManagedContentItemResponse;
      if (!response.ok) {
        throw new Error(result.message ?? `Unable to delete ${singularLabel.toLowerCase()}.`);
      }
      setNotice(result.message ?? `Deleted ${item.title}.`);
      if (editingId === item.id) {
        setEditingId('');
      }
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : `Unable to delete ${singularLabel.toLowerCase()}.`,
      );
    } finally {
      setSaving(false);
    }
  }

  function renderFields(mode: 'create' | 'edit') {
    const current = mode === 'create' ? form : editingForm;
    const resolved = mode === 'create' ? resolvedCreateForm : resolvedEditingForm;
    const update = mode === 'create' ? patchForm : patchEditingForm;

    return (
      <>
        <div className="grid gap-4 lg:grid-cols-2">
          <label>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
              Category
            </span>
            <select
              value={current.category}
              onChange={(event) => update({ category: event.target.value })}
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
              Custom category
            </span>
            <input
              value={current.category}
              onChange={(event) => update({ category: event.target.value })}
              placeholder="Privacy"
              maxLength={120}
              className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
            />
          </label>
          <label>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
              Title
            </span>
            <input
              value={current.title}
              onChange={(event) => update({ title: event.target.value })}
              placeholder={`${singularLabel} title`}
              maxLength={300}
              className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
            />
          </label>
          <label>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
              Slug
            </span>
            <input
              value={resolved.slug}
              onChange={(event) => update({ slug: slugify(event.target.value) })}
              maxLength={160}
              className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
            />
          </label>
        </div>

        <div className="mt-4 rounded-lg border border-admin-border bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Publishing
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
                Status
              </span>
              <select
                value={current.status}
                onChange={(event) => update({ status: event.target.value as FaqPublishStatus })}
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
            <label>
              <span className="flex justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
                SEO title
                <span>{current.seoTitle.length}/60</span>
              </span>
              <input
                value={current.seoTitle}
                onChange={(event) => update({ seoTitle: event.target.value.slice(0, 60) })}
                maxLength={60}
                className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="flex justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
              Meta description
              <span>{current.metaDescription.length}/160</span>
            </span>
            <textarea
              value={current.metaDescription}
              onChange={(event) => update({ metaDescription: event.target.value.slice(0, 160) })}
              maxLength={160}
              className="mt-2 min-h-20 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Rich-text body
          </span>
          <div className="mt-2">
            <RichTextToolbar onFormat={(action) => formatBody(mode, action)} />
          </div>
          <textarea
            ref={bodyRef}
            value={current.body}
            onChange={(event) => update({ body: event.target.value })}
            placeholder={`Write the ${singularLabel.toLowerCase()} guests should see...`}
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
              value={current.displayOrder}
              onChange={(event) => update({ displayOrder: Number(event.target.value) })}
              className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
            />
          </label>

          <fieldset>
            <legend className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
              Related links
            </legend>
            <div className="mt-2 grid gap-2">
              {current.relatedLinks.map((link, index) => (
                <div key={index} className="grid gap-2 md:grid-cols-[minmax(10rem,0.8fr)_1fr]">
                  <input
                    value={link.label}
                    onChange={(event) =>
                      updateRelatedLink(mode, index, 'label', event.target.value)
                    }
                    placeholder="Link label"
                    maxLength={120}
                    className="h-10 rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
                  />
                  <input
                    value={link.url}
                    onChange={(event) => updateRelatedLink(mode, index, 'url', event.target.value)}
                    placeholder="https://..."
                    maxLength={2000}
                    className="h-10 rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
                  />
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </>
    );
  }

  return (
    <section className="mt-6 space-y-5">
      <div className="rounded-xl border border-admin-border bg-cream-alt/60 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
              New {singularLabel}
            </p>
            <h3 className="mt-1 font-serif text-2xl text-forest-900">Add {singularLabel}</h3>
            <p className="mt-2 text-sm text-admin-muted">
              Create and publish {label.toLowerCase()} with category, slug, SEO, and rich text.
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-admin-muted">
            {resolvedCreateForm.status}
          </span>
        </div>

        <div className="mt-5">{renderFields('create')}</div>

        <button
          type="button"
          onClick={() => void submitItem('create')}
          disabled={
            saving || !resolvedCreateForm.category || !form.title.trim() || !form.body.trim()
          }
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Plus aria-hidden="true" className="size-4" />
          )}
          Add {singularLabel}
        </button>
      </div>

      {error ? <p className="text-sm font-semibold text-admin-danger">{error}</p> : null}
      {notice ? <p className="text-sm font-semibold text-admin-success">{notice}</p> : null}

      <div className="rounded-xl border border-admin-border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
              Existing {label}
            </p>
            <h3 className="mt-1 font-serif text-2xl text-forest-900">{label} library</h3>
          </div>
          <span className="rounded-full bg-cream-alt px-3 py-1 text-xs font-bold text-admin-muted">
            {items.length} items
          </span>
        </div>

        {items.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-admin-border bg-cream-alt p-4 text-sm text-admin-muted">
            No {label.toLowerCase()} have been created yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-admin-border bg-cream-alt/50 p-4"
              >
                {editingId === item.id ? (
                  <>
                    {renderFields('edit')}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void submitItem('edit')}
                        disabled={
                          saving ||
                          !resolvedEditingForm.category ||
                          !editingForm.title.trim() ||
                          !editingForm.body.trim()
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                        ) : (
                          <Pencil aria-hidden="true" className="size-4" />
                        )}
                        Save changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId('')}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-admin-border bg-white px-4 text-sm font-bold text-admin-muted hover:border-admin-accent hover:text-admin-accent"
                      >
                        <X aria-hidden="true" className="size-4" />
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-serif text-xl text-forest-900">{item.title}</h4>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-admin-muted">
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-admin-muted">
                        {item.category} | /{item.slug} | order {item.displayOrder} |{' '}
                        {item.revisionCount} revisions
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-admin-muted">
                        {bodyPreview(item.body)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => beginEdit(item)}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-admin-border bg-white px-3 text-sm font-bold text-admin-muted hover:border-admin-accent hover:text-admin-accent"
                      >
                        <Pencil aria-hidden="true" className="size-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteItem(item)}
                        disabled={saving}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-admin-border bg-white px-3 text-sm font-bold text-admin-danger hover:border-admin-danger disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
