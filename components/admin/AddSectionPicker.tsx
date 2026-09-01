import { FileImage, FileText, ListPlus, Milestone, MousePointerClick } from 'lucide-react';
import {
  CONTENT_EDITOR_SECTION_TYPES,
  type ContentEditorSectionType,
  type ContentPageSlug,
} from '@/lib/contentManager';

type AddSectionPickerProps = {
  pageSlug: ContentPageSlug;
  activeType: ContentEditorSectionType;
  editingSectionKey: string;
};

const sectionTypeLabels: Record<ContentEditorSectionType, string> = {
  hero: 'Hero',
  richText: 'Rich Text',
  timeline: 'Timeline',
  cta: 'CTA',
};

const sectionTypeDescriptions: Record<ContentEditorSectionType, string> = {
  hero: 'Large page intro with image and H1.',
  richText: 'Flexible formatted copy block.',
  timeline: 'Year-by-year story or history entries.',
  cta: 'Focused button-driven conversion block.',
};

const sectionTypeIcons = {
  hero: FileImage,
  richText: FileText,
  timeline: Milestone,
  cta: MousePointerClick,
} as const;

function pickerHref(pageSlug: ContentPageSlug, sectionType: ContentEditorSectionType): string {
  const params = new URLSearchParams({ sectionType });
  if (pageSlug !== 'home') params.set('page', pageSlug);
  const query = params.toString();
  return query ? `/admin/content?${query}` : '/admin/content';
}

export function AddSectionPicker({
  pageSlug,
  activeType,
  editingSectionKey,
}: AddSectionPickerProps) {
  return (
    <section className="mt-6 rounded-xl border border-admin-border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            Add Section
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">Choose a section type</h3>
          <p className="mt-2 max-w-2xl text-sm text-admin-muted">
            {editingSectionKey
              ? 'An existing section is selected; its matching editor is open below.'
              : 'Pick a block type to append new content to this page.'}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-cream-alt px-3 py-1 text-xs font-bold text-admin-muted">
          <ListPlus aria-hidden="true" className="size-4" />
          {CONTENT_EDITOR_SECTION_TYPES.length} types
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {CONTENT_EDITOR_SECTION_TYPES.map((sectionType) => {
          const active = sectionType === activeType;
          const Icon = sectionTypeIcons[sectionType];

          return (
            <a
              key={sectionType}
              href={pickerHref(pageSlug, sectionType)}
              aria-current={active && !editingSectionKey ? 'page' : undefined}
              className={`rounded-xl border p-4 ${
                active && !editingSectionKey
                  ? 'border-admin-accent bg-cream-alt text-forest-900'
                  : 'border-admin-border bg-white text-admin-muted hover:border-admin-accent/50 hover:text-forest-900'
              }`}
            >
              <span className="grid size-10 place-items-center rounded-full bg-cream-alt text-admin-accent">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span className="mt-3 block font-semibold">{sectionTypeLabels[sectionType]}</span>
              <span className="mt-1 block text-xs leading-relaxed">
                {sectionTypeDescriptions[sectionType]}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
