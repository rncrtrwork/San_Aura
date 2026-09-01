'use client';

import { LoaderCircle, Plus, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type {
  ContentSectionDetail,
  ContentSectionMutationResponse,
  ContentTimelineItem,
  TimelineSectionMutationRequest,
} from '@/lib/contentManager';

type TimelineSectionEditorProps = {
  pageSlug: string;
  selectedSection: ContentSectionDetail | null;
};

const emptyTimelineItem: ContentTimelineItem = {
  year: '',
  title: '',
  description: '',
};

export function TimelineSectionEditor({ pageSlug, selectedSection }: TimelineSectionEditorProps) {
  const router = useRouter();
  const selectedTimeline = selectedSection?.type === 'timeline' ? selectedSection.timeline : null;
  const [sectionKey, setSectionKey] = useState(
    selectedSection?.type === 'timeline' ? selectedSection.key : '',
  );
  const [sectionLabel, setSectionLabel] = useState(selectedTimeline?.sectionLabel ?? 'Our History');
  const [backgroundColor, setBackgroundColor] = useState(
    selectedTimeline?.backgroundColor ?? 'ivory',
  );
  const [layout, setLayout] = useState(selectedTimeline?.layout ?? 'alternating');
  const [showOnNavigation, setShowOnNavigation] = useState(
    selectedTimeline?.showOnNavigation ?? true,
  );
  const [items, setItems] = useState<ContentTimelineItem[]>(
    selectedTimeline?.items.length ? selectedTimeline.items : [emptyTimelineItem],
  );
  const [active, setActive] = useState(
    selectedSection?.type === 'timeline' ? selectedSection.active : true,
  );
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  function updateItem(index: number, field: keyof ContentTimelineItem, value: string) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    );
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.length === 1
        ? [emptyTimelineItem]
        : current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function focusStayedInsideEditor(
    nextTarget: EventTarget | null,
    currentTarget: HTMLElement,
  ): boolean {
    return nextTarget instanceof Node && currentTarget.contains(nextTarget);
  }

  function timelineReady(): boolean {
    return (
      Boolean(sectionLabel.trim()) &&
      items.some((item) => item.year.trim() || item.title.trim() || item.description.trim()) &&
      items
        .filter((item) => item.year.trim() || item.title.trim() || item.description.trim())
        .every((item) => item.year.trim() && item.title.trim() && item.description.trim())
    );
  }

  async function saveTimelineSection() {
    setSaving(true);
    setError('');
    setNotice('');
    const payload: TimelineSectionMutationRequest = {
      sectionKey,
      sectionLabel,
      backgroundColor,
      layout,
      showOnNavigation,
      items,
      active,
    };

    try {
      const response = await fetch(`/api/admin/content/pages/${pageSlug}/sections/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ContentSectionMutationResponse;
      if (!response.ok) {
        throw new Error(result.message ?? 'Unable to save timeline section.');
      }
      setSectionKey(result.section?.key ?? sectionKey);
      setNotice(result.message ?? 'Timeline section saved.');
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save timeline section.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      onBlur={(event) => {
        if (!focusStayedInsideEditor(event.relatedTarget, event.currentTarget) && timelineReady()) {
          void saveTimelineSection();
        }
      }}
      className="mt-6 rounded-xl border border-admin-border bg-cream-alt/70 p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            Timeline Editor
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">
            {selectedTimeline ? 'Edit timeline section' : 'Add timeline section'}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-admin-muted">
            Build chronological content for the History page or story-driven website sections.
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-admin-muted">
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
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
          Section label
        </span>
        <input
          value={sectionLabel}
          onChange={(event) => setSectionLabel(event.target.value.slice(0, 120))}
          placeholder="Our History"
          maxLength={120}
          className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
        />
      </label>

      <div className="mt-5 grid gap-4 rounded-xl border border-admin-border bg-white p-4 lg:grid-cols-3">
        <label>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Background color
          </span>
          <input
            value={backgroundColor}
            onChange={(event) => setBackgroundColor(event.target.value.slice(0, 30))}
            placeholder="ivory"
            maxLength={30}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          />
        </label>
        <label>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Layout
          </span>
          <select
            value={layout}
            onChange={(event) =>
              setLayout(event.target.value === 'stacked' ? 'stacked' : 'alternating')
            }
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          >
            <option value="alternating">Alternating</option>
            <option value="stacked">Stacked</option>
          </select>
        </label>
        <label className="flex items-start gap-3 rounded-lg bg-cream-alt p-3 text-sm text-forest-900">
          <input
            type="checkbox"
            checked={showOnNavigation}
            onChange={(event) => setShowOnNavigation(event.target.checked)}
            className="mt-1 size-4 rounded border-admin-border text-admin-accent"
          />
          <span>
            <span className="font-bold">Show on navigation</span>
            <span className="mt-1 block text-xs leading-relaxed text-admin-muted">
              Surface this timeline section in page-level navigation anchors.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <fieldset key={index} className="rounded-xl border border-admin-border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <legend className="text-sm font-bold text-forest-900">
                Timeline item {index + 1}
              </legend>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-admin-border px-3 text-xs font-bold text-admin-danger hover:border-admin-danger"
              >
                <Trash2 aria-hidden="true" className="size-3.5" />
                Remove
              </button>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[8rem_minmax(0,1fr)]">
              <label>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
                  Year
                </span>
                <input
                  value={item.year}
                  onChange={(event) => updateItem(index, 'year', event.target.value.slice(0, 20))}
                  placeholder="1998"
                  maxLength={20}
                  className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
                />
              </label>
              <label>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
                  Title
                </span>
                <input
                  value={item.title}
                  onChange={(event) => updateItem(index, 'title', event.target.value.slice(0, 200))}
                  placeholder="Sun Aura welcomes its first guests"
                  maxLength={200}
                  className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
                />
              </label>
              <label className="lg:col-span-2">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
                  Description
                </span>
                <textarea
                  value={item.description}
                  onChange={(event) =>
                    updateItem(index, 'description', event.target.value.slice(0, 5000))
                  }
                  maxLength={5000}
                  className="mt-2 min-h-24 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-forest-900"
                />
              </label>
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setItems((current) => [...current, emptyTimelineItem])}
          disabled={saving || items.length >= 20}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-admin-sidebar px-4 text-sm font-bold text-admin-sidebar hover:bg-admin-sidebar hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add Item
        </button>
        <button
          type="button"
          onClick={() => void saveTimelineSection()}
          disabled={saving || !timelineReady()}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          Save timeline
        </button>
      </div>

      {error ? <p className="mt-3 text-sm font-semibold text-admin-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm font-semibold text-admin-success">{notice}</p> : null}
    </section>
  );
}
