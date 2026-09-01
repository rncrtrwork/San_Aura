'use client';

import { LoaderCircle, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import type {
  ContentPageSlug,
  ContentSectionDetail,
  ContentSectionMutationResponse,
  RichTextSectionMutationRequest,
} from '@/lib/contentManager';
import { richTextReplacement, type RichTextAction } from '@/lib/richTextToolbar';
import { RichTextToolbar } from '@/components/admin/RichTextToolbar';

type RichTextSectionEditorProps = {
  pageSlug: ContentPageSlug;
  selectedSection: ContentSectionDetail | null;
};

export function RichTextSectionEditor({ pageSlug, selectedSection }: RichTextSectionEditorProps) {
  const router = useRouter();
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const selectedRichText = selectedSection?.type === 'richText' ? selectedSection.richText : null;
  const [sectionKey, setSectionKey] = useState(
    selectedSection?.type === 'richText' ? selectedSection.key : '',
  );
  const [body, setBody] = useState(selectedRichText?.body ?? '');
  const [active, setActive] = useState(
    selectedSection?.type === 'richText' ? selectedSection.active : true,
  );
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  function formatBody(action: RichTextAction) {
    const textarea = bodyRef.current;
    const start = textarea?.selectionStart ?? body.length;
    const end = textarea?.selectionEnd ?? body.length;
    const selectedText = body.slice(start, end);
    const replacement = richTextReplacement(action, selectedText);
    setBody(`${body.slice(0, start)}${replacement}${body.slice(end)}`);
  }

  async function saveRichTextSection() {
    setSaving(true);
    setError('');
    setNotice('');
    const payload: RichTextSectionMutationRequest = {
      sectionKey,
      body,
      active,
    };

    try {
      const response = await fetch(`/api/admin/content/pages/${pageSlug}/sections/rich-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ContentSectionMutationResponse;
      if (!response.ok) {
        throw new Error(result.message ?? 'Unable to save rich text section.');
      }
      setSectionKey(result.section?.key ?? sectionKey);
      setNotice(result.message ?? 'Rich text section saved.');
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Unable to save rich text section.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-admin-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            Rich Text Editor
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">
            {selectedRichText ? 'Edit rich text section' : 'Add rich text section'}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-admin-muted">
            Write reusable public-page copy blocks with lightweight formatting.
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-full bg-cream-alt px-3 py-1 text-xs font-bold text-admin-muted">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="size-4 rounded border-admin-border text-admin-accent"
          />
          Active
        </label>
      </div>

      <label className="mt-5 block">
        <span className="flex justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
          Body
          <span>{body.length}/50000</span>
        </span>
        <div className="mt-2">
          <RichTextToolbar onFormat={formatBody} />
        </div>
        <textarea
          ref={bodyRef}
          value={body}
          onChange={(event) => setBody(event.target.value.slice(0, 50000))}
          placeholder="Write the section copy..."
          maxLength={50000}
          className="min-h-44 w-full rounded-b-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900"
        />
      </label>

      <button
        type="button"
        onClick={() => void saveRichTextSection()}
        disabled={saving || !body.trim()}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Save aria-hidden="true" className="size-4" />
        )}
        Save rich text
      </button>

      {error ? <p className="mt-3 text-sm font-semibold text-admin-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm font-semibold text-admin-success">{notice}</p> : null}
    </section>
  );
}
