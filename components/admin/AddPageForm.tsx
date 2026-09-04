'use client';

import { LoaderCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ContentPageCreateRequest, ContentPageCreateResponse } from '@/lib/contentManager';
import { CONTENT_PAGE_PUBLISH_STATUSES, normalizeContentPageSlug } from '@/lib/contentManager';

function slugify(value: string): string {
  return normalizeContentPageSlug(value);
}

export function AddPageForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [navLabel, setNavLabel] = useState('');
  const [navVisibility, setNavVisibility] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [publishStatus, setPublishStatus] =
    useState<ContentPageCreateRequest['publishStatus']>('draft');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const resolvedSlug = useMemo(() => slug || slugify(title), [slug, title]);

  async function createPage() {
    setSaving(true);
    setError('');
    setNotice('');
    const payload: ContentPageCreateRequest = {
      title,
      slug: resolvedSlug,
      navLabel,
      navVisibility,
      seoTitle,
      metaDescription,
      publishStatus,
    };

    try {
      const response = await fetch('/api/admin/content/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ContentPageCreateResponse;
      if (!response.ok || !result.page) {
        throw new Error(result.message ?? 'Unable to create content page.');
      }
      setTitle('');
      setSlug('');
      setNavLabel('');
      setSeoTitle('');
      setMetaDescription('');
      setPublishStatus('draft');
      setNotice(result.message ?? 'Content page created.');
      router.push(`/admin/content?page=${result.page.slug}`);
      router.refresh();
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : 'Unable to create content page.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-5 rounded-xl border border-admin-border bg-cream-alt/70 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">Add Page</p>
      <div className="mt-3 grid gap-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Page title"
          maxLength={200}
          className="h-10 rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
        />
        <input
          value={resolvedSlug}
          onChange={(event) => setSlug(slugify(event.target.value))}
          placeholder="page-slug"
          maxLength={160}
          className="h-10 rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
        />
        <input
          value={navLabel}
          onChange={(event) => setNavLabel(event.target.value.slice(0, 80))}
          placeholder="Navigation label"
          maxLength={80}
          className="h-10 rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
        />
        <select
          value={publishStatus}
          onChange={(event) =>
            setPublishStatus(event.target.value as ContentPageCreateRequest['publishStatus'])
          }
          className="h-10 rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
        >
          {CONTENT_PAGE_PUBLISH_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase()}
              {status.slice(1)}
            </option>
          ))}
        </select>
        <label className="flex items-start gap-3 rounded-lg bg-white p-3 text-sm text-forest-900">
          <input
            type="checkbox"
            checked={navVisibility}
            onChange={(event) => setNavVisibility(event.target.checked)}
            className="mt-1 size-4 rounded border-admin-border text-admin-accent"
          />
          <span>
            <span className="font-bold">Show in navigation</span>
            <span className="mt-1 block text-xs text-admin-muted">
              Published pages with this enabled appear in the public site navigation.
            </span>
          </span>
        </label>
        <input
          value={seoTitle}
          onChange={(event) => setSeoTitle(event.target.value.slice(0, 60))}
          placeholder={`SEO title (${seoTitle.length}/60)`}
          maxLength={60}
          className="h-10 rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
        />
        <textarea
          value={metaDescription}
          onChange={(event) => setMetaDescription(event.target.value.slice(0, 160))}
          placeholder={`Meta description (${metaDescription.length}/160)`}
          maxLength={160}
          className="min-h-20 rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900"
        />
      </div>

      <button
        type="button"
        onClick={() => void createPage()}
        disabled={saving || !title.trim() || !resolvedSlug}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-admin-sidebar px-3 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Plus aria-hidden="true" className="size-4" />
        )}
        Add Page
      </button>

      {error ? <p className="mt-3 text-sm font-semibold text-admin-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm font-semibold text-admin-success">{notice}</p> : null}
    </section>
  );
}
