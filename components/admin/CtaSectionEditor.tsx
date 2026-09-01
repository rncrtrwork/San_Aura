'use client';

import { LoaderCircle, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type {
  ContentSectionDetail,
  ContentSectionMutationResponse,
  CtaSectionMutationRequest,
} from '@/lib/contentManager';

type CtaSectionEditorProps = {
  pageSlug: string;
  selectedSection: ContentSectionDetail | null;
};

export function CtaSectionEditor({ pageSlug, selectedSection }: CtaSectionEditorProps) {
  const router = useRouter();
  const selectedCta = selectedSection?.type === 'cta' ? selectedSection.cta : null;
  const [sectionKey, setSectionKey] = useState(
    selectedSection?.type === 'cta' ? selectedSection.key : '',
  );
  const [heading, setHeading] = useState(selectedCta?.heading ?? '');
  const [body, setBody] = useState(selectedCta?.body ?? '');
  const [buttonLabel, setButtonLabel] = useState(selectedCta?.buttonLabel ?? '');
  const [buttonUrl, setButtonUrl] = useState(selectedCta?.buttonUrl ?? '');
  const [active, setActive] = useState(
    selectedSection?.type === 'cta' ? selectedSection.active : true,
  );
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  function focusStayedInsideEditor(
    nextTarget: EventTarget | null,
    currentTarget: HTMLElement,
  ): boolean {
    return nextTarget instanceof Node && currentTarget.contains(nextTarget);
  }

  function ctaReady(): boolean {
    return Boolean(heading.trim() && buttonLabel.trim() && buttonUrl.trim());
  }

  async function saveCtaSection() {
    setSaving(true);
    setError('');
    setNotice('');
    const payload: CtaSectionMutationRequest = {
      sectionKey,
      heading,
      body,
      buttonLabel,
      buttonUrl,
      active,
    };

    try {
      const response = await fetch(`/api/admin/content/pages/${pageSlug}/sections/cta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ContentSectionMutationResponse;
      if (!response.ok) {
        throw new Error(result.message ?? 'Unable to save CTA section.');
      }
      setSectionKey(result.section?.key ?? sectionKey);
      setNotice(result.message ?? 'CTA section saved.');
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save CTA section.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      onBlur={(event) => {
        if (!focusStayedInsideEditor(event.relatedTarget, event.currentTarget) && ctaReady()) {
          void saveCtaSection();
        }
      }}
      className="mt-6 rounded-xl border border-admin-border bg-white p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            CTA Editor
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">
            {selectedCta ? 'Edit CTA section' : 'Add CTA section'}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-admin-muted">
            Create a focused call-to-action block for reservations, contact, events, or membership.
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

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="lg:col-span-2">
          <span className="flex justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Heading
            <span>{heading.length}/200</span>
          </span>
          <input
            value={heading}
            onChange={(event) => setHeading(event.target.value.slice(0, 200))}
            placeholder="Ready to plan your stay?"
            maxLength={200}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          />
        </label>
        <label className="lg:col-span-2">
          <span className="flex justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Body
            <span>{body.length}/3000</span>
          </span>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value.slice(0, 3000))}
            maxLength={3000}
            className="mt-2 min-h-24 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900"
          />
        </label>
        <label>
          <span className="flex justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Button label
            <span>{buttonLabel.length}/80</span>
          </span>
          <input
            value={buttonLabel}
            onChange={(event) => setButtonLabel(event.target.value.slice(0, 80))}
            placeholder="Book a Stay"
            maxLength={80}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          />
        </label>
        <label>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Button URL
          </span>
          <input
            value={buttonUrl}
            onChange={(event) => setButtonUrl(event.target.value.slice(0, 2000))}
            placeholder="/reservations"
            maxLength={2000}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => void saveCtaSection()}
        disabled={saving || !ctaReady()}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Save aria-hidden="true" className="size-4" />
        )}
        Save CTA
      </button>

      {error ? <p className="mt-3 text-sm font-semibold text-admin-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm font-semibold text-admin-success">{notice}</p> : null}
    </section>
  );
}
