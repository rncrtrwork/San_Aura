'use client';

import { Copy, GripVertical, LoaderCircle, Pencil, Power, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type {
  ContentPageSlug,
  ContentSectionMutationResponse,
  ContentSectionOrderResponse,
  ContentSectionSummary,
} from '@/lib/contentManager';

type PageSectionListProps = {
  pageSlug: ContentPageSlug;
  pageExists: boolean;
  sections: ContentSectionSummary[];
  selectedSectionKey: string;
};

function reorderKeys(keys: string[], fromKey: string, toKey: string): string[] {
  const fromIndex = keys.indexOf(fromKey);
  const toIndex = keys.indexOf(toKey);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return keys;

  const nextKeys = keys.filter((key) => key !== fromKey);
  nextKeys.splice(toIndex, 0, fromKey);
  return nextKeys;
}

function sectionEditHref(pageSlug: ContentPageSlug, sectionKey: string): string {
  const params = new URLSearchParams({ page: pageSlug, section: sectionKey });
  if (pageSlug === 'home') params.delete('page');
  const query = params.toString();
  return query ? `/admin/content?${query}` : '/admin/content';
}

export function PageSectionList({
  pageSlug,
  pageExists,
  sections,
  selectedSectionKey,
}: PageSectionListProps) {
  const router = useRouter();
  const [orderedKeys, setOrderedKeys] = useState(() => sections.map((section) => section.key));
  const [dragKey, setDragKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const sectionsByKey = useMemo(
    () => new Map(sections.map((section) => [section.key, section])),
    [sections],
  );
  const orderedSections = orderedKeys.flatMap((key) => {
    const section = sectionsByKey.get(key);
    return section ? [section] : [];
  });
  const orderChanged = orderedKeys.join('|') !== sections.map((section) => section.key).join('|');
  const endpoint = `/api/admin/content/pages/${pageSlug}/sections`;

  function clearMessages() {
    setNotice('');
    setError('');
  }

  async function saveOrder(keys = orderedKeys) {
    setSaving(true);
    clearMessages();

    try {
      const response = await fetch(`${endpoint}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionKeys: keys }),
      });
      const result = (await response.json()) as ContentSectionOrderResponse;
      if (!response.ok) {
        throw new Error(result.message ?? 'Unable to save section order.');
      }
      setNotice(result.message ?? 'Section order saved.');
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save section order.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleSection(section: ContentSectionSummary) {
    setSaving(true);
    clearMessages();

    try {
      const response = await fetch(`${endpoint}/${section.key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !section.active }),
      });
      const result = (await response.json()) as ContentSectionMutationResponse;
      if (!response.ok) {
        throw new Error(result.message ?? 'Unable to update section status.');
      }
      setNotice(result.message ?? 'Section status saved.');
      router.refresh();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error ? toggleError.message : 'Unable to update section status.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function duplicateSection(section: ContentSectionSummary) {
    setSaving(true);
    clearMessages();

    try {
      const response = await fetch(`${endpoint}/${section.key}/duplicate`, { method: 'POST' });
      const result = (await response.json()) as ContentSectionMutationResponse;
      if (!response.ok) {
        throw new Error(result.message ?? 'Unable to duplicate section.');
      }
      setNotice(result.message ?? 'Section duplicated.');
      router.refresh();
    } catch (duplicateError) {
      setError(
        duplicateError instanceof Error ? duplicateError.message : 'Unable to duplicate section.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteSection(section: ContentSectionSummary) {
    setSaving(true);
    clearMessages();

    try {
      const response = await fetch(`${endpoint}/${section.key}`, { method: 'DELETE' });
      const result = (await response.json()) as ContentSectionMutationResponse;
      if (!response.ok) {
        throw new Error(result.message ?? 'Unable to delete section.');
      }
      setNotice(result.message ?? 'Section deleted.');
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete section.');
    } finally {
      setSaving(false);
    }
  }

  function moveSection(sectionKey: string, direction: -1 | 1) {
    const index = orderedKeys.indexOf(sectionKey);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= orderedKeys.length) return;
    const nextKeys = [...orderedKeys];
    const [section] = nextKeys.splice(index, 1);
    if (!section) return;
    nextKeys.splice(nextIndex, 0, section);
    setOrderedKeys(nextKeys);
  }

  return (
    <section className="mt-6 rounded-xl border border-admin-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            Page Sections
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">Section builder</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-admin-muted">
            Reorder content blocks, toggle website visibility, or select a section for editing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void saveOrder()}
          disabled={!pageExists || saving || !orderChanged}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <GripVertical aria-hidden="true" className="size-4" />
          )}
          Save order
        </button>
      </div>

      {!pageExists ? (
        <p className="mt-4 rounded-lg border border-dashed border-admin-border bg-cream-alt p-4 text-sm text-admin-muted">
          This page has not been created yet. Section controls unlock after the page exists.
        </p>
      ) : sections.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-admin-border bg-cream-alt p-4 text-sm text-admin-muted">
          No sections have been added to this page yet.
        </p>
      ) : (
        <ol className="mt-4 space-y-3">
          {orderedSections.map((section, index) => {
            const selected = section.key === selectedSectionKey;

            return (
              <li
                key={section.key}
                draggable={sections.length > 1}
                onDragStart={() => setDragKey(section.key)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  const nextKeys = reorderKeys(orderedKeys, dragKey, section.key);
                  setOrderedKeys(nextKeys);
                  setDragKey('');
                }}
                className={`rounded-xl border p-4 ${
                  selected ? 'border-admin-accent bg-cream-alt' : 'border-admin-border bg-white'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <GripVertical aria-hidden="true" className="size-4 text-admin-muted" />
                      <span className="rounded-full bg-cream-alt px-2 py-0.5 text-xs font-bold text-admin-muted">
                        {index + 1}
                      </span>
                      <h4 className="font-serif text-xl text-forest-900">{section.label}</h4>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-admin-muted">
                        {section.type}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          section.active
                            ? 'bg-admin-success/10 text-admin-success'
                            : 'bg-admin-danger/10 text-admin-danger'
                        }`}
                      >
                        {section.active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-admin-muted">Section key: {section.key}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => moveSection(section.key, -1)}
                      disabled={saving || index === 0}
                      className="h-9 rounded-lg border border-admin-border bg-white px-3 text-xs font-bold text-admin-muted hover:border-admin-accent hover:text-admin-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(section.key, 1)}
                      disabled={saving || index === orderedSections.length - 1}
                      className="h-9 rounded-lg border border-admin-border bg-white px-3 text-xs font-bold text-admin-muted hover:border-admin-accent hover:text-admin-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Down
                    </button>
                    <a
                      href={sectionEditHref(pageSlug, section.key)}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-admin-border bg-white px-3 text-xs font-bold text-admin-muted hover:border-admin-accent hover:text-admin-accent"
                    >
                      <Pencil aria-hidden="true" className="size-3.5" />
                      Edit
                    </a>
                    <button
                      type="button"
                      onClick={() => void toggleSection(section)}
                      disabled={saving}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-admin-border bg-white px-3 text-xs font-bold text-admin-muted hover:border-admin-accent hover:text-admin-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Power aria-hidden="true" className="size-3.5" />
                      {section.active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void duplicateSection(section)}
                      disabled={saving}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-admin-border bg-white px-3 text-xs font-bold text-admin-muted hover:border-admin-accent hover:text-admin-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Copy aria-hidden="true" className="size-3.5" />
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteSection(section)}
                      disabled={saving}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-admin-border bg-white px-3 text-xs font-bold text-admin-danger hover:border-admin-danger disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 aria-hidden="true" className="size-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {error ? <p className="mt-3 text-sm font-semibold text-admin-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm font-semibold text-admin-success">{notice}</p> : null}
    </section>
  );
}
